import { PetStatus, Prisma, RequestStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { notifyRequestDecision, notifyRequestReceived } from "../lib/notifications";
import { prisma } from "../lib/prisma";
import { currentUser } from "../middlewares/auth";
import type { ApiList, ApiSuccess } from "../types/api";
import { HttpError } from "../utils/HttpError";
import { parseId, parseWith } from "../utils/validate";
import {
  adoptionRequestCreateSchema,
  adoptionRequestQuerySchema,
  adoptionRequestStatusSchema,
} from "../validators/adoptionRequest.schema";

const requestInclude = {
  adopter: true,
  pet: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
      status: true,
      species: { select: { name: true, slug: true } },
    },
  },
} satisfies Prisma.AdoptionRequestInclude;

type AdoptionRequestItem = Prisma.AdoptionRequestGetPayload<{ include: typeof requestInclude }>;
type IdParams = { id: string };

/**
 * ปรับสถานะของสัตว์ให้ตรงกับคำขอรับเลี้ยงที่มีอยู่
 *   มีคำขอที่อนุมัติแล้ว  -> ADOPTED
 *   มีคำขอที่รอพิจารณา   -> PENDING
 *   ไม่มีเลย            -> AVAILABLE
 */
async function syncPetStatus(tx: Prisma.TransactionClient, petId: number): Promise<void> {
  const [approved, pending] = await Promise.all([
    tx.adoptionRequest.count({ where: { petId, status: RequestStatus.APPROVED } }),
    tx.adoptionRequest.count({ where: { petId, status: RequestStatus.PENDING } }),
  ]);
  const status =
    approved > 0 ? PetStatus.ADOPTED : pending > 0 ? PetStatus.PENDING : PetStatus.AVAILABLE;
  await tx.pet.update({ where: { id: petId }, data: { status } });
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

// GET /api/adoption-requests - รายการคำขอทั้งหมด (เจ้าหน้าที่) กรองด้วย ?status= หรือ ?petId=
export async function listRequests(
  req: Request,
  res: Response<ApiList<AdoptionRequestItem>>,
): Promise<void> {
  const query = parseWith(adoptionRequestQuerySchema, req.query);
  const where: Prisma.AdoptionRequestWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.petId) where.petId = query.petId;

  const requests = await prisma.adoptionRequest.findMany({
    where,
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: requests, meta: { total: requests.length } });
}

// GET /api/adoption-requests/mine - คำขอของผู้ใช้ที่ล็อกอินอยู่
export async function listMyRequests(
  req: Request,
  res: Response<ApiList<AdoptionRequestItem>>,
): Promise<void> {
  const user = currentUser(req);
  const requests = await prisma.adoptionRequest.findMany({
    where: { adopter: { userId: user.id } },
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: requests, meta: { total: requests.length } });
}

// POST /api/adoption-requests - ส่งคำขอรับเลี้ยง (ต้องล็อกอิน)
export async function createRequest(
  req: Request,
  res: Response<ApiSuccess<AdoptionRequestItem>>,
): Promise<void> {
  const user = currentUser(req);
  const body = parseWith(adoptionRequestCreateSchema, req.body);

  const pet = await prisma.pet.findUnique({
    where: { id: body.petId },
    select: { id: true, status: true },
  });
  if (!pet) throw new HttpError(404, "ไม่พบสัตว์ที่ต้องการรับเลี้ยง");
  if (pet.status === PetStatus.ADOPTED) {
    throw new HttpError(409, "น้องตัวนี้ได้บ้านใหม่แล้ว ไม่สามารถส่งคำขอได้");
  }

  let created: AdoptionRequestItem;
  try {
    created = await prisma.$transaction(async (tx) => {
      // ผู้รับเลี้ยงผูกกับบัญชีที่ล็อกอิน (ใช้อีเมลของบัญชี) มีแล้วอัปเดต ไม่มีสร้างใหม่
      const adopter = await tx.adopter.upsert({
        where: { email: user.email },
        update: { name: body.name, phone: body.phone, userId: user.id },
        create: { name: body.name, email: user.email, phone: body.phone, userId: user.id },
      });
      const request = await tx.adoptionRequest.create({
        data: { adopterId: adopter.id, petId: pet.id, message: body.message },
      });
      await syncPetStatus(tx, pet.id);
      return tx.adoptionRequest.findUniqueOrThrow({
        where: { id: request.id },
        include: requestInclude,
      });
    });
  } catch (error: unknown) {
    // @@unique([adopterId, petId]) ทำงาน: คนเดิมขอสัตว์ตัวเดิมซ้ำ
    if (isUniqueViolation(error)) {
      throw new HttpError(409, "คุณได้ส่งคำขอรับเลี้ยงน้องตัวนี้ไปแล้ว");
    }
    throw error;
  }

  res.status(201).json({ data: created });
  // ส่งอีเมลหลังตอบกลับแล้ว ผู้ใช้ไม่ต้องรอ (ไม่ได้ตั้งค่าอีเมลก็ข้ามไปเอง)
  void notifyRequestReceived(created);
}

// PATCH /api/adoption-requests/:id/status - อนุมัติ / ปฏิเสธ คำขอ (เจ้าหน้าที่)
export async function updateRequestStatus(
  req: Request<IdParams>,
  res: Response<ApiSuccess<AdoptionRequestItem>>,
): Promise<void> {
  const id = parseId(req.params.id);
  const { status } = parseWith(adoptionRequestStatusSchema, req.body);

  const existing = await prisma.adoptionRequest.findUnique({ where: { id }, select: { petId: true } });
  if (!existing) throw new HttpError(404, `ไม่พบคำขอรหัส ${id}`);

  const { updated, autoRejected } = await prisma.$transaction(async (tx) => {
    await tx.adoptionRequest.update({ where: { id }, data: { status } });

    let autoRejected: AdoptionRequestItem[] = [];
    if (status === RequestStatus.APPROVED) {
      // อนุมัติคนหนึ่งแล้ว คำขออื่นที่รออยู่ของสัตว์ตัวเดียวกันจะถูกปฏิเสธอัตโนมัติ
      const others = { petId: existing.petId, id: { not: id }, status: RequestStatus.PENDING };
      const ids = (await tx.adoptionRequest.findMany({ where: others, select: { id: true } })).map((r) => r.id);
      await tx.adoptionRequest.updateMany({ where: { id: { in: ids } }, data: { status: RequestStatus.REJECTED } });
      autoRejected = await tx.adoptionRequest.findMany({ where: { id: { in: ids } }, include: requestInclude });
    }

    await syncPetStatus(tx, existing.petId);
    const updated = await tx.adoptionRequest.findUniqueOrThrow({ where: { id }, include: requestInclude });
    return { updated, autoRejected };
  });

  res.json({ data: updated });
  for (const request of [updated, ...autoRejected]) void notifyRequestDecision(request);
}

// DELETE /api/adoption-requests/:id - ลบคำขอ (เจ้าหน้าที่)
export async function deleteRequest(req: Request<IdParams>, res: Response): Promise<void> {
  const id = parseId(req.params.id);
  await prisma.$transaction(async (tx) => {
    const removed = await tx.adoptionRequest.delete({ where: { id } });
    await syncPetStatus(tx, removed.petId);
  });
  res.status(204).end();
}
