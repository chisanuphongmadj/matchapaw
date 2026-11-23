import type { ReactElement } from "react";
import { Link, NavLink } from "react-router";
import { useFavoriteStore } from "../../stores/favoriteStore";
import { useThemeStore } from "../../stores/themeStore";
import { MenuIcon, MoonIcon, PawIcon, SunIcon } from "../ui/Icons";

const links = [
  { to: "/", label: "หน้าแรก", end: true },
  { to: "/pets", label: "หาน้อง", end: false },
  { to: "/favorites", label: "รายการโปรด", end: false },
  { to: "/admin", label: "จัดการระบบ", end: false },
] as const;

export function Navbar(): ReactElement {
  const favoriteCount = useFavoriteStore((state) => state.ids.length);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggle);

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
          <Link to="/pets" className="btn btn-primary btn-sm hidden sm:inline-flex">
            รับเลี้ยงเลย
          </Link>
        </div>
      </nav>
    </header>
  );
}
