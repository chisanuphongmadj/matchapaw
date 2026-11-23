# 🐾 MatchAPaw — แพลตฟอร์มจับคู่สัตว์จรกับครอบครัวใหม่

> CS319 Final Project · หัวข้อ **Community & Social Impact**

MatchAPaw รวบรวมสุนัข แมว และกระต่ายจรจากบ้านพักพิงหลายแห่งไว้ในที่เดียว ผู้ใช้ค้นหาและกรองสัตว์ที่เข้ากับไลฟ์สไตล์
กดหัวใจเก็บไว้ในรายการโปรด และส่งคำขอรับเลี้ยงได้ ส่วนเจ้าหน้าที่บ้านพักพิงใช้หน้าจัดการระบบเพื่อเพิ่ม แก้ไข และลบข้อมูลสัตว์
รวมถึงอนุมัติหรือปฏิเสธคำขอรับเลี้ยง

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | Vite, React 19 + TypeScript, React Router v7, Tailwind CSS v4 + DaisyUI v5 |
| State | **Zustand** (Client State: ตัวกรอง, รายการโปรด, ธีม, toast) · **TanStack Query** (Server State/Cache) |
| Backend | Node.js, Express 5 + TypeScript, cors, dotenv, express.json(), Zod (Validation) |
| Database | PostgreSQL (ออนไลน์: Neon / Supabase) + Prisma ORM 7 (Schema, Migrate, Client, Seed) |

## โครงสร้างโฟลเดอร์

```
Final Project/
├── client/                      # Frontend (React SPA)
│   └── src/
│       ├── components/          # layout/ (Navbar, RootLayout) และ ui/ (ErrorAlert, Toaster, ...)
│       ├── features/            # แยกตามฟีเจอร์: pets/, adoption/, meta/ (API hooks + components)
│       ├── pages/               # หน้าเว็บแต่ละหน้า + admin/
│       ├── stores/              # Zustand stores
│       ├── lib/                 # apiClient, queryClient, queryKeys, format
│       ├── types/               # Type/Interface ของข้อมูลและ API Response
│       └── router.tsx           # React Router v7
└── server/                      # Backend (REST API)
    ├── prisma/
    │   ├── schema.prisma        # Data Models, Relations, Constraints
    │   ├── migrations/          # Prisma Migrate
    │   └── seed.ts              # ข้อมูลตั้งต้น 77 รายการ (สัตว์ 44 ตัว)
    └── src/
        ├── routes/              # กำหนดเส้นทาง API
        ├── controllers/         # Logic ของแต่ละ endpoint
        ├── validators/          # Zod schema ตรวจข้อมูลก่อนบันทึก
        ├── middlewares/         # errorHandler, notFound, requestLogger
        ├── lib/prisma.ts        # Prisma Client
        ├── app.ts               # สร้าง Express app + middleware
        └── index.ts             # จุดเริ่มเซิร์ฟเวอร์
```

## Database Schema

```
Species 1 ──< Pet >── 1 Shelter
                │
                1
                │
                ^
         AdoptionRequest >── 1 Adopter
         @@unique([adopterId, petId])   ← คนเดิมขอสัตว์ตัวเดิมซ้ำไม่ได้
```

- **Species**: ชนิดสัตว์ (`name`, `slug` เป็น unique)
- **Shelter**: บ้านพักพิง
- **Pet**: สัตว์ (FK → Species, Shelter แบบ `onDelete: Restrict`)
- **Adopter**: ผู้ขอรับเลี้ยง (`email` unique)
- **AdoptionRequest**: คำขอรับเลี้ยง (FK → Adopter, Pet แบบ `onDelete: Cascade`)

## วิธีติดตั้งและรัน

### 1. สร้างฐานข้อมูลออนไลน์ (Neon แนะนำ)
1. สมัครที่ https://neon.tech แล้วสร้าง Project ใหม่
2. คัดลอก **Connection string** (ขึ้นต้นด้วย `postgresql://...`)

### 2. Backend
```powershell
cd server
npm install
copy .env.example .env        # แล้วแก้ DATABASE_URL และ DIRECT_URL เป็นของ Neon
npx prisma migrate deploy     # สร้างตารางในฐานข้อมูล
npx prisma db seed            # ใส่ข้อมูลตัวอย่าง 77 รายการ
npm run dev                   # http://localhost:3000/api
```

### 3. Frontend (เปิดอีกหน้าต่าง)
```powershell
cd client
npm install
npm run dev                   # http://localhost:5173
```

