import cors from "cors";
import express from "express";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import apiRoutes from "./routes";

/** สร้าง Express App (แยกจาก index.ts เพื่อให้โครงสร้างชัดเจน) */
export function createApp(): express.Express {
  const app = express();

  // อนุญาตเฉพาะ origin ของหน้าเว็บ React (กำหนดใน .env) ถ้าไม่กำหนดจะอนุญาตทั้งหมด
  const allowedOrigins = process.env["CLIENT_ORIGIN"]
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Essential Middlewares
  app.use(cors(allowedOrigins?.length ? { origin: allowedOrigins } : {}));
  app.use(express.json({ limit: "100kb" }));
  app.use(requestLogger);

  app.use("/api", apiRoutes);

  // ต้องอยู่ท้ายสุดเสมอ
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
