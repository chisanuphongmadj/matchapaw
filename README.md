# 🐾 MatchAPaw — แพลตฟอร์มจับคู่สัตว์จรกับครอบครัวใหม่

> CS319 Final Project · หัวข้อ **Community & Social Impact**

MatchAPaw รวบรวมสุนัข แมว และกระต่ายจรจากบ้านพักพิงหลายแห่งไว้ในที่เดียว ผู้ใช้ค้นหาและกรองสัตว์ที่เข้ากับไลฟ์สไตล์
กดหัวใจเก็บไว้ในรายการโปรด สมัครสมาชิกแล้วส่งคำขอรับเลี้ยงและติดตามสถานะได้ ส่วนเจ้าหน้าที่บ้านพักพิงล็อกอินเข้าหน้าจัดการระบบ
เพื่อเพิ่ม แก้ไข ลบข้อมูลสัตว์ (พร้อมอัปโหลดรูป) และอนุมัติหรือปฏิเสธคำขอ โดยระบบส่งอีเมลแจ้งผลให้ผู้ขออัตโนมัติ

## ฟีเจอร์

| Phase 1 | Phase 2 |
|---|---|
| ค้นหา/กรอง/เรียงสัตว์, หน้ารายละเอียด, รายการโปรด | **ระบบสมาชิก**: สมัคร/ล็อกอินด้วย JWT, รหัสผ่านเข้ารหัส bcrypt |
| ส่งคำขอรับเลี้ยง (กันซ้ำด้วย `@@unique`) | **แยกสิทธิ์** USER / ADMIN ทั้งฝั่ง API และหน้าเว็บ |
| หน้า Admin: CRUD สัตว์, อนุมัติ/ปฏิเสธคำขอ | **คำขอของฉัน**: ผู้ใช้ติดตามสถานะคำขอของตัวเอง |
| Zero-Refresh, Skeleton, Error, Responsive, Dark mode | **อัปโหลดรูป** ไป Supabase Storage |
| | **อีเมลแจ้งเตือน** ผ่าน Resend เมื่อส่งคำขอ/อนุมัติ/ปฏิเสธ |
| | **Deploy** ขึ้น Vercel + Render (ดู [docs/DEPLOY.md](docs/DEPLOY.md)) |

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | Vite, React 19 + TypeScript, React Router v7, Tailwind CSS v4 + DaisyUI v5 |
| State | **Zustand** (Client State: token, ตัวกรอง, รายการโปรด, ธีม, toast) · **TanStack Query** (Server State/Cache) |
| Backend | Node.js, Express 5 + TypeScript, cors, dotenv, express.json(), Zod, JWT (jsonwebtoken), bcryptjs, multer |
| Database | PostgreSQL บน Supabase + Prisma ORM 7 (Schema, Migrate, Client, Seed) |
| บริการภายนอก | Supabase Storage (รูป), Resend (อีเมล), Vercel (หน้าเว็บ), Render (API) |

## โครงสร้างโฟลเดอร์

```
Final Project/
├── client/                      # Frontend (React SPA)
│   ├── vercel.json              # ตั้งค่า deploy บน Vercel
│   └── src/
│       ├── components/          # layout/ (Navbar, RootLayout) และ ui/ (ErrorAlert, Toaster, ...)
│       ├── features/            # แยกตามฟีเจอร์: auth/, pets/, adoption/, meta/ (API hooks + components)
│       ├── pages/               # หน้าเว็บแต่ละหน้า + auth/ + admin/
│       ├── stores/              # Zustand stores (auth, favorite, filter, theme, toast)
│       ├── lib/                 # apiClient, queryClient, queryKeys, format
│       ├── types/               # Type/Interface ของข้อมูลและ API Response
│       └── router.tsx           # React Router v7 + Route Guard
├── server/                      # Backend (REST API)
│   ├── prisma/
│   │   ├── schema.prisma        # Data Models, Relations, Constraints
│   │   ├── migrations/          # Prisma Migrate (init, add_users_and_roles)
│   │   └── seed.ts              # ข้อมูลตั้งต้น 79 รายการ (สัตว์ 44 ตัว + บัญชีทดสอบ 2 บัญชี)
│   ├── scripts/set-password.ts  # ตั้งรหัสผ่านใหม่ / เลื่อนเป็น Admin
│   └── src/
│       ├── routes/              # กำหนดเส้นทาง API
│       ├── controllers/         # Logic ของแต่ละ endpoint
│       ├── validators/          # Zod schema ตรวจข้อมูลก่อนบันทึก
│       ├── middlewares/         # auth (authenticate, requireAuth, requireAdmin), errorHandler, requestLogger
│       ├── lib/                 # prisma, auth (JWT), storage (Supabase), mailer + notifications (Resend)
│       ├── app.ts               # สร้าง Express app + middleware
│       └── index.ts             # จุดเริ่มเซิร์ฟเวอร์
├── render.yaml                  # ตั้งค่า deploy API บน Render
└── docs/                        # สไลด์, คู่มือ, DEPLOY.md
```

