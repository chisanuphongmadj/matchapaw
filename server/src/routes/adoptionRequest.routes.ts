import { Router } from "express";
import {
  createRequest,
  deleteRequest,
  listMyRequests,
  listRequests,
  updateRequestStatus,
} from "../controllers/adoptionRequest.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth";

// เส้นทาง /api/adoption-requests
const router = Router();

router.get("/mine", requireAuth, listMyRequests); // คำขอของฉัน (ผู้ใช้ที่ล็อกอิน)
router.post("/", requireAuth, createRequest); // ส่งคำขอ (ต้องล็อกอิน)
router.get("/", requireAdmin, listRequests); // คำขอทั้งหมด (เจ้าหน้าที่)
router.patch("/:id/status", requireAdmin, updateRequestStatus);
router.delete("/:id", requireAdmin, deleteRequest);

export default router;
