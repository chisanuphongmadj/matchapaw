import type { ReactElement } from "react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { EmptyState } from "../components/ui/EmptyState";

export function NotFoundPage(): ReactElement {
  return (
    <EmptyState
      emoji="🐾"
      title="ไม่พบหน้าที่คุณต้องการ (404)"
      description="ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว"
      action={
        <Link to="/" className="btn btn-primary btn-sm">
          กลับหน้าแรก
        </Link>
      }
    />
  );
}

/** แสดงเมื่อเกิด error ระหว่าง render ของ Router (กันหน้าจอขาวทั้งหน้า) */
export function RouteErrorPage(): ReactElement {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";

  return (
    <div className="mx-auto max-w-xl p-8">
      <EmptyState
        emoji="😿"
        title="ขออภัย เกิดข้อผิดพลาด"
        description={message}
        action={
          <a href="/" className="btn btn-primary btn-sm">
            โหลดหน้าแรกใหม่
          </a>
        }
      />
    </div>
  );
}
