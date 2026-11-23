import { Navigate, createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import { RequireAuth } from "./features/auth/RequireAuth";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminPetFormPage } from "./pages/admin/AdminPetFormPage";
import { AdminPetsPage } from "./pages/admin/AdminPetsPage";
import { AdminRequestsPage } from "./pages/admin/AdminRequestsPage";
import { LoginPage, RegisterPage } from "./pages/auth/AuthPages";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HomePage } from "./pages/HomePage";
import { MyRequestsPage } from "./pages/MyRequestsPage";
import { NotFoundPage, RouteErrorPage } from "./pages/NotFoundPage";
import { PetDetailPage } from "./pages/PetDetailPage";
import { PetsPage } from "./pages/PetsPage";

/**
 * โครงสร้างเส้นทาง (React Router v7)
 *  /                       หน้าแรก
 *  /pets                   รายการสัตว์ (Master)
 *  /pets/:id               รายละเอียดสัตว์ (Dynamic Detail)
 *  /favorites              รายการโปรด
 *  /login, /register       เข้าสู่ระบบ / สมัครสมาชิก
 *  /my-requests            คำขอของฉัน             (ต้องล็อกอิน)
 *  /admin/pets             จัดการข้อมูลสัตว์       (เจ้าหน้าที่)
 *  /admin/pets/new         เพิ่มสัตว์              (เจ้าหน้าที่)
 *  /admin/pets/:id/edit    แก้ไขสัตว์              (เจ้าหน้าที่)
 *  /admin/requests         จัดการคำขอรับเลี้ยง      (เจ้าหน้าที่)
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "pets", element: <PetsPage /> },
      { path: "pets/:id", element: <PetDetailPage /> },
      { path: "favorites", element: <FavoritesPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        path: "my-requests",
        element: (
          <RequireAuth>
            <MyRequestsPage />
          </RequireAuth>
        ),
      },
      {
        path: "admin",
        element: (
          <RequireAuth role="ADMIN">
            <AdminLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <Navigate to="pets" replace /> },
          { path: "pets", element: <AdminPetsPage /> },
          { path: "pets/new", element: <AdminPetFormPage /> },
          { path: "pets/:id/edit", element: <AdminPetFormPage /> },
          { path: "requests", element: <AdminRequestsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
