import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client ตัวเดียว (Single Instance) ใช้ร่วมกันทั้งโปรเจกต์
 * Prisma 7 เชื่อมต่อ PostgreSQL ผ่าน Driver Adapter (@prisma/adapter-pg)
 */
const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  throw new Error("ไม่พบ DATABASE_URL ในไฟล์ .env");
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
