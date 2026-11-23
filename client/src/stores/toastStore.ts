import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

/** Client State: ข้อความแจ้งเตือนมุมจอ (หายเองใน 3.5 วินาที) */
interface ToastState {
  toasts: Toast[];
  show: (type: ToastType, message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  show: (type, message) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => get().dismiss(id), 3500);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
