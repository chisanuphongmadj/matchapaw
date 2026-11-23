import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./apiClient";

/**
 * TanStack Query = Server State (ข้อมูลจากฐานข้อมูล)
 * - staleTime 30 วิ: ข้อมูลถือว่าสดใหม่ ไม่ยิง API ซ้ำถ้าเพิ่งโหลดไป
 * - ไม่ retry เมื่อเป็น error ฝั่งผู้ใช้ (4xx) เช่น 404 ไม่พบข้อมูล
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
