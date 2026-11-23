import type { AuthUser } from "../lib/auth";

// เพิ่มฟิลด์ user ให้ Request ของ Express (ใส่โดย middleware authenticate)
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
