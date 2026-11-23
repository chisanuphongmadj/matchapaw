import type { ReactElement } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useLogout, useMe } from "../../features/auth/authApi";
import { useFavoriteStore } from "../../stores/favoriteStore";
import { useThemeStore } from "../../stores/themeStore";
import { useToastStore } from "../../stores/toastStore";
import { MenuIcon, MoonIcon, PawIcon, SunIcon } from "../ui/Icons";

interface NavItem {
  to: string;
  label: string;
  end: boolean;
}

export function Navbar(): ReactElement {
  const favoriteCount = useFavoriteStore((state) => state.ids.length);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggle);
  const showToast = useToastStore((state) => state.show);
  const { user, isLoggedIn, isAdmin } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();

  // เมนูที่เห็นขึ้นกับสิทธิ์: ผู้ใช้ที่ล็อกอินเห็น "คำขอของฉัน" เจ้าหน้าที่เห็น "จัดการระบบ"
  const links: NavItem[] = [
    { to: "/", label: "หน้าแรก", end: true },
    { to: "/pets", label: "หาน้อง", end: false },
    { to: "/favorites", label: "รายการโปรด", end: false },
    ...(isLoggedIn ? [{ to: "/my-requests", label: "คำขอของฉัน", end: false }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "จัดการระบบ", end: false }] : []),
  ];

  const handleLogout = (): void => {
    logout();
    showToast("info", "ออกจากระบบแล้ว");
    void navigate("/");
  };

  const renderLinks = (): ReactElement[] =>
    links.map((link) => (
      <li key={link.to}>
        <NavLink
          to={link.to}
          end={link.end}
          className={({ isActive }) => (isActive ? "menu-active font-semibold" : "")}
        >
          {link.label}
          {link.to === "/favorites" && favoriteCount > 0 && (
            <span className="badge badge-secondary badge-sm">{favoriteCount}</span>
          )}
        </NavLink>
      </li>
    ));

  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/85 backdrop-blur">
      <nav className="navbar mx-auto max-w-7xl px-4">
        <div className="navbar-start gap-1">
          {/* เมนูมือถือ */}
          <div className="dropdown lg:hidden">
            <button type="button" tabIndex={0} className="btn btn-ghost btn-square" aria-label="เปิดเมนู">
              <MenuIcon />
            </button>
            <ul tabIndex={0} className="menu dropdown-content z-50 mt-3 w-56 rounded-box bg-base-100 p-2 shadow-lg">
              {renderLinks()}
            </ul>
          </div>
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-content">
              <PawIcon className="size-5" />
            </span>
            <span>
              Match<span className="text-secondary">A</span>Paw
            </span>
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 px-1">{renderLinks()}</ul>
        </div>

        <div className="navbar-end gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={toggleTheme}
            aria-label={theme === "matchapaw" ? "เปลี่ยนเป็นโหมดมืด" : "เปลี่ยนเป็นโหมดสว่าง"}
          >
            {theme === "matchapaw" ? <MoonIcon /> : <SunIcon />}
          </button>

          {isLoggedIn ? (
            <div className="dropdown dropdown-end">
              <button type="button" tabIndex={0} className="btn btn-ghost btn-sm gap-2" aria-label="เมนูบัญชีผู้ใช้">
                <span className="grid size-7 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-content">
                  {user?.name.charAt(0) ?? "?"}
                </span>
                <span className="hidden max-w-32 truncate sm:inline">{user?.name ?? "..."}</span>
              </button>
              <ul tabIndex={0} className="menu dropdown-content z-50 mt-3 w-60 rounded-box bg-base-100 p-2 shadow-lg">
                <li className="menu-title">
                  <span className="truncate">{user?.email}</span>
                  {isAdmin && <span className="badge badge-primary badge-sm mt-1">เจ้าหน้าที่</span>}
                </li>
                <li>
                  <Link to="/my-requests">คำขอของฉัน</Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link to="/admin">จัดการระบบ</Link>
                  </li>
                )}
                <li>
                  <button type="button" onClick={handleLogout} className="text-error">
                    ออกจากระบบ
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
