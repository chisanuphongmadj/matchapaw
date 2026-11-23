import type { ReactElement } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** กล่องยืนยันก่อนทำรายการที่ย้อนกลับไม่ได้ (เช่น ลบข้อมูล) */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "ยืนยัน",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): ReactElement | null {
  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal-box">
        <h3 id="confirm-title" className="text-lg font-bold">
          {title}
        </h3>
        <p className="py-4 text-base-content/80">{message}</p>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isLoading}>
            ยกเลิก
          </button>
          <button type="button" className="btn btn-error" onClick={onConfirm} disabled={isLoading}>
            {isLoading && <span className="loading loading-spinner loading-sm" />}
            {confirmLabel}
          </button>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="ปิด" onClick={onCancel} />
    </div>
  );
}
