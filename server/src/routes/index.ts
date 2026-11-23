import { Router } from "express";
import { getStats, listShelters, listSpecies } from "../controllers/meta.controller";
import { isEmailEnabled } from "../lib/mailer";
import { isStorageEnabled } from "../lib/storage";
import { authenticate } from "../middlewares/auth";
import adoptionRequestRoutes from "./adoptionRequest.routes";
import authRoutes from "./auth.routes";
import petRoutes from "./pet.routes";
import uploadRoutes from "./upload.routes";

/**
 * รวมทุกเส้นทางของ API (mount ที่ /api ใน app.ts)
 *  🔓 = ทุกคน · 👤 = ต้องล็อกอิน · 🛡️ = เจ้าหน้าที่ (ADMIN)
 *
 *  🔓 GET    /api/health
 *  🔓 GET    /api/stats · /api/species · /api/shelters
 *  🔓 POST   /api/auth/register · /api/auth/login
 *  👤 GET    /api/auth/me
 *  🔓 GET    /api/pets · /api/pets/:id
 *  🛡️ POST   /api/pets · PUT/PATCH/DELETE /api/pets/:id
 *  👤 GET    /api/adoption-requests/mine
 *  👤 POST   /api/adoption-requests
 *  🛡️ GET    /api/adoption-requests
 *  🛡️ PATCH  /api/adoption-requests/:id/status
 *  🛡️ DELETE /api/adoption-requests/:id
 *  🛡️ POST   /api/uploads/pet-image
 */
const router = Router();

// อ่าน token (ถ้ามี) ก่อนทุกเส้นทาง เพื่อให้ req.user พร้อมใช้
router.use(authenticate);

router.get("/health", (_req, res) => {
  res.json({
    data: {
      status: "ok",
      time: new Date().toISOString(),
      features: { email: isEmailEnabled(), imageUpload: isStorageEnabled() },
    },
  });
});
router.get("/stats", getStats);
router.get("/species", listSpecies);
router.get("/shelters", listShelters);
router.use("/auth", authRoutes);
router.use("/pets", petRoutes);
router.use("/adoption-requests", adoptionRequestRoutes);
router.use("/uploads", uploadRoutes);

export default router;
