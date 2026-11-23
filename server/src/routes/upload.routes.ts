import { Router } from "express";
import { imageUpload, uploadImage } from "../controllers/upload.controller";
import { requireAdmin } from "../middlewares/auth";

// เส้นทาง /api/uploads (เจ้าหน้าที่เท่านั้น)
const router = Router();

router.post("/pet-image", requireAdmin, imageUpload, uploadImage);

export default router;