## REST API

| Method | Endpoint | คำอธิบาย | Status |
|---|---|---|---|
| GET | `/api/stats` | ตัวเลขสรุปหน้าแรก | 200 |
| GET | `/api/species` · `/api/shelters` | ข้อมูลสำหรับตัวกรอง/dropdown | 200 |
| GET | `/api/pets?search&speciesId&gender&size&status&sort&limit&ids` | รายการสัตว์ | 200, 400 |
| GET | `/api/pets/:id` | รายละเอียดสัตว์ | 200, 400, 404 |
| POST | `/api/pets` | เพิ่มสัตว์ | 201, 400 |
| PUT | `/api/pets/:id` | แก้ไขทั้งหมด | 200, 400, 404 |
| PATCH | `/api/pets/:id` | แก้ไขบางฟิลด์ (เช่น สถานะ) | 200, 400, 404 |
| DELETE | `/api/pets/:id` | ลบสัตว์ | 204, 404 |
| GET | `/api/adoption-requests?status` | รายการคำขอ | 200 |
| POST | `/api/adoption-requests` | ส่งคำขอรับเลี้ยง | 201, 400, 404, 409 |
| PATCH | `/api/adoption-requests/:id/status` | อนุมัติ/ปฏิเสธ | 200, 400, 404 |
| DELETE | `/api/adoption-requests/:id` | ลบคำขอ | 204, 404 |

ทุก Error ตอบกลับในรูปแบบ `{ "error": { "message": "...", "details": [{ "field", "message" }] } }`

## การแยก State (Dual-State)

| Zustand (Client State) | TanStack Query (Server State) |
|---|---|
| `filterStore` ตัวกรองหน้า /pets (นำไปเป็น queryKey) | `usePets`, `usePet`, `useStats`, `useSpecies`, `useShelters` |
| `favoriteStore` เก็บ **เฉพาะ id** ของรายการโปรด (persist ลง localStorage) | `useAdoptionRequests` |
| `themeStore` โหมดสว่าง/มืด (persist) | Mutations ทุกตัวเรียก `invalidateQueries()` เพื่อให้หน้าจออัปเดตทันที (Zero-Refresh) |
| `toastStore` ข้อความแจ้งเตือน | |

ข้อมูลจากฐานข้อมูลอยู่ใน TanStack Query เพียงที่เดียว (Single Source of Truth) ไม่มีการคัดลอกไปเก็บใน Zustand

## หน้าเว็บ

| Path | หน้า |
|---|---|
| `/` | หน้าแรก (Hero, สถิติ, เลือกตามชนิด, น้องมาใหม่) |
| `/pets` | รายการสัตว์ + ค้นหา/กรอง/เรียง (Items Master Page) |
| `/pets/:id` | รายละเอียดสัตว์ + ฟอร์มขอรับเลี้ยง (Dynamic Detail Page) |
| `/favorites` | รายการโปรด |
| `/admin/pets` | ตารางจัดการสัตว์ (เปลี่ยนสถานะ/แก้ไข/ลบ) |
| `/admin/pets/new`, `/admin/pets/:id/edit` | ฟอร์มเพิ่ม/แก้ไขสัตว์ |
| `/admin/requests` | จัดการคำขอรับเลี้ยง |

## สมาชิกและหน้าที่

| รหัสนักศึกษา | ชื่อ | ส่วนที่รับผิดชอบ |
|---|---|---|
| | | Database (schema.prisma, migration, seed.ts) |
| | | Backend API (routes, controllers, validators) |
| | | Frontend: หน้ารายการ/รายละเอียด + TanStack Query |
| | | Frontend: หน้า Admin + Zustand stores |
| | | UI/UX, สไลด์, Screenshot |

## เตรียมไฟล์ส่ง

รันใน PowerShell จากโฟลเดอร์ `Final Project` (เปลี่ยน `รหัสนักศึกษา` เป็นรหัสของตัวเอง) คำสั่งนี้คัดลอกโปรเจกต์โดยไม่เอา `node_modules`, `dist` และ `.env` แล้วบีบอัดเป็น ZIP

```powershell
$out = "$env:TEMP\final_phase1"; robocopy . $out /E /XD node_modules dist .claude /XF .env | Out-Null; Compress-Archive -Path "$out\*" -DestinationPath "..\final_phase1_รหัสนักศึกษา.zip" -Force; Remove-Item -Recurse -Force $out
```
