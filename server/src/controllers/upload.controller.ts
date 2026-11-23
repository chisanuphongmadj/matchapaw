import type { Request, Response } from "express";
import multer from "multer";
import { ALLOWED_IMAGE_TYPES, uploadPetImage } from "../lib/storage";
import type { ApiSuccess } from "../types/api";
import { HttpError } from "../utils/HttpError";

const MAX_SIZE_MB = 3;

/** multer รับไฟล์ไว้ในหน่วยความจำ (ไม่เขียนลงดิสก์) แล้วส่งต่อไป Supabase Storage */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, "รองรับเฉพาะไฟล์รูป JPG, PNG, WEBP หรือ GIF"));
  },
}).single("file");

// POST /api/uploads/pet-image - อัปโหลดรูปสัตว์ (เฉพาะเจ้าหน้าที่)
export async function uploadImage(req: Request, res: Response<ApiSuccess<{ url: string }>>): Promise<void> {
  if (!req.file) throw new HttpError(400, `กรุณาเลือกไฟล์รูป (ขนาดไม่เกิน ${MAX_SIZE_MB}MB)`);
  const url = await uploadPetImage(req.file);
  res.status(201).json({ data: { url } });
}
