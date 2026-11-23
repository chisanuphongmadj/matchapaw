import { Role } from "@prisma/client";
import type { Request, RequestHandler } from "express";
import { type AuthUser, verifyToken } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/HttpError";

/**
 * อ่าน token จาก header "Authorization: Bearer <token>"
 * - ไม่มี token: ผ่านไปได้ (เป็นผู้เยี่ยมชม) req.user = undefined
 * - token ปลอม/หมดอายุ/ผู้ใช้ถูกลบ: ตอบ 401
 * - ถูกต้อง: ดึงข้อมูลผู้ใช้ล่าสุดจากฐานข้อมูลมาใส่ req.user (role เปลี่ยนจะมีผลทันที)
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  const userId = verifyToken(header.slice("Bearer ".length));
  if (!userId) throw new HttpError(401, "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) throw new HttpError(401, "ไม่พบบัญชีผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง");

  req.user = user;
  next();
};

/** ต้องล็อกอินก่อน ไม่งั้นตอบ 401 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) throw new HttpError(401, "กรุณาเข้าสู่ระบบก่อน");
  next();
};

/** ต้องเป็นเจ้าหน้าที่ (ADMIN) ไม่งั้นตอบ 401 / 403 */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) throw new HttpError(401, "กรุณาเข้าสู่ระบบก่อน");
  if (req.user.role !== Role.ADMIN) throw new HttpError(403, "เฉพาะเจ้าหน้าที่เท่านั้น");
  next();
};

/** ใช้ใน controller ที่อยู่หลัง requireAuth เพื่อได้ผู้ใช้แบบมี Type แน่นอน */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw new HttpError(401, "กรุณาเข้าสู่ระบบก่อน");
  return req.user;
}
