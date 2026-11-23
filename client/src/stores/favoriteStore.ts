import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client State: รายการโปรด (Bookmarks)
 * เก็บเฉพาะ "รหัส" ของสัตว์ ไม่เก็บข้อมูลสัตว์ซ้ำ
 * (ข้อมูลจริงดึงจาก TanStack Query เสมอ = Single Source of Truth)
 * persist -> บันทึกลง localStorage อยู่ได้แม้ปิดเบราว์เซอร์
 */
interface FavoriteState {
  ids: number[];
  toggle: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id) ? state.ids.filter((x) => x !== id) : [...state.ids, id],
        })),
      remove: (id) => set((state) => ({ ids: state.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "matchapaw-favorites" },
  ),
);
