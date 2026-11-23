import type { ReactElement } from "react";
import { NavLink, Outlet } from "react-router";

const tabs = [
  { to: "/admin/pets", label: "จัดการข้อมูลสัตว์" },
  { to: "/admin/requests", label: "คำขอรับเลี้ยง" },
] as const;

/** Layout ของหน้าจัดการระบบ (Nested Route: /admin/*) */
export function AdminLayout(): ReactElement {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">ระบบจัดการ</h1>
          <p className="mt-1 text-base-content/70">สำหรับเจ้าหน้าที่บ้านพักพิงเท่านั้น จัดการข้อมูลสัตว์และพิจารณาคำขอรับเลี้ยง</p>
        </div>
      </header>

      <div role="tablist" className="tabs tabs-box w-fit">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            role="tab"
            className={({ isActive }) => `tab ${isActive ? "tab-active" : ""}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