## Database Schema

```
Species 1 ──< Pet >── 1 Shelter
                │
                1
                │
                ^
         AdoptionRequest >── 1 Adopter ── 0..1 User
         @@unique([adopterId, petId])   ← คนเดิมขอสัตว์ตัวเดิมซ้ำไม่ได้
```

- **Species**: ชนิดสัตว์ (`name`, `slug` เป็น unique)
- **Shelter**: บ้านพักพิง
- **Pet**: สัตว์ (FK → Species, Shelter แบบ `onDelete: Restrict`)
- **Adopter**: ผู้ขอรับเลี้ยง (`email` unique, `userId` FK → User แบบ 1 ต่อ 1)
- **AdoptionRequest**: คำขอรับเลี้ยง (FK → Adopter, Pet แบบ `onDelete: Cascade`)
- **User**: บัญชีผู้ใช้ (`email` unique, `passwordHash`, `role` = USER | ADMIN)

## วิธีติดตั้งและรันในเครื่อง

### 1. Backend
```powershell
cd server
npm install
copy .env.example .env        # แล้วใส่ DATABASE_URL, DIRECT_URL ของ Supabase (และค่าอื่นตามต้องการ)
npx prisma migrate deploy     # สร้าง/อัปเดตตารางในฐานข้อมูล
npx prisma db seed            # ใส่ข้อมูลตัวอย่าง (ลบข้อมูลเดิมทั้งหมดก่อน)
npm run dev                   # http://localhost:3000/api
```

### 2. Frontend (เปิดอีกหน้าต่าง)
```powershell
cd client
npm install
npm run dev                   # http://localhost:5173
```

### บัญชีทดสอบ (สร้างจาก seed.ts)

| บทบาท | อีเมล | รหัสผ่าน |
|---|---|---|
| เจ้าหน้าที่ (ADMIN) | `admin@matchapaw.test` | `Admin1234!` |
| ผู้ใช้ทั่วไป (USER) | `user@matchapaw.test` | `User1234!` |

> ⚠️ รหัสผ่านนี้เปิดเผยบน GitHub ใช้เฉพาะในเครื่องและตอน Demo **ก่อนเปิดเว็บออนไลน์ต้องเปลี่ยน** ด้วย
> `npm run user:password -- admin@matchapaw.test "รหัสผ่านใหม่"` (ในโฟลเดอร์ server)

### ฟีเจอร์ที่ต้องใส่ key เพิ่ม (ไม่ใส่ก็ใช้งานส่วนอื่นได้ปกติ)

| ฟีเจอร์ | ค่าใน `server/.env` | ถ้าไม่ใส่ |
|---|---|---|
| อัปโหลดรูป | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | ปุ่มอัปโหลดแจ้งว่ายังไม่ได้ตั้งค่า (ยังวางลิงก์รูปได้) |
| อีเมลแจ้งเตือน | `RESEND_API_KEY` | ข้ามการส่ง (มี log ใน terminal) |

`GET /api/health` บอกว่าเปิดฟีเจอร์ไหนอยู่: `"features": { "email": false, "imageUpload": false }`

## REST API

🔓 ทุกคน · 👤 ต้องล็อกอิน · 🛡️ เจ้าหน้าที่ (ADMIN)

| สิทธิ์ | Method | Endpoint | คำอธิบาย | Status |
|---|---|---|---|---|
| 🔓 | POST | `/api/auth/register` | สมัครสมาชิก (ได้ token) | 201, 400, 409 |
| 🔓 | POST | `/api/auth/login` | เข้าสู่ระบบ (ได้ token) | 200, 400, 401 |
| 👤 | GET | `/api/auth/me` | ข้อมูลผู้ใช้ที่ล็อกอินอยู่ | 200, 401 |
| 🔓 | GET | `/api/stats` · `/api/species` · `/api/shelters` | ข้อมูลประกอบหน้าเว็บ | 200 |
| 🔓 | GET | `/api/pets?search&speciesId&gender&size&status&sort&limit&ids` | รายการสัตว์ | 200, 400 |
| 🔓 | GET | `/api/pets/:id` | รายละเอียดสัตว์ | 200, 400, 404 |
| 🛡️ | POST | `/api/pets` | เพิ่มสัตว์ | 201, 400, 401, 403 |
| 🛡️ | PUT · PATCH | `/api/pets/:id` | แก้ไขทั้งหมด · บางฟิลด์ | 200, 400, 401, 403, 404 |
| 🛡️ | DELETE | `/api/pets/:id` | ลบสัตว์ | 204, 401, 403, 404 |
| 👤 | GET | `/api/adoption-requests/mine` | คำขอของฉัน | 200, 401 |
| 👤 | POST | `/api/adoption-requests` | ส่งคำขอรับเลี้ยง (+อีเมลยืนยัน) | 201, 400, 401, 404, 409 |
| 🛡️ | GET | `/api/adoption-requests?status` | คำขอทั้งหมด | 200, 401, 403 |
| 🛡️ | PATCH | `/api/adoption-requests/:id/status` | อนุมัติ/ปฏิเสธ (+อีเมลแจ้งผล) | 200, 400, 401, 403, 404 |
| 🛡️ | DELETE | `/api/adoption-requests/:id` | ลบคำขอ | 204, 401, 403, 404 |
| 🛡️ | POST | `/api/uploads/pet-image` | อัปโหลดรูป (multipart, ฟิลด์ `file`, ≤3MB) | 201, 400, 401, 403, 503 |

