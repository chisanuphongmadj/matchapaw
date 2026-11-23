# คู่มือ Deploy MatchAPaw ขึ้นออนไลน์ (Phase 2)

ผลลัพธ์: หน้าเว็บอยู่บน **Vercel** · API อยู่บน **Render** · ฐานข้อมูลและรูปอยู่บน **Supabase** · อีเมลส่งผ่าน **Resend**

```
ผู้ใช้ → Vercel (client/) → Render (server/) → Supabase PostgreSQL + Storage
                                      └────→ Resend (อีเมล)
```

ทำตามลำดับ 1 → 6 ใช้เวลาประมาณ 20-30 นาที ทุกบริการมีแพ็กเกจฟรี

---

## 1. เตรียมค่าจาก Supabase

Supabase dashboard ของโปรเจกต์ที่ใช้อยู่

| ค่า | หาได้ที่ | ใช้กับ |
|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Connect → Connection String → **Session pooler** (ค่าเดียวกันทั้งคู่) | Render |
| `SUPABASE_URL` | Project Settings → API → Project URL | Render |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API Keys → `service_role` (secret) | Render |

> `service_role` key มีสิทธิ์เต็ม **ใส่ได้เฉพาะฝั่ง Server (Render) ห้ามใส่ใน client หรือขึ้น GitHub**
> Bucket `pet-images` ระบบสร้างให้อัตโนมัติตอนอัปโหลดรูปครั้งแรก

## 2. สมัคร Resend (อีเมลแจ้งเตือน, ไม่บังคับ)

1. สมัครที่ https://resend.com ด้วยอีเมลของคุณ
2. เมนู **API Keys → Create API Key** แล้วคัดลอกเก็บไว้ (`RESEND_API_KEY`)

> บัญชีฟรีที่ยังไม่ได้ยืนยันโดเมน **ส่งได้เฉพาะอีเมลที่ใช้สมัคร Resend** เท่านั้น ตอน Demo ให้สมัครสมาชิกในเว็บด้วยอีเมลเดียวกับ Resend แล้วส่งคำขอ จะได้รับอีเมลจริง
> ถ้าไม่ใส่ key ระบบยังทำงานปกติ แค่ไม่ส่งอีเมล (มี log บอกใน Render)

## 3. Deploy Backend บน Render

1. สมัคร https://render.com ด้วยบัญชี GitHub
2. **New → Blueprint** → เลือก repo `matchapaw` (Render อ่านไฟล์ `render.yaml` ให้เอง)
3. กรอกค่าที่ระบบถาม:
   - `DATABASE_URL`, `DIRECT_URL` จากข้อ 1
   - `CLIENT_ORIGIN` **เว้นว่างไว้ก่อน** (กลับมาใส่ในข้อ 5)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` จากข้อ 1 (ไม่ใช้อัปโหลดรูปเว้นว่างได้)
   - `RESEND_API_KEY` จากข้อ 2 (เว้นว่างได้)
   - `JWT_SECRET` ระบบสุ่มให้อัตโนมัติ
4. กด **Apply** รอ build ประมาณ 3-5 นาที (ระหว่าง build จะรัน `prisma migrate deploy` อัปเดตตารางให้เอง)
5. ได้ URL เช่น `https://matchapaw-api.onrender.com` ทดสอบเปิด `https://matchapaw-api.onrender.com/api/health` ต้องเห็น `"status":"ok"`

> แพ็กเกจฟรีของ Render จะหลับเมื่อไม่มีคนใช้ 15 นาที การเรียกครั้งแรกหลังหลับใช้เวลาประมาณ 50 วินาที **ก่อน Demo ให้เปิด /api/health ปลุกไว้ก่อน**

## 4. Deploy Frontend บน Vercel

