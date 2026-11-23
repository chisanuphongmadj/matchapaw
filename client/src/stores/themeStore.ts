import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "matchapaw" | "matchapaw-dark";

/** Client State: ธีมสว่าง/มืด (จำค่าไว้ใน localStorage) */
interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "matchapaw",
      toggle: () =>
        set((state) => ({ theme: state.theme === "matchapaw" ? "matchapaw-dark" : "matchapaw" })),
    }),
    { name: "matchapaw-theme" },
  ),
);
