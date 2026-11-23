import { z } from "zod";
import { HttpError } from "./HttpError";

/**
 * ตรวจสอบข้อมูลด้วย Zod Schema
 * - ผ่าน: คืนค่าข้อมูลที่ผ่านการแปลงแล้ว (มี Type ถูกต้อง)
 * - ไม่ผ่าน: โยน HttpError 400 พร้อมรายละเอียดแต่ละฟิลด์
 */
export function parseWith<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    }));
    throw new HttpError(400, "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง", details);
  }
  return result.data;
}

/** แปลง :id จาก URL เป็นตัวเลข ถ้าไม่ใช่จำนวนเต็มบวกจะตอบ 400 */
export function parseId(raw: string | undefined): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "รหัส (id) ต้องเป็นจำนวนเต็มบวก");
  }
  return id;
}
