import { Router } from "express";
import {
  createPet,
  deletePet,
  getPet,
  listPets,
  replacePet,
  updatePet,
} from "../controllers/pet.controller";

// เส้นทาง /api/pets
const router = Router();

router.get("/", listPets);
router.get("/:id", getPet);
router.post("/", createPet);
router.put("/:id", replacePet);
router.patch("/:id", updatePet);
router.delete("/:id", deletePet);

export default router;
