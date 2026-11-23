import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client State: token สำหรับยืนยันตัวตน (persist ลง localStorage = ล็อกอินค้างไว้ได้)
 * เก็บเฉพาะ token เท่านั้น ข้อมูลผู้ใช้ (ชื่อ, role) ดึงจาก GET /api/auth/me ผ่าน TanStack Query
 * -> ข้อมูลจาก Server ไม่ถูกเก็บซ้ำใน Zustand (Single Source of Truth)
 */
interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    { name: "matchapaw-auth" },
  ),
);
