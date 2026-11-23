import { Router } from "express";
import {
  createPet,
  deletePet,
  getPet,
  listPets,
  replacePet,
  updatePet,
} from "../controllers/pet.controller";
import { requireAdmin } from "../middlewares/auth";

// เส้นทาง /api/pets
// อ่านข้อมูลได้ทุกคน / เพิ่ม แก้ไข ลบ ได้เฉพาะเจ้าหน้าที่ (ADMIN)
const router = Router();

router.get("/", listPets);
router.get("/:id", getPet);
router.post("/", requireAdmin, createPet);
router.put("/:id", requireAdmin, replacePet);
router.patch("/:id", requireAdmin, updatePet);
router.delete("/:id", requireAdmin, deletePet);

export default router;
