import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import type { ApiList, ApiSuccess } from "../types/api";
import { HttpError } from "../utils/HttpError";
import { parseId, parseWith } from "../utils/validate";
import {
  petCreateSchema,
  petPatchSchema,
  petQuerySchema,
  type PetQuery,
} from "../validators/pet.schema";

// ---------------------------------------------------------------------------
// ข้อมูลที่ join มาด้วย (include) และ Type ที่ได้จาก Prisma
// ---------------------------------------------------------------------------
const petListInclude = {
  species: true,
  shelter: { select: { id: true, name: true, province: true } },
  _count: { select: { adoptionRequests: true } },
} satisfies Prisma.PetInclude;

const petDetailInclude = {
  species: true,
  shelter: true,
  _count: { select: { adoptionRequests: true } },
} satisfies Prisma.PetInclude;

type PetListItem = Prisma.PetGetPayload<{ include: typeof petListInclude }>;
type PetDetail = Prisma.PetGetPayload<{ include: typeof petDetailInclude }>;

type IdParams = { id: string };

const sortOptions: Record<PetQuery["sort"], Prisma.PetOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  name: { name: "asc" },
  age: { ageMonths: "asc" },
};

/** แปลง Query string เป็นเงื่อนไข where ของ Prisma */
function buildWhere(query: PetQuery): Prisma.PetWhereInput {
  const where: Prisma.PetWhereInput = {};
  if (query.speciesId) where.speciesId = query.speciesId;
  if (query.shelterId) where.shelterId = query.shelterId;
  if (query.gender) where.gender = query.gender;
  if (query.size) where.size = query.size;
  if (query.status) where.status = query.status;
  if (query.ids) where.id = { in: query.ids };
  if (query.search) {
    const contains = { contains: query.search, mode: "insensitive" } as const;
    where.OR = [{ name: contains }, { breed: contains }, { color: contains }];
  }
  return where;
}

// GET /api/pets - รายการสัตว์ทั้งหมด (ค้นหา/กรอง/เรียงลำดับได้)
export async function listPets(req: Request, res: Response<ApiList<PetListItem>>): Promise<void> {
  const query = parseWith(petQuerySchema, req.query);
  const where = buildWhere(query);

  const [pets, total] = await prisma.$transaction([
    prisma.pet.findMany({
      where,
      include: petListInclude,
      orderBy: [sortOptions[query.sort], { id: "asc" }],
      ...(query.limit ? { take: query.limit } : {}),
    }),
    prisma.pet.count({ where }),
  ]);

  res.json({ data: pets, meta: { total } });
}

// GET /api/pets/:id - รายละเอียดสัตว์ 1 ตัว
export async function getPet(req: Request<IdParams>, res: Response<ApiSuccess<PetDetail>>): Promise<void> {
  const id = parseId(req.params.id);
  const pet = await prisma.pet.findUnique({ where: { id }, include: petDetailInclude });
  if (!pet) throw new HttpError(404, `ไม่พบข้อมูลสัตว์รหัส ${id}`);
  res.json({ data: pet });
}

// POST /api/pets - เพิ่มสัตว์ใหม่
export async function createPet(req: Request, res: Response<ApiSuccess<PetDetail>>): Promise<void> {
  const body = parseWith(petCreateSchema, req.body);
  const pet = await prisma.pet.create({ data: body, include: petDetailInclude });
  res.status(201).json({ data: pet });
}

// PUT /api/pets/:id - แก้ไขข้อมูลทั้งหมด
export async function replacePet(req: Request<IdParams>, res: Response<ApiSuccess<PetDetail>>): Promise<void> {
  const id = parseId(req.params.id);
  const body = parseWith(petCreateSchema, req.body);
  const pet = await prisma.pet.update({ where: { id }, data: body, include: petDetailInclude });
  res.json({ data: pet });
}

// PATCH /api/pets/:id - แก้ไขบางฟิลด์ (เช่น เปลี่ยนสถานะ)
export async function updatePet(req: Request<IdParams>, res: Response<ApiSuccess<PetDetail>>): Promise<void> {
  const id = parseId(req.params.id);
  const body = parseWith(petPatchSchema, req.body);
  const pet = await prisma.pet.update({ where: { id }, data: body, include: petDetailInclude });
  res.json({ data: pet });
}

// DELETE /api/pets/:id - ลบสัตว์ (คำขอรับเลี้ยงที่เกี่ยวข้องถูกลบตามด้วย Cascade)
export async function deletePet(req: Request<IdParams>, res: Response): Promise<void> {
  const id = parseId(req.params.id);
  await prisma.pet.delete({ where: { id } });
  res.status(204).end();
}
