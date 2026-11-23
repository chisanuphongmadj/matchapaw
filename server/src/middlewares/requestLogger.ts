import type { RequestHandler } from "express";

/** แสดง log ของทุก request เช่น  GET /api/pets 200 - 35ms */
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
};
