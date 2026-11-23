import { PetStatus, Prisma, RequestStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import type { ApiSuccess } from "../types/api";

const withPetCount = { _count: { select: { pets: true } } } satisfies Prisma.SpeciesInclude;

type SpeciesItem = Prisma.SpeciesGetPayload<{ include: typeof withPetCount }>;
type ShelterItem = Prisma.ShelterGetPayload<{ include: typeof withPetCount }>;

interface Stats {
  totalPets: number;
  available: number;
  pending: number;
  adopted: number;
  shelters: number;
  pendingRequests: number;
}

// GET /api/species - ชนิดสัตว์ทั้งหมด (ใช้ทำตัวกรอง/dropdown)
export async function listSpecies(_req: Request, res: Response<ApiSuccess<SpeciesItem[]>>): Promise<void> {
  const species = await prisma.species.findMany({ include: withPetCount, orderBy: { id: "asc" } });
  res.json({ data: species });
}

// GET /api/shelters - บ้านพักพิงทั้งหมด
export async function listShelters(_req: Request, res: Response<ApiSuccess<ShelterItem[]>>): Promise<void> {
  const shelters = await prisma.shelter.findMany({ include: withPetCount, orderBy: { name: "asc" } });
  res.json({ data: shelters });
}

// GET /api/stats - ตัวเลขสรุปสำหรับหน้าแรก
export async function getStats(_req: Request, res: Response<ApiSuccess<Stats>>): Promise<void> {
  const [byStatus, shelters, pendingRequests] = await Promise.all([
    prisma.pet.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.shelter.count(),
    prisma.adoptionRequest.count({ where: { status: RequestStatus.PENDING } }),
  ]);

  const countOf = (status: PetStatus): number =>
    byStatus.find((row) => row.status === status)?._count._all ?? 0;

  const available = countOf(PetStatus.AVAILABLE);
  const pending = countOf(PetStatus.PENDING);
  const adopted = countOf(PetStatus.ADOPTED);

  res.json({
    data: {
      totalPets: available + pending + adopted,
      available,
      pending,
      adopted,
      shelters,
      pendingRequests,
    },
  });
}
