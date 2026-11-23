/**
 * =============================================================================
 * prisma/seed.ts - ข้อมูลตั้งต้นของ MatchAPaw
 * รันด้วย: npx prisma db seed
 *
 * จำนวนข้อมูล: Species 3 + Shelter 6 + Pet 44 + Adopter 10 + AdoptionRequest 14
 *            + User 2 = 79 รายการ
 *
 * ลำดับการทำงาน (ต้องเคารพ Foreign Key):
 *   ลบ: ตารางลูกก่อน -> ตารางแม่  (AdoptionRequest -> Adopter -> User -> Pet -> Shelter -> Species)
 *   สร้าง: ตารางแม่ก่อน -> ตารางลูก (Species/Shelter -> Pet -> User -> Adopter -> AdoptionRequest)
 *
 * บัญชีทดสอบ (สำหรับพัฒนาและ Demo เท่านั้น):
 *   เจ้าหน้าที่ (ADMIN): admin@matchapaw.test / Admin1234!
 *   ผู้ใช้ทั่วไป (USER): user@matchapaw.test  / User1234!
 * =============================================================================
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  Gender,
  PetSize,
  PetStatus,
  PrismaClient,
  RequestStatus,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const TEST_USERS = [
  { name: "เจ้าหน้าที่ MatchAPaw", email: "admin@matchapaw.test", password: "Admin1234!", role: Role.ADMIN },
  { name: "ผู้ใช้ทดลอง", email: "user@matchapaw.test", password: "User1234!", role: Role.USER },
] as const;

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// รูปภาพตัวอย่าง (เว็บรูปฟรีสำหรับนักพัฒนา)
// ---------------------------------------------------------------------------
const dogImage = (id: number): string => `https://placedog.net/640/480?id=${id}`;
const catImage = (id: string): string => `https://cataas.com/cat/${id}?width=640`;

const CAT_IDS = [
  "05Xd4JtN14983pns", "0F0IKAPOdWiE755P", "0mstmOIucwiN80jb", "0Q2ZmTHQ0vC6NsHa",
  "0ztFbDrgDV2K7yJ1", "1bJraW0IwSPm3MVd", "1CF7xZmlX0t8QpgP", "1DrcyohjhwcNaRIz",
  "1KeQpy7eHqi0SFmc", "1N2AH31jiY6N9TYc", "1ntkA1kLWffNS2xN", "1q5PkOQRtKNqESGF",
  "1si02A2ZNdeNH3yo", "1wpap8yckt96vOoU", "1Y3dpssxcbHPEkfO", "22tTAaFI1Q33YBGO",
  "28ZtVybuyptnWzTM", "2AjkEyDta2fk44NE",
] as const;

// ---------------------------------------------------------------------------
// ข้อมูลตั้งต้น
// ---------------------------------------------------------------------------
const speciesData = [
  { name: "สุนัข", slug: "dog" },
  { name: "แมว", slug: "cat" },
  { name: "กระต่าย", slug: "rabbit" },
] as const;

type SpeciesSlug = (typeof speciesData)[number]["slug"];

const shelterData = [
  {
    name: "บ้านอุ่นสี่ขา",
    province: "กรุงเทพมหานคร",
    district: "บางนา",
    phone: "02-111-2201",
    description: "บ้านพักพิงขนาดกลาง ดูแลสุนัขและแมวที่ถูกทิ้งในเขตกรุงเทพฯ ฝั่งตะวันออก",
  },
  {
    name: "มูลนิธิรักเหมียวโฮ่ง",
    province: "นนทบุรี",
    district: "ปากเกร็ด",
    phone: "02-111-2202",
    description: "อาสาสมัครชุมชนช่วยกันรับสัตว์จรมาทำหมัน ฉีดวัคซีน และหาบ้านใหม่",
  },
  {
    name: "ศูนย์พักพิงสัตว์ดอยงาม",
    province: "เชียงใหม่",
    district: "แม่ริม",
    phone: "053-111-203",
    description: "ศูนย์บนพื้นที่กว้าง เหมาะกับสุนัขพันธุ์ใหญ่ มีลานวิ่งเล่นและสัตวแพทย์ประจำ",
  },
  {
    name: "บ้านหางกระดิก",
    province: "ขอนแก่น",
    district: "เมืองขอนแก่น",
    phone: "043-111-204",
    description: "บ้านพักพิงที่ร่วมมือกับมหาวิทยาลัย นักศึกษาสัตวแพทย์ช่วยดูแลสุขภาพ",
  },
  {
    name: "กลุ่มอาสาเพื่อนจร ริมทะเล",
    province: "ชลบุรี",
    district: "บางแสน",
    phone: "038-111-205",
    description: "ช่วยเหลือสัตว์จรตามชายหาด เน้นลูกสุนัขและลูกแมวแรกเกิด",
  },
  {
    name: "สวนพักใจสัตว์เลี้ยง",
    province: "นครปฐม",
    district: "พุทธมณฑล",
    phone: "02-111-2206",
    description: "ดูแลสัตว์สูงวัยและสัตว์ที่ต้องการการฟื้นฟูหลังบาดเจ็บ",
  },
] as const;

interface SeedPet {
  name: string;
  species: SpeciesSlug;
  breed: string;
  gender: Gender;
  ageMonths: number;
  size: PetSize;
  color: string;
  vaccinated: boolean;
  sterilized: boolean;
  status: PetStatus;
  shelter: number; // index ใน shelterData
  description: string;
}

const { MALE, FEMALE } = Gender;
const { SMALL, MEDIUM, LARGE } = PetSize;
const { AVAILABLE, PENDING, ADOPTED } = PetStatus;

// ลำดับในอาร์เรย์นี้สำคัญ: requestData อ้างอิงสัตว์ด้วยเลขลำดับ (เริ่มที่ 1)
const petData: SeedPet[] = [
  // ----- สุนัข (22) -----
  { name: "ข้าวตัง", species: "dog", breed: "พันธุ์ผสม", gender: MALE, ageMonths: 24, size: MEDIUM, color: "น้ำตาลทอง", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 0, description: "ร่าเริง ชอบวิ่งเล่น เข้ากับเด็กได้ดี ถูกพบที่ตลาดนัดและได้รับการรักษาจนแข็งแรงแล้ว" },
  { name: "โมจิ", species: "dog", breed: "ปอมเมอเรเนียน", gender: FEMALE, ageMonths: 36, size: SMALL, color: "ส้ม", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 1, description: "ขี้อ้อน ชอบให้อุ้ม เหมาะกับคอนโดหรือบ้านที่มีคนอยู่ทั้งวัน" },
  { name: "บราวนี่", species: "dog", breed: "ลาบราดอร์ผสม", gender: MALE, ageMonths: 48, size: LARGE, color: "ช็อกโกแลต", vaccinated: true, sterilized: true, status: PENDING, shelter: 0, description: "ใจดี เชื่อฟังคำสั่งพื้นฐาน ชอบว่ายน้ำ ต้องการบ้านที่มีพื้นที่ให้ออกกำลังกาย" },
  { name: "ถั่วแดง", species: "dog", breed: "ไทยหลังอาน", gender: FEMALE, ageMonths: 18, size: MEDIUM, color: "แดง", vaccinated: true, sterilized: false, status: AVAILABLE, shelter: 2, description: "ฉลาด ระวังภัยดี ผูกพันกับเจ้าของมาก เหมาะกับคนที่มีประสบการณ์เลี้ยงสุนัข" },
  { name: "ลูกชิ้น", species: "dog", breed: "ชิวาวา", gender: MALE, ageMonths: 60, size: SMALL, color: "ครีม", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 3, description: "ตัวเล็กแต่ใจใหญ่ ชอบนอนบนตัก เงียบสงบเหมาะกับผู้สูงอายุ" },
  { name: "นมสด", species: "dog", breed: "พันธุ์ผสม", gender: FEMALE, ageMonths: 6, size: SMALL, color: "ขาว", vaccinated: true, sterilized: false, status: AVAILABLE, shelter: 4, description: "ลูกสุนัขที่ถูกพบริมชายหาด ขี้เล่น กำลังเรียนรู้การขับถ่ายเป็นที่" },
  { name: "ดำดี", species: "dog", breed: "ไทยบางแก้วผสม", gender: MALE, ageMonths: 30, size: MEDIUM, color: "ดำ", vaccinated: true, sterilized: true, status: ADOPTED, shelter: 1, description: "ซื่อสัตย์ เฝ้าบ้านเก่ง ได้บ้านใหม่ที่มีสวนกว้างแล้ว" },
  { name: "ขนมปัง", species: "dog", breed: "โกลเด้นรีทรีฟเวอร์ผสม", gender: FEMALE, ageMonths: 72, size: LARGE, color: "ทอง", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 5, description: "สุนัขสูงวัยใจดี เดินช้าลงแต่ยังชอบออกไปเดินเล่นตอนเย็น" },
  { name: "ซูชิ", species: "dog", breed: "ชิบะผสม", gender: MALE, ageMonths: 20, size: MEDIUM, color: "น้ำตาลแดง", vaccinated: true, sterilized: true, status: PENDING, shelter: 2, description: "มีความเป็นตัวของตัวเองสูง สะอาด ไม่ชอบเลอะเทอะ" },
  { name: "ป๊อปคอร์น", species: "dog", breed: "พุดเดิ้ล", gender: FEMALE, ageMonths: 40, size: SMALL, color: "ขาวครีม", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 3, description: "ขนไม่ค่อยร่วง ฉลาด เรียนรู้ทริกใหม่ได้เร็วมาก" },
  { name: "เสือ", species: "dog", breed: "พันธุ์ผสม", gender: MALE, ageMonths: 84, size: LARGE, color: "ลายเสือ", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 0, description: "หน้าดุแต่ใจดีมาก อยู่ศูนย์มานานกว่า 3 ปี รอคนที่มองเห็นความน่ารักของเขา" },
  { name: "ส้มโอ", species: "dog", breed: "คอร์กี้ผสม", gender: FEMALE, ageMonths: 28, size: SMALL, color: "ส้มขาว", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 4, description: "ขาสั้นวิ่งเร็ว เป็นมิตรกับสุนัขตัวอื่นและแมว" },
  { name: "ไข่ตุ๋น", species: "dog", breed: "พันธุ์ผสม", gender: MALE, ageMonths: 4, size: SMALL, color: "เหลืองอ่อน", vaccinated: false, sterilized: false, status: AVAILABLE, shelter: 5, description: "ลูกสุนัขวัยกำลังซน รอฉีดวัคซีนเข็มแรกสัปดาห์หน้า" },
  { name: "ทองหยิบ", species: "dog", breed: "ไทยหลังอาน", gender: FEMALE, ageMonths: 54, size: MEDIUM, color: "น้ำตาลทอง", vaccinated: true, sterilized: true, status: ADOPTED, shelter: 2, description: "ได้บ้านใหม่กับครอบครัวที่มีลูกเล็กสองคนแล้ว" },
  { name: "มะขาม", species: "dog", breed: "บีเกิ้ลผสม", gender: MALE, ageMonths: 32, size: MEDIUM, color: "สามสี", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 1, description: "จมูกไวชอบดมกลิ่น ต้องพาเดินเล่นทุกวันเพื่อใช้พลังงาน" },
  { name: "เมฆ", species: "dog", breed: "ไซบีเรียนฮัสกี้", gender: MALE, ageMonths: 44, size: LARGE, color: "เทาขาว", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 3, description: "ช่างพูด หอนเก่ง ต้องการบ้านที่มีแอร์และเวลาเล่นด้วย" },
  { name: "ปุยฝ้าย", species: "dog", breed: "ชิสุ", gender: FEMALE, ageMonths: 96, size: SMALL, color: "ขาวน้ำตาล", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 0, description: "สุนัขสูงวัยที่เจ้าของเดิมเสียชีวิต อ่อนโยนและชอบความสงบ" },
  { name: "ออเรนจ์", species: "dog", breed: "พันธุ์ผสม", gender: MALE, ageMonths: 14, size: MEDIUM, color: "ส้ม", vaccinated: true, sterilized: false, status: PENDING, shelter: 4, description: "พลังงานเหลือล้น ชอบเล่นลูกบอล เหมาะกับคนชอบวิ่ง" },
  { name: "หมูแดง", species: "dog", breed: "พันธุ์ผสม", gender: FEMALE, ageMonths: 66, size: MEDIUM, color: "แดงอิฐ", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 5, description: "ขาหลังเคยบาดเจ็บแต่หายดีแล้ว เดินได้ปกติ นิสัยสุภาพ" },
  { name: "ลาเต้", species: "dog", breed: "ดัชชุนด์ผสม", gender: MALE, ageMonths: 38, size: SMALL, color: "น้ำตาลเข้ม", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 1, description: "ชอบมุดผ้าห่ม ขี้อ้อน เข้ากับคนแปลกหน้าได้เร็ว" },
  { name: "ภูผา", species: "dog", breed: "เยอรมันเชพเพิร์ดผสม", gender: MALE, ageMonths: 58, size: LARGE, color: "ดำน้ำตาล", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 2, description: "ผ่านการฝึกเชื่อฟังเบื้องต้น สุขุม เหมาะกับบ้านที่มีรั้วรอบขอบชิด" },
  { name: "น้ำผึ้ง", species: "dog", breed: "พันธุ์ผสม", gender: FEMALE, ageMonths: 10, size: SMALL, color: "น้ำผึ้ง", vaccinated: true, sterilized: false, status: AVAILABLE, shelter: 3, description: "ขี้อาย ต้องใช้เวลาทำความคุ้นเคย แต่เมื่อไว้ใจแล้วจะติดเจ้าของมาก" },

  // ----- แมว (18) -----
  { name: "ส้มจี๊ด", species: "cat", breed: "แมวส้มไทย", gender: MALE, ageMonths: 12, size: SMALL, color: "ส้ม", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 0, description: "แมวส้มสายกิน ชอบนอนกลางแดด เข้ากับแมวตัวอื่นได้" },
  { name: "มิวมิว", species: "cat", breed: "เปอร์เซียผสม", gender: FEMALE, ageMonths: 30, size: SMALL, color: "ขาว", vaccinated: true, sterilized: true, status: PENDING, shelter: 1, description: "ขนยาวนุ่ม ต้องแปรงขนสม่ำเสมอ นิสัยเรียบร้อย" },
  { name: "ถ่านหิน", species: "cat", breed: "แมวดำไทย", gender: MALE, ageMonths: 26, size: MEDIUM, color: "ดำ", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 2, description: "แมวดำนำโชค ขี้เล่น ชอบไล่จับของเล่นขนนก" },
  { name: "สามสี", species: "cat", breed: "แมวสามสี", gender: FEMALE, ageMonths: 42, size: SMALL, color: "ขาวส้มดำ", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 3, description: "ช่างสังเกต ชอบนั่งริมหน้าต่าง รักสงบ" },
  { name: "วิเชียร", species: "cat", breed: "วิเชียรมาศ", gender: MALE, ageMonths: 60, size: MEDIUM, color: "ครีมแต้มน้ำตาล", vaccinated: true, sterilized: true, status: ADOPTED, shelter: 4, description: "ได้บ้านใหม่กับคุณยายที่อยู่บ้านคนเดียวแล้ว" },
  { name: "ข้าวปั้น", species: "cat", breed: "พันธุ์ผสม", gender: FEMALE, ageMonths: 5, size: SMALL, color: "ขาวเทา", vaccinated: false, sterilized: false, status: AVAILABLE, shelter: 5, description: "ลูกแมวกำพร้า กินเก่ง กำลังจะได้รับวัคซีนเข็มแรก" },
  { name: "ลายสลิด", species: "cat", breed: "แมวลายสลิด (ทาบี้)", gender: MALE, ageMonths: 36, size: MEDIUM, color: "น้ำตาลลาย", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 0, description: "นักล่าตัวยง ชอบปีนป่าย ควรมีคอนโดแมวให้เล่น" },
  { name: "ขาวมณี", species: "cat", breed: "ขาวมณี", gender: FEMALE, ageMonths: 48, size: SMALL, color: "ขาว", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 1, description: "ตาสองสีสวยงาม หูได้ยินปกติ ชอบให้ลูบหัว" },
  { name: "โกโก้", species: "cat", breed: "สก็อตติชโฟลด์ผสม", gender: MALE, ageMonths: 22, size: SMALL, color: "เทา", vaccinated: true, sterilized: true, status: PENDING, shelter: 2, description: "หูพับน่ารัก นิสัยนิ่ง ๆ เหมาะกับห้องพักขนาดเล็ก" },
  { name: "มะลิ", species: "cat", breed: "พันธุ์ผสม", gender: FEMALE, ageMonths: 16, size: SMALL, color: "ขาวเทา", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 3, description: "ขี้อ้อน ชอบเดินตามเจ้าของไปทุกห้อง" },
  { name: "ทักซิโด้", species: "cat", breed: "แมวทักซิโด้", gender: MALE, ageMonths: 54, size: MEDIUM, color: "ขาวดำ", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 4, description: "ใส่สูทตลอดเวลา สุภาพ ชอบนอนบนโซฟา" },
  { name: "ฟักทอง", species: "cat", breed: "แมวส้มไทย", gender: FEMALE, ageMonths: 8, size: SMALL, color: "ส้มอ่อน", vaccinated: true, sterilized: false, status: AVAILABLE, shelter: 5, description: "วัยรุ่นซุกซน ชอบกล่องกระดาษเป็นชีวิตจิตใจ" },
  { name: "ชาไทย", species: "cat", breed: "พันธุ์ผสม", gender: MALE, ageMonths: 70, size: MEDIUM, color: "ส้มเข้ม", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 0, description: "แมวสูงวัยใจเย็น เคยเป็นแมวประจำร้านกาแฟ คุ้นเคยกับคนเยอะ" },
  { name: "หมอก", species: "cat", breed: "โคราช (สีสวาด)", gender: FEMALE, ageMonths: 34, size: SMALL, color: "เทาเงิน", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 1, description: "แมวไทยโบราณขนสีเงิน ผูกพันกับเจ้าของคนเดียว" },
  { name: "นูเทลล่า", species: "cat", breed: "เมนคูนผสม", gender: MALE, ageMonths: 40, size: LARGE, color: "น้ำตาลเข้ม", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 2, description: "ตัวใหญ่ขนฟู ใจดีเหมือนสุนัข เข้ากับเด็กได้ดี" },
  { name: "ไข่มุก", species: "cat", breed: "พันธุ์ผสม", gender: FEMALE, ageMonths: 3, size: SMALL, color: "ขาว", vaccinated: false, sterilized: false, status: AVAILABLE, shelter: 3, description: "ลูกแมวตัวจิ๋ว ต้องการคนที่มีเวลาดูแลใกล้ชิด" },
  { name: "บัตเตอร์", species: "cat", breed: "บริติชช็อตแฮร์ผสม", gender: MALE, ageMonths: 28, size: MEDIUM, color: "เทาฟ้า", vaccinated: true, sterilized: true, status: ADOPTED, shelter: 4, description: "ได้บ้านใหม่กับคู่รักที่เพิ่งย้ายเข้าคอนโดแล้ว" },
  { name: "แพนเค้ก", species: "cat", breed: "พันธุ์ผสม", gender: FEMALE, ageMonths: 90, size: SMALL, color: "ครีม", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 5, description: "แมวยายใจดี นอนเยอะ ต้องการบ้านที่เงียบสงบในบั้นปลาย" },

  // ----- กระต่าย (4) -----
  { name: "ปุยนุ่น", species: "rabbit", breed: "ฮอลแลนด์ลอป", gender: FEMALE, ageMonths: 12, size: SMALL, color: "ขาว", vaccinated: true, sterilized: false, status: AVAILABLE, shelter: 3, description: "หูตก ขนนุ่ม ชอบกินผักบุ้งและหญ้าทิโมธี" },
  { name: "แครอท", species: "rabbit", breed: "เนเธอร์แลนด์ดวาร์ฟ", gender: MALE, ageMonths: 8, size: SMALL, color: "น้ำตาล", vaccinated: false, sterilized: false, status: AVAILABLE, shelter: 1, description: "ตัวเล็กมาก ขี้ตกใจ ต้องการบ้านที่ไม่มีเสียงดัง" },
  { name: "โอวัลติน", species: "rabbit", breed: "ไลอ้อนเฮด", gender: MALE, ageMonths: 20, size: SMALL, color: "น้ำตาลส้ม", vaccinated: true, sterilized: true, status: AVAILABLE, shelter: 5, description: "แผงคอฟูเหมือนสิงโต ชอบให้หวีขน" },
  { name: "ดังโงะ", species: "rabbit", breed: "พันธุ์ผสม", gender: FEMALE, ageMonths: 15, size: SMALL, color: "ขาวดำ", vaccinated: true, sterilized: false, status: PENDING, shelter: 0, description: "ร่าเริง กระโดดเก่ง ฝึกเข้ากระบะทรายได้แล้ว" },
];

const adopterData = [
  { name: "สมชาย ใจดี", email: "somchai@example.com", phone: "081-000-0001" },
  { name: "สุดารัตน์ แสงทอง", email: "sudarat@example.com", phone: "081-000-0002" },
  { name: "ธนพล วงศ์ใหญ่", email: "thanaphon@example.com", phone: "081-000-0003" },
  { name: "กมลชนก ศรีสุข", email: "kamonchanok@example.com", phone: "081-000-0004" },
  { name: "ปิยะพงษ์ มีสุข", email: "piyaphong@example.com", phone: "081-000-0005" },
  { name: "อรอุมา บุญมา", email: "onuma@example.com", phone: "081-000-0006" },
  { name: "วีรยุทธ ทองดี", email: "weerayut@example.com", phone: "081-000-0007" },
  { name: "ณัฐธิดา พรหมมา", email: "natthida@example.com", phone: "081-000-0008" },
  { name: "ชยพล รุ่งเรือง", email: "chayapol@example.com", phone: "081-000-0009" },
  { name: "พิมพ์ชนก แก้วใส", email: "pimchanok@example.com", phone: "081-000-0010" },
] as const;

// [ลำดับผู้รับเลี้ยง (0-based), ลำดับสัตว์ใน petData (1-based), สถานะ, ข้อความ]
const requestData: ReadonlyArray<[number, number, RequestStatus, string]> = [
  [0, 3, RequestStatus.PENDING, "บ้านมีสนามหญ้ากว้าง และเคยเลี้ยงลาบราดอร์มาก่อนครับ"],
  [1, 3, RequestStatus.PENDING, "ทำงานที่บ้าน มีเวลาพาเดินเล่นทุกเช้าเย็นค่ะ"],
  [2, 9, RequestStatus.PENDING, "ชอบสุนัขสายญี่ปุ่นมาก พร้อมดูแลตลอดชีวิตครับ"],
  [3, 18, RequestStatus.PENDING, "เป็นนักวิ่ง อยากได้เพื่อนวิ่งด้วยทุกวันค่ะ"],
  [4, 24, RequestStatus.PENDING, "มีประสบการณ์เลี้ยงแมวขนยาว แปรงขนให้ได้ทุกวันครับ"],
  [5, 31, RequestStatus.PENDING, "อยู่คอนโดที่อนุญาตให้เลี้ยงแมวค่ะ"],
  [6, 44, RequestStatus.PENDING, "ลูกสาวอยากเลี้ยงกระต่ายมาก จะช่วยกันดูแลครับ"],
  [7, 7, RequestStatus.APPROVED, "บ้านมีสวนและรั้วรอบ เคยเลี้ยงบางแก้วมาก่อนค่ะ"],
  [8, 7, RequestStatus.REJECTED, "อยากได้สุนัขเฝ้าบ้านครับ"],
  [9, 14, RequestStatus.APPROVED, "ครอบครัวมีลูกเล็กที่รักสัตว์มากค่ะ"],
  [0, 27, RequestStatus.APPROVED, "ซื้อให้คุณแม่ที่อยู่บ้านคนเดียวเป็นเพื่อนครับ"],
  [1, 39, RequestStatus.APPROVED, "เพิ่งย้ายเข้าคอนโดใหม่ อยากมีเพื่อนสี่ขาค่ะ"],
  [2, 39, RequestStatus.REJECTED, "สนใจรับเลี้ยงครับ"],
  [3, 24, RequestStatus.PENDING, "เคยเลี้ยงเปอร์เซียมา 10 ปี รู้วิธีดูแลดีค่ะ"],
];

async function main(): Promise<void> {
  console.log("🧹 ล้างข้อมูลเดิม...");
  await prisma.adoptionRequest.deleteMany();
  await prisma.adopter.deleteMany();
  await prisma.user.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.shelter.deleteMany();
  await prisma.species.deleteMany();

  console.log("🐾 สร้างชนิดสัตว์และบ้านพักพิง...");
  const speciesIdBySlug = new Map<SpeciesSlug, number>();
  for (const s of speciesData) {
    const created = await prisma.species.create({ data: s });
    speciesIdBySlug.set(s.slug, created.id);
  }

  const shelterIds: number[] = [];
  for (const s of shelterData) {
    const created = await prisma.shelter.create({ data: s });
    shelterIds.push(created.id);
  }

  console.log("🐶 สร้างข้อมูลสัตว์...");
  const petIds: number[] = [];
  let dogCount = 0;
  let catCount = 0;
  const DAY_MS = 24 * 60 * 60 * 1000;
  for (const [index, p] of petData.entries()) {
    const speciesId = speciesIdBySlug.get(p.species);
    const shelterId = shelterIds[p.shelter];
    if (speciesId === undefined || shelterId === undefined) {
      throw new Error(`ข้อมูลอ้างอิงของ ${p.name} ไม่ถูกต้อง`);
    }

    let imageUrl: string | null = null;
    if (p.species === "dog") imageUrl = dogImage(++dogCount * 7);
    if (p.species === "cat") imageUrl = catImage(CAT_IDS[catCount++ % CAT_IDS.length] ?? CAT_IDS[0]);

    // กระจายวันที่เข้าศูนย์ (0-43 วันก่อน) ให้สุนัข/แมว/กระต่ายปนกันเมื่อเรียงตาม "มาใหม่ล่าสุด"
    const createdAt = new Date(Date.now() - ((index * 37) % petData.length) * DAY_MS);

    const { species: _species, shelter: _shelter, ...fields } = p;
    const created = await prisma.pet.create({
      data: { ...fields, imageUrl, speciesId, shelterId, createdAt },
    });
    petIds.push(created.id);
  }

  console.log("🔑 สร้างบัญชีทดสอบ...");
  for (const u of TEST_USERS) {
    await prisma.user.create({
      data: { name: u.name, email: u.email, role: u.role, passwordHash: await bcrypt.hash(u.password, 10) },
    });
  }

  console.log("🙋 สร้างผู้รับเลี้ยงและคำขอ...");
  const adopterIds: number[] = [];
  for (const a of adopterData) {
    const created = await prisma.adopter.create({ data: a });
    adopterIds.push(created.id);
  }

  for (const [adopterIndex, petNo, status, message] of requestData) {
    const adopterId = adopterIds[adopterIndex];
    const petId = petIds[petNo - 1];
    if (adopterId === undefined || petId === undefined) {
      throw new Error(`คำขอ adopter=${adopterIndex} pet=${petNo} อ้างอิงไม่ถูกต้อง`);
    }
    await prisma.adoptionRequest.create({ data: { adopterId, petId, status, message } });
  }

  const total =
    speciesData.length +
    shelterData.length +
    petData.length +
    adopterData.length +
    requestData.length +
    TEST_USERS.length;
  console.log(`✅ Seed สำเร็จ ทั้งหมด ${total} รายการ (สัตว์ ${petData.length} ตัว)`);
}

main()
  .catch((error: unknown) => {
    console.error("❌ Seed ล้มเหลว:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
