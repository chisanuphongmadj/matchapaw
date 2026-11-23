import { useEffect, type ReactElement } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { useThemeStore } from "../../stores/themeStore";
import { PawIcon } from "../ui/Icons";
import { Toaster } from "../ui/Toaster";
import { Navbar } from "./Navbar";

/** Layout หลัก: Navbar + เนื้อหาแต่ละหน้า (Outlet) + Footer */
export function RootLayout(): ReactElement {
  const theme = useThemeStore((state) => state.theme);

  // นำธีมจาก Zustand ไปใส่ที่ <html data-theme="..."> ของ DaisyUI
  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
  }, [theme]);

  return (
    <div className="flex min-h-screen flex-col bg-base-200/40 text-base-content">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-base-300 bg-base-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-base-content/70 sm:flex-row">
          <p className="flex items-center gap-2">
            <PawIcon className="size-4 text-primary" /> MatchAPaw · ทุกอุ้งเท้าสมควรมีบ้าน
          </p>
          <p>CS319 Final Project · Community &amp; Social Impact</p>
        </div>
      </footer>
      <Toaster />
      <ScrollRestoration />
    </div>
  );
}
