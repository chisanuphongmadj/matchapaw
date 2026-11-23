/** Type ของข้อมูลที่ได้จาก Backend API (ตรงกับ prisma/schema.prisma) */

export const GENDERS = ["MALE", "FEMALE"] as const;
export const PET_SIZES = ["SMALL", "MEDIUM", "LARGE"] as const;
export const PET_STATUSES = ["AVAILABLE", "PENDING", "ADOPTED"] as const;
export const REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const PET_SORTS = ["newest", "oldest", "name", "age"] as const;

export type Gender = (typeof GENDERS)[number];
export type PetSize = (typeof PET_SIZES)[number];
export type PetStatus = (typeof PET_STATUSES)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type PetSort = (typeof PET_SORTS)[number];

export interface Species {
  id: number;
  name: string;
  slug: string;
  _count?: { pets: number };
}

export interface ShelterSummary {
  id: number;
  name: string;
  province: string;
}

export interface Shelter extends ShelterSummary {
  district: string;
  phone: string;
  description: string | null;
  createdAt: string;
  _count?: { pets: number };
}

interface PetBase {
  id: number;
  name: string;
  breed: string;
  gender: Gender;
  ageMonths: number;
  size: PetSize;
  color: string;
  description: string;
  imageUrl: string | null;
  vaccinated: boolean;
  sterilized: boolean;
  status: PetStatus;
  speciesId: number;
  shelterId: number;
  createdAt: string;
  updatedAt: string;
  species: Species;
  _count: { adoptionRequests: number };
}

/** สัตว์ในหน้ารายการ (shelter แบบย่อ) */
export interface Pet extends PetBase {
  shelter: ShelterSummary;
}

/** สัตว์ในหน้ารายละเอียด (shelter แบบเต็ม) */
export interface PetDetail extends PetBase {
  shelter: Shelter;
}

/** ข้อมูลที่ส่งไปตอนเพิ่ม/แก้ไขสัตว์ */
export interface PetInput {
  name: string;
  breed: string;
  gender: Gender;
  ageMonths: number;
  size: PetSize;
  color: string;
  description: string;
  imageUrl: string | null;
  vaccinated: boolean;
  sterilized: boolean;
  status: PetStatus;
  speciesId: number;
  shelterId: number;
}

export interface Adopter {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface AdoptionRequest {
  id: number;
  message: string;
  status: RequestStatus;
  adopterId: number;
  petId: number;
  createdAt: string;
  updatedAt: string;
  adopter: Adopter;
  pet: {
    id: number;
    name: string;
    imageUrl: string | null;
    status: PetStatus;
    species: { name: string; slug: string };
  };
}

/** อีเมลไม่ต้องส่ง: Server ใช้อีเมลของบัญชีที่ล็อกอินอยู่ */
export interface AdoptionRequestInput {
  petId: number;
  name: string;
  phone: string;
  message: string;
}

export type Role = "USER" | "ADMIN";

/** ผู้ใช้ที่ล็อกอินอยู่ (ได้จาก GET /api/auth/me) */
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export interface Stats {
  totalPets: number;
  available: number;
  pending: number;
  adopted: number;
  shelters: number;
  pendingRequests: number;
}

/** เงื่อนไขค้นหาสัตว์ (เก็บใน Zustand และใช้เป็น queryKey ของ TanStack Query) */
export interface PetFilters {
  search: string;
  speciesId: number | null;
  gender: Gender | null;
  size: PetSize | null;
  status: PetStatus | null;
  sort: PetSort;
}
