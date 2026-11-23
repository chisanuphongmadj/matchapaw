import { Gender, PetSize, PetStatus } from "@prisma/client";
import { z } from "zod";

// ฟิลด์พื้นฐานของสัตว์ (ยังไม่มีค่า default เพื่อให้นำไปทำ partial สำหรับ PATCH ได้)
const petFields = {
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(50, "ชื่อยาวได้ไม่เกิน 50 ตัวอักษร"),
  breed: z.string().trim().min(1, "กรุณากรอกสายพันธุ์").max(60, "สายพันธุ์ยาวได้ไม่เกิน 60 ตัวอักษร"),
  gender: z.enum(Gender, { error: "เพศต้องเป็น MALE หรือ FEMALE" }),
  ageMonths: z
    .number({ error: "อายุต้องเป็นตัวเลข" })
    .int("อายุต้องเป็นจำนวนเต็ม (เดือน)")
    .min(0, "อายุต้องไม่ติดลบ")
    .max(360, "อายุต้องไม่เกิน 360 เดือน"),
  size: z.enum(PetSize, { error: "ขนาดต้องเป็น SMALL, MEDIUM หรือ LARGE" }),
  color: z.string().trim().min(1, "กรุณากรอกสี").max(40, "สียาวได้ไม่เกิน 40 ตัวอักษร"),
  description: z
    .string()
    .trim()
    .min(10, "คำอธิบายต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(1000, "คำอธิบายยาวได้ไม่เกิน 1000 ตัวอักษร"),
  // ส่ง "" มา = ไม่มีรูป (null)
  imageUrl: z
    .preprocess(
      (value) => (value === "" ? null : value),
      z.url("ลิงก์รูปภาพไม่ถูกต้อง").max(500, "ลิงก์รูปภาพยาวเกินไป").nullable(),
    )
    .optional(),
  vaccinated: z.boolean({ error: "vaccinated ต้องเป็น true/false" }),
  sterilized: z.boolean({ error: "sterilized ต้องเป็น true/false" }),
  status: z.enum(PetStatus, { error: "สถานะไม่ถูกต้อง" }),
  speciesId: z.number({ error: "กรุณาเลือกชนิดสัตว์" }).int().positive("กรุณาเลือกชนิดสัตว์"),
  shelterId: z.number({ error: "กรุณาเลือกบ้านพักพิง" }).int().positive("กรุณาเลือกบ้านพักพิง"),
};

/** POST /api/pets และ PUT /api/pets/:id (ส่งข้อมูลครบทุกฟิลด์) */
export const petCreateSchema = z.object({
  ...petFields,
  vaccinated: petFields.vaccinated.default(false),
  sterilized: petFields.sterilized.default(false),
  status: petFields.status.default(PetStatus.AVAILABLE),
});

/** PATCH /api/pets/:id (ส่งเฉพาะฟิลด์ที่ต้องการแก้) */
export const petPatchSchema = z
  .object(petFields)
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: "ต้องส่งข้อมูลอย่างน้อย 1 ฟิลด์",
  });

/** Query string ของ GET /api/pets */
export const petQuerySchema = z.object({
  search: z.string().trim().max(50).optional(),
  speciesId: z.coerce.number().int().positive().optional(),
  shelterId: z.coerce.number().int().positive().optional(),
  gender: z.enum(Gender).optional(),
  size: z.enum(PetSize).optional(),
  status: z.enum(PetStatus).optional(),
  // ?ids=1,2,3 ใช้ดึงสัตว์ในรายการโปรด
  ids: z
    .string()
    .regex(/^\d+(,\d+)*$/, "ids ต้องอยู่ในรูปแบบ 1,2,3")
    .transform((value) => value.split(",").map(Number))
    .optional(),
  sort: z.enum(["newest", "oldest", "name", "age"]).default("newest"),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type PetCreateInput = z.output<typeof petCreateSchema>;
export type PetQuery = z.output<typeof petQuerySchema>;
