import type { PetFilters, RequestStatus } from "../types/models";

/** พารามิเตอร์ค้นหาสัตว์ที่ส่งไปยัง GET /api/pets */
export type PetQueryParams = Partial<PetFilters> & {
  limit?: number;
  ids?: number[];
};

/**
 * รวม Query Key ไว้ที่เดียว เพื่อให้ invalidate ได้ถูกต้อง
 * เช่น invalidateQueries({ queryKey: queryKeys.pets.all }) จะล้าง cache ของ pets ทุก list/detail
 */
export const queryKeys = {
  pets: {
    all: ["pets"] as const,
    list: (params: PetQueryParams) => ["pets", "list", params] as const,
    detail: (id: number) => ["pets", "detail", id] as const,
  },
  requests: {
    all: ["adoption-requests"] as const,
    list: (status: RequestStatus | null) => ["adoption-requests", "list", status] as const,
    mine: ["adoption-requests", "mine"] as const,
  },
  me: ["auth", "me"] as const,
  species: ["species"] as const,
  shelters: ["shelters"] as const,
  stats: ["stats"] as const,
};
