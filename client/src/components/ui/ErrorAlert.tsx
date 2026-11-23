import type { ReactElement } from "react";
import { getErrorMessage } from "../../lib/apiClient";
import { RefreshIcon, XIcon } from "./Icons";

interface ErrorAlertProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}

/** แสดงข้อผิดพลาดจากเครือข่าย/API พร้อมปุ่มลองใหม่ */
export function ErrorAlert({ error, title = "โหลดข้อมูลไม่สำเร็จ", onRetry }: ErrorAlertProps): ReactElement {
  return (
    <div role="alert" className="alert alert-error alert-soft items-start">
      <XIcon className="mt-0.5 size-5 shrink-0" />
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm">{getErrorMessage(error)}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn btn-sm" onClick={onRetry}>
          <RefreshIcon className="size-4" /> ลองใหม่
        </button>
      )}
    </div>
  );
}
