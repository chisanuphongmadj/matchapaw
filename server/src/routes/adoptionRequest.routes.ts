import { Router } from "express";
import {
  createRequest,
  deleteRequest,
  listRequests,
  updateRequestStatus,
} from "../controllers/adoptionRequest.controller";

// เส้นทาง /api/adoption-requests
const router = Router();

router.get("/", listRequests);
router.post("/", createRequest);
router.patch("/:id/status", updateRequestStatus);
router.delete("/:id", deleteRequest);

export default router;
