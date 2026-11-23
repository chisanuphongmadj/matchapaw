import { Navigate, createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminPetFormPage } from "./pages/admin/AdminPetFormPage";
import { AdminPetsPage } from "./pages/admin/AdminPetsPage";
import { AdminRequestsPage } from "./pages/admin/AdminRequestsPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage, RouteErrorPage } from "./pages/NotFoundPage";
import { PetDetailPage } from "./pages/PetDetailPage";
import { PetsPage } from "./pages/PetsPage";

/**
 * โครงสร้างเส้นทาง (React Router v7)
 *  /                       หน้าแรก
 *  /pets                   รายการสัตว์ (Master)
 *  /pets/:id               รายละเอียดสัตว์ (Dynamic Detail)
 *  /favorites              รายการโปรด
 *  /admin/pets             จัดการข้อมูลสัตว์
 *  /admin/pets/new         เพิ่มสัตว์
 *  /admin/pets/:id/edit    แก้ไขสัตว์
 *  /admin/requests         จัดการคำขอรับเลี้ยง
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
      {
        path: "admin",
        element: <AdminLayout />,
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
