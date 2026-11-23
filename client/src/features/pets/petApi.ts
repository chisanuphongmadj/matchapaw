import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, toQueryString } from "../../lib/apiClient";
import { queryKeys, type PetQueryParams } from "../../lib/queryKeys";
import type { ApiList, ApiSuccess } from "../../types/api";
import type { Pet, PetDetail, PetInput } from "../../types/models";

// ---------------------------------------------------------------------------
// ฟังก์ชันเรียก API (React -> Express)
// ---------------------------------------------------------------------------
export const petApi = {
  list: (params: PetQueryParams): Promise<ApiList<Pet>> =>
    apiClient.get<ApiList<Pet>>(
      `/pets${toQueryString({
        search: params.search?.trim(),
        speciesId: params.speciesId,
        gender: params.gender,
        size: params.size,
        status: params.status,
        sort: params.sort,
        limit: params.limit,
        ids: params.ids?.join(","),
      })}`,
    ),
  get: async (id: number): Promise<PetDetail> =>
    (await apiClient.get<ApiSuccess<PetDetail>>(`/pets/${id}`)).data,
  create: async (input: PetInput): Promise<PetDetail> =>
    (await apiClient.post<ApiSuccess<PetDetail>>("/pets", input)).data,
  replace: async (id: number, input: PetInput): Promise<PetDetail> =>
    (await apiClient.put<ApiSuccess<PetDetail>>(`/pets/${id}`, input)).data,
  patch: async (id: number, input: Partial<PetInput>): Promise<PetDetail> =>
    (await apiClient.patch<ApiSuccess<PetDetail>>(`/pets/${id}`, input)).data,
  remove: (id: number): Promise<void> => apiClient.delete(`/pets/${id}`),
};

// ---------------------------------------------------------------------------
// Queries (อ่านข้อมูล)
// ---------------------------------------------------------------------------

/** รายการสัตว์ตามเงื่อนไข - เปลี่ยน params เมื่อไร จะดึงข้อมูลใหม่อัตโนมัติ */
export function usePets(params: PetQueryParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.pets.list(params),
    queryFn: () => petApi.list(params),
    placeholderData: keepPreviousData, // แสดงผลลัพธ์เดิมไว้ระหว่างโหลดชุดใหม่ (ไม่กระพริบ)
    enabled: options.enabled ?? true,
  });
}

/** รายละเอียดสัตว์ 1 ตัว */
export function usePet(id: number) {
  return useQuery({
    queryKey: queryKeys.pets.detail(id),
    queryFn: () => petApi.get(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

// ---------------------------------------------------------------------------
// Mutations (เพิ่ม/แก้ไข/ลบ) -> invalidateQueries เพื่อให้หน้าจออัปเดตทันที (Zero-Refresh)
// ---------------------------------------------------------------------------

function useInvalidatePetData() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
      queryClient.invalidateQueries({ queryKey: queryKeys.species }),
      queryClient.invalidateQueries({ queryKey: queryKeys.shelters }),
    ]);
}

export function useCreatePet() {
  const invalidate = useInvalidatePetData();
  return useMutation({
    mutationFn: petApi.create,
    onSuccess: invalidate,
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePetData();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PetInput }) => petApi.replace(id, input),
    onSuccess: (pet) => {
      queryClient.setQueryData(queryKeys.pets.detail(pet.id), pet);
      return invalidate();
    },
  });
}

export function usePatchPet() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePetData();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<PetInput> }) => petApi.patch(id, input),
    onSuccess: (pet) => {
      queryClient.setQueryData(queryKeys.pets.detail(pet.id), pet);
      return invalidate();
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePetData();
  return useMutation({
    mutationFn: petApi.remove,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.pets.detail(id) });
      // คำขอรับเลี้ยงของสัตว์ตัวนี้ถูกลบตาม (Cascade) จึงต้องโหลดรายการคำขอใหม่ด้วย
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      return invalidate();
    },
  });
}
