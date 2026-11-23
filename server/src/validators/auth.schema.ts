import { z } from "zod";

const emailField = z
  .string({ error: "กรุณากรอกอีเมล" })
  .trim()
  .toLowerCase()
  .max(120, "อีเมลยาวเกินไป")
  .pipe(z.email("รูปแบบอีเมลไม่ถูกต้อง"));

/** POST /api/auth/register */
export const registerSchema = z.object({
  name: z.string().trim().min(2, "กรุณากรอกชื่อ-นามสกุล").max(100, "ชื่อยาวเกินไป"),
  email: emailField,
  password: z
    .string({ error: "กรุณากรอกรหัสผ่าน" })
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .max(72, "รหัสผ่านยาวได้ไม่เกิน 72 ตัวอักษร"),
});

/** POST /api/auth/login */
export const loginSchema = z.object({
  email: emailField,
  password: z.string({ error: "กรุณากรอกรหัสผ่าน" }).min(1, "กรุณากรอกรหัสผ่าน"),
});
