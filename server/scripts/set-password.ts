/**
 * ตั้งรหัสผ่านใหม่ให้บัญชีผู้ใช้ (และเลื่อนเป็นเจ้าหน้าที่ได้)
 * ใช้หลัง deploy เพื่อเปลี่ยนรหัสผ่านบัญชีทดสอบที่อยู่ใน seed.ts (ซึ่งเปิดเผยบน GitHub)
 *
 * วิธีใช้ (ในโฟลเดอร์ server):
 *   npm run user:password -- admin@matchapaw.test "รหัสผ่านใหม่ที่ยาวพอ"
 *   npm run user:password -- someone@mail.com "รหัสผ่านใหม่" --admin   (เลื่อนเป็น ADMIN ด้วย)
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main(): Promise<void> {
  const [email, password, flag] = process.argv.slice(2);
  if (!email || !password) {
    console.error('วิธีใช้: npm run user:password -- <อีเมล> "<รหัสผ่านใหม่>" [--admin]');
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env["DATABASE_URL"] }) });
  try {
    const user = await prisma.user.update({
      where: { email: email.trim().toLowerCase() },
      data: {
        passwordHash: await bcrypt.hash(password, 10),
        ...(flag === "--admin" ? { role: Role.ADMIN } : {}),
      },
      select: { email: true, role: true },
    });
    console.log(`✅ ตั้งรหัสผ่านใหม่ให้ ${user.email} แล้ว (role: ${user.role})`);
  } catch {
    console.error(`❌ ไม่พบบัญชี ${email}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
