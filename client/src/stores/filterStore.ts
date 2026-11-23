import { create } from "zustand";
import type { PetFilters } from "../types/models";

/**
 * Client State: ตัวกรองในหน้าค้นหาสัตว์
 * ค่าในนี้ถูกนำไปเป็น queryKey ของ TanStack Query
 * -> เปลี่ยนตัวกรองเมื่อไร TanStack Query จะดึงข้อมูลชุดใหม่ให้อัตโนมัติ
 */
export const defaultFilters: PetFilters = {
  search: "",
  speciesId: null,
  gender: null,
  size: null,
  status: null,
  sort: "newest",
};

interface FilterState {
  filters: PetFilters;
  setFilter: <K extends keyof PetFilters>(key: K, value: PetFilters[K]) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
  filters: defaultFilters,
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  reset: () => set({ filters: defaultFilters }),
}));
