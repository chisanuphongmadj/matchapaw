import { Router } from "express";
import { getStats, listShelters, listSpecies } from "../controllers/meta.controller";
import adoptionRequestRoutes from "./adoptionRequest.routes";
import petRoutes from "./pet.routes";

/**
 * รวมทุกเส้นทางของ API (mount ที่ /api ใน app.ts)
 *
 *  GET    /api/health
 *  GET    /api/stats
 *  GET    /api/species
 *  GET    /api/shelters
 *  GET    /api/pets                      ?search&speciesId&shelterId&gender&size&status&ids&sort&limit
 *  GET    /api/pets/:id
 *  POST   /api/pets
 *  PUT    /api/pets/:id
 *  PATCH  /api/pets/:id
 *  DELETE /api/pets/:id
 *  GET    /api/adoption-requests         ?status&petId
 *  POST   /api/adoption-requests
 *  PATCH  /api/adoption-requests/:id/status
 *  DELETE /api/adoption-requests/:id
 */
const router = Router();

router.get("/health", (_req, res) => {
  res.json({ data: { status: "ok", time: new Date().toISOString() } });
});
router.get("/stats", getStats);
router.get("/species", listSpecies);
router.get("/shelters", listShelters);
router.use("/pets", petRoutes);
router.use("/adoption-requests", adoptionRequestRoutes);

export default router;
