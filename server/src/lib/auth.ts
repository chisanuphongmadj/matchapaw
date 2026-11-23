import type { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

/** ข้อมูลผู้ใช้ที่ล็อกอินอยู่ (แนบไว้ที่ req.user โดย middleware authenticate) */
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

interface TokenPayload {
  sub: string; // id ของผู้ใช้
  role: Role;
}

const TOKEN_TTL = "7d";

/**
 * อ่าน JWT_SECRET จาก .env
 * - production ต้องตั้งค่าเสมอ (ไม่งั้นเซิร์ฟเวอร์ไม่ยอมเริ่ม)
 * - ตอนพัฒนาในเครื่อง ถ้าไม่ได้ตั้ง จะใช้ค่าชั่วคราวและเตือนใน console
 */
function getSecret(): string {
  const secret = process.env["JWT_SECRET"];
  if (secret) return secret;
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("ต้องตั้งค่า JWT_SECRET ใน environment ของเซิร์ฟเวอร์");
  }
  return "matchapaw-dev-only-secret";
}

if (!process.env["JWT_SECRET"] && process.env["NODE_ENV"] !== "production") {
  console.warn("⚠️  ยังไม่ได้ตั้ง JWT_SECRET ใน .env กำลังใช้ค่าสำหรับพัฒนาเท่านั้น");
}

/** สร้าง token หลังล็อกอิน/สมัครสำเร็จ (อายุ 7 วัน) */
export function signToken(user: Pick<AuthUser, "id" | "role">): string {
  const payload: TokenPayload = { sub: String(user.id), role: user.role };
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_TTL });
}

/** ตรวจ token: ถูกต้องคืน id ผู้ใช้, ปลอม/หมดอายุคืน null */
export function verifyToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === "string" || typeof decoded.sub !== "string") return null;
    const id = Number(decoded.sub);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
