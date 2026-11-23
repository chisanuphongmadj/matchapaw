import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { type AuthUser, signToken } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { currentUser } from "../middlewares/auth";
import type { ApiSuccess } from "../types/api";
import { HttpError } from "../utils/HttpError";
import { parseWith } from "../utils/validate";
import { loginSchema, registerSchema } from "../validators/auth.schema";

interface AuthResult {
  token: string;
  user: AuthUser;
}

const publicUser = { id: true, email: true, name: true, role: true } satisfies Prisma.UserSelect;

// POST /api/auth/register - สมัครสมาชิก (ได้ role USER เสมอ)
export async function register(req: Request, res: Response<ApiSuccess<AuthResult>>): Promise<void> {
  const body = parseWith(registerSchema, req.body);
  const passwordHash = await bcrypt.hash(body.password, 10);

  try {
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, passwordHash },
      select: publicUser,
    });
    res.status(201).json({ data: { token: signToken(user), user } });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "อีเมลนี้ถูกใช้สมัครแล้ว");
    }
    throw error;
  }
}

// POST /api/auth/login - เข้าสู่ระบบ
export async function login(req: Request, res: Response<ApiSuccess<AuthResult>>): Promise<void> {
  const body = parseWith(loginSchema, req.body);
  const found = await prisma.user.findUnique({ where: { email: body.email } });

  // ไม่บอกว่าผิดที่อีเมลหรือรหัสผ่าน เพื่อไม่ให้คนเดาได้ว่ามีอีเมลนี้ในระบบ
  const ok = found ? await bcrypt.compare(body.password, found.passwordHash) : false;
  if (!found || !ok) throw new HttpError(401, "อีเมลหรือรหัสผ่านไม่ถูกต้อง");

  const user: AuthUser = { id: found.id, email: found.email, name: found.name, role: found.role };
  res.json({ data: { token: signToken(user), user } });
}

// GET /api/auth/me - ข้อมูลผู้ใช้ที่ล็อกอินอยู่
export async function me(req: Request, res: Response<ApiSuccess<AuthUser>>): Promise<void> {
  res.json({ data: currentUser(req) });
}