ส่ง token ด้วย header `Authorization: Bearer <token>` · ทุก Error ตอบรูปแบบ `{ "error": { "message": "...", "details": [{ "field", "message" }] } }`

## การแยก State (Dual-State)

| Zustand (Client State) | TanStack Query (Server State) |
|---|---|
| `authStore` เก็บ **เฉพาะ token** (persist) | `useMe` ข้อมูลผู้ใช้จาก `/api/auth/me` |
| `filterStore` ตัวกรองหน้า /pets (นำไปเป็น queryKey) | `usePets`, `usePet`, `useStats`, `useSpecies`, `useShelters` |
| `favoriteStore` เก็บ **เฉพาะ id** ของรายการโปรด (persist) | `useAdoptionRequests`, `useMyRequests` |
| `themeStore` โหมดสว่าง/มืด (persist) | Mutations ทุกตัวเรียก `invalidateQueries()` (Zero-Refresh) |
| `toastStore` ข้อความแจ้งเตือน | |

ข้อมูลจากฐานข้อมูลอยู่ใน TanStack Query เพียงที่เดียว (Single Source of Truth) แม้แต่ชื่อและสิทธิ์ของผู้ใช้ก็ไม่ได้เก็บซ้ำใน Zustand

## หน้าเว็บ

| Path | หน้า | สิทธิ์ |
|---|---|---|
| `/` | หน้าแรก (Hero, สถิติ, เลือกตามชนิด, น้องมาใหม่) | ทุกคน |
| `/pets` | รายการสัตว์ + ค้นหา/กรอง/เรียง (Items Master Page) | ทุกคน |
| `/pets/:id` | รายละเอียดสัตว์ + ฟอร์มขอรับเลี้ยง (Dynamic Detail Page) | ทุกคน (ส่งคำขอต้องล็อกอิน) |
| `/favorites` | รายการโปรด | ทุกคน |
| `/login`, `/register` | เข้าสู่ระบบ / สมัครสมาชิก | ทุกคน |
| `/my-requests` | คำขอรับเลี้ยงของฉัน | ล็อกอิน |
| `/admin/pets` | ตารางจัดการสัตว์ (เปลี่ยนสถานะ/แก้ไข/ลบ) | เจ้าหน้าที่ |
| `/admin/pets/new`, `/admin/pets/:id/edit` | ฟอร์มเพิ่ม/แก้ไขสัตว์ + อัปโหลดรูป | เจ้าหน้าที่ |
| `/admin/requests` | จัดการคำขอรับเลี้ยง | เจ้าหน้าที่ |

## Deploy

ดูขั้นตอนเต็มใน [docs/DEPLOY.md](docs/DEPLOY.md): API บน Render (`render.yaml`) · หน้าเว็บบน Vercel (`client/vercel.json`)

## สมาชิกและหน้าที่

| รหัสนักศึกษา | ชื่อ | ส่วนที่รับผิดชอบ |
|---|---|---|
| | | Database + เอกสาร (schema.prisma, migrations, seed.ts) |
| | | Backend API (routes, controllers, validators, middlewares, auth) |
| | | Frontend (pages, features, stores, components) |

## เตรียมไฟล์ส่ง

รันใน PowerShell จากโฟลเดอร์ `Final Project` (เปลี่ยน `รหัสนักศึกษา` เป็นรหัสของตัวเอง) คำสั่งนี้คัดลอกโปรเจกต์โดยไม่เอา `node_modules`, `dist` และ `.env` แล้วบีบอัดเป็น ZIP

```powershell
$out = "$env:TEMP\final_proj"; robocopy . $out /E /XD node_modules dist .claude /XF .env | Out-Null; Compress-Archive -Path "$out\*" -DestinationPath "..\final_proj_รหัสนักศึกษา.zip" -Force; Remove-Item -Recurse -Force $out
```
