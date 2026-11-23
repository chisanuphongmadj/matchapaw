import "dotenv/config";
import { defineConfig } from "prisma/config";

// ตั้งค่า Prisma CLI (migrate / seed / studio)
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // คำสั่งที่รันเมื่อสั่ง `npx prisma db seed`
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DIRECT_URL = การเชื่อมต่อตรง (ไม่ผ่าน pooler) ใช้สำหรับ migrate
    // ถ้าไม่ได้ตั้งไว้ จะใช้ DATABASE_URL แทน
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"] ?? "",
  },
});
