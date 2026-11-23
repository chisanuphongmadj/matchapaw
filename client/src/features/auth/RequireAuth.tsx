import type { ReactElement, ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { EmptyState } from "../../components/ui/EmptyState";
import type { Role } from "../../types/models";
import { useMe } from "./authApi";

interface RequireAuthProps {
  role?: Role;
  children: ReactNode;
}

/**
 * Route Guard: กันหน้าที่ต้องล็อกอิน
 * - ยังไม่ล็อกอิน -> พาไป /login แล้วกลับมาหน้าเดิมหลังล็อกอิน
 * - ล็อกอินแล้วแต่สิทธิ์ไม่พอ (เช่น USER เข้าหน้า Admin) -> แสดงหน้า 403
 * หมายเหตุ: นี่คือการกันฝั่งหน้าเว็บเท่านั้น ความปลอดภัยจริงอยู่ที่ Backend (requireAdmin)
 */
export function RequireAuth({ role, children }: RequireAuthProps): ReactElement {
  const { user, isLoggedIn, isLoading } = useMe();
  const location = useLocation();

  if (!isLoggedIn) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-24">
        <span className="loading loading-spinner loading-lg text-primary" aria-label="กำลังตรวจสอบสิทธิ์" />
      </div>
    );
  }

  if (role && user.role !== role) {
    return (
      <EmptyState
        emoji="🔒"
        title="หน้านี้สำหรับเจ้าหน้าที่เท่านั้น (403)"
        description={`คุณเข้าสู่ระบบในชื่อ ${user.name} ซึ่งไม่มีสิทธิ์เข้าหน้านี้`}
        action={
          <Link to="/" className="btn btn-primary btn-sm">
            กลับหน้าแรก
          </Link>
        }
      />
    );
  }

  return <>{children}</>;
}
