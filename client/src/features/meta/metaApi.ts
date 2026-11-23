import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { queryKeys } from "../../lib/queryKeys";
import type { ApiSuccess } from "../../types/api";
import type { Shelter, Species, Stats } from "../../types/models";

/** ชนิดสัตว์ - แทบไม่เปลี่ยน จึงตั้ง staleTime นาน 10 นาที */
export function useSpecies() {
  return useQuery({
    queryKey: queryKeys.species,
    queryFn: async () => (await apiClient.get<ApiSuccess<Species[]>>("/species")).data,
    staleTime: 10 * 60_000,
  });
}

/** บ้านพักพิง - ใช้ใน dropdown ของฟอร์ม */
export function useShelters() {
  return useQuery({
    queryKey: queryKeys.shelters,
    queryFn: async () => (await apiClient.get<ApiSuccess<Shelter[]>>("/shelters")).data,
    staleTime: 10 * 60_000,
  });
}

/** ตัวเลขสรุปในหน้าแรก */
export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => (await apiClient.get<ApiSuccess<Stats>>("/stats")).data,
  });
}
