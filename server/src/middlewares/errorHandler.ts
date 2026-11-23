import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler, RequestHandler } from "express";
import type { ApiErrorBody } from "../types/api";
import { HttpError } from "../utils/HttpError";

/** 404 สำหรับเส้นทาง API ที่ไม่มีอยู่จริง */
export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `ไม่พบเส้นทาง ${req.method} ${req.originalUrl}`));
};

/** แปลง Error ของ Prisma เป็น HTTP Status Code ที่เหมาะสม */
function fromPrismaError(error: Prisma.PrismaClientKnownRequestError): HttpError | null {
  switch (error.code) {
    case "P2025": // ไม่พบแถวที่จะ update/delete
      return new HttpError(404, "ไม่พบข้อมูลที่ต้องการ");
    case "P2002": // ข้อมูลซ้ำกับ @unique / @@unique
      return new HttpError(409, "ข้อมูลซ้ำกับที่มีอยู่แล้วในระบบ");
    case "P2003": // Foreign Key ไม่ถูกต้อง หรือยังมีข้อมูลอื่นอ้างอิงอยู่
      return new HttpError(400, "ข้อมูลอ้างอิงไม่ถูกต้อง (เช่น ชนิดสัตว์หรือบ้านพักพิงไม่มีอยู่จริง)");
    case "P1001": // เชื่อมต่อฐานข้อมูลไม่ได้
    case "ECONNREFUSED":
      return new HttpError(503, "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    default:
      return null;
  }
}

function isJsonSyntaxError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  );
}

/** Middleware จัดการ Error กลาง: ทุก Error จะถูกส่งกลับในรูปแบบ { error: { message, details? } } */
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  let httpError: HttpError | null = null;

  if (error instanceof HttpError) {
    httpError = error;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    httpError = fromPrismaError(error);
  } else if (isJsonSyntaxError(error)) {
    httpError = new HttpError(400, "รูปแบบ JSON ไม่ถูกต้อง");
  }

  if (!httpError) {
    console.error("[Unhandled Error]", error);
    httpError = new HttpError(500, "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์");
  }

  const body: ApiErrorBody = { error: { message: httpError.message } };
  if (httpError.details) body.error.details = httpError.details;
  res.status(httpError.status).json(body);
};
