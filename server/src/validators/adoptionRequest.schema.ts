import { RequestStatus } from "@prisma/client";
import { z } from "zod";

/** POST /api/adoption-requests */
export const adoptionRequestCreateSchema = z.object({
  petId: z.number({ error: "ไม่พบรหัสสัตว์" }).int().positive(),
  name: z.string().trim().min(2, "กรุณากรอกชื่อ-นามสกุล").max(100, "ชื่อยาวเกินไป"),
  email: z
    .string({ error: "กรุณากรอกอีเมล" })
    .trim()
    .toLowerCase()
    .max(120, "อีเมลยาวเกินไป")
    .pipe(z.email("รูปแบบอีเมลไม่ถูกต้อง")),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{1,2}-?\d{3}-?\d{3,4}$/, "เบอร์โทรไม่ถูกต้อง (เช่น 081-234-5678)"),
  message: z
    .string()
    .trim()
    .min(10, "กรุณาเล่าเกี่ยวกับตัวคุณอย่างน้อย 10 ตัวอักษร")
    .max(500, "ข้อความยาวได้ไม่เกิน 500 ตัวอักษร"),
});

/** PATCH /api/adoption-requests/:id/status */
export const adoptionRequestStatusSchema = z.object({
  status: z.enum(RequestStatus, { error: "สถานะต้องเป็น PENDING, APPROVED หรือ REJECTED" }),
});

/** Query string ของ GET /api/adoption-requests */
export const adoptionRequestQuerySchema = z.object({
  status: z.enum(RequestStatus).optional(),
  petId: z.coerce.number().int().positive().optional(),
});
