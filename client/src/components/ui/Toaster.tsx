import type { ReactElement } from "react";
import { useToastStore, type ToastType } from "../../stores/toastStore";
import { XIcon } from "./Icons";

const alertClass: Record<ToastType, string> = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
};

/** แสดง toast ทั้งหมดจาก Zustand (toastStore) */
export function Toaster(): ReactElement {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="toast toast-end toast-bottom z-50" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} role="status" className={`alert ${alertClass[toast.type]} shadow-lg`}>
          <span>{toast.message}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle"
            aria-label="ปิดการแจ้งเตือน"
            onClick={() => dismiss(toast.id)}
          >
            <XIcon className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