1. สมัคร https://vercel.com ด้วยบัญชี GitHub
2. **Add New → Project** → Import repo `matchapaw`
3. ตั้งค่า:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (เลือกให้อัตโนมัติ)
   - **Environment Variables:** `VITE_API_URL` = `https://matchapaw-api.onrender.com/api` (URL จากข้อ 3 ต่อท้ายด้วย `/api`)
4. กด **Deploy** ได้ URL เช่น `https://matchapaw.vercel.app`

> ไฟล์ `client/vercel.json` ทำให้เปิดลิงก์ตรง เช่น `/pets/3` หรือกด F5 แล้วไม่เจอ 404

## 5. เชื่อมสองฝั่งเข้าหากัน (CORS)

1. กลับไป Render → service `matchapaw-api` → **Environment**
2. ใส่ `CLIENT_ORIGIN` = URL ของ Vercel เช่น `https://matchapaw.vercel.app` (ไม่มี `/` ท้าย)
3. **Save Changes** แล้ว Render จะ deploy ใหม่ให้เอง

ค่านี้ใช้ทั้งอนุญาต CORS และสร้างลิงก์ในอีเมลแจ้งเตือน

## 6. ⚠️ เปลี่ยนรหัสผ่านบัญชีเจ้าหน้าที่ (สำคัญมาก)

บัญชีทดสอบ `admin@matchapaw.test` มีรหัสผ่านเขียนอยู่ใน `server/prisma/seed.ts` ซึ่งอยู่บน GitHub แบบ public **ใครก็ล็อกอินเป็น Admin ได้ถ้าไม่เปลี่ยน**

รันในเครื่องตัวเอง ในโฟลเดอร์ `server` (ใช้ `.env` ที่ชี้ไป Supabase อยู่แล้ว):

```powershell
npm run user:password -- admin@matchapaw.test "รหัสผ่านใหม่ที่เดายาก"
```

สร้างบัญชีเจ้าหน้าที่ของตัวเองแทนก็ได้: สมัครสมาชิกในเว็บตามปกติ แล้วรัน

```powershell
npm run user:password -- อีเมลที่สมัคร "รหัสผ่านใหม่" --admin
```

---

## ตรวจว่าใช้งานได้ครบ

- [ ] เปิดเว็บ Vercel เห็นรายการสัตว์ (แปลว่าเชื่อม API และฐานข้อมูลได้)
- [ ] สมัครสมาชิก → ส่งคำขอรับเลี้ยง → เห็นในหน้า "คำขอของฉัน"
- [ ] ล็อกอินเจ้าหน้าที่ → อนุมัติคำขอ → ผู้ขอเห็นสถานะ "อนุมัติแล้ว" (และได้อีเมล ถ้าตั้ง Resend)
- [ ] เจ้าหน้าที่ → เพิ่มสัตว์ → กด "อัปโหลดรูปจากเครื่อง" → รูปขึ้น (ถ้าตั้ง Supabase Storage)
- [ ] ผู้ใช้ทั่วไปเปิด `/admin` ต้องเห็นหน้า 403

## แก้ปัญหาที่พบบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| หน้าเว็บขึ้น "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" | `VITE_API_URL` ผิด (ต้องลงท้าย `/api`) หรือ Render กำลังตื่น รอ 1 นาทีแล้วกดลองใหม่ แก้ค่าแล้วต้อง Redeploy บน Vercel |
| Console ฟ้อง CORS | `CLIENT_ORIGIN` บน Render ไม่ตรงกับ URL ของ Vercel |
| อัปโหลดรูปได้ 503 | ยังไม่ได้ใส่ `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` บน Render |
| ไม่ได้รับอีเมล | ไม่ได้ใส่ `RESEND_API_KEY` หรือส่งหาอีเมลที่ไม่ใช่อีเมลเจ้าของบัญชี Resend (ดู Logs บน Render) |
| Build บน Render ล้มที่ `prisma migrate deploy` | `DIRECT_URL` ผิด ใช้ Session pooler พอร์ต 5432 ไม่ใช่ Transaction pooler 6543 |
