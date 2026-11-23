import type { Gender, PetSize, PetSort, PetStatus, RequestStatus } from "../types/models";

/** 30 -> "2 ปี 6 เดือน" */
export function formatAge(months: number): string {
  if (months < 12) return `${months} เดือน`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest > 0 ? `${years} ปี ${rest} เดือน` : `${years} ปี`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const genderLabel: Record<Gender, string> = {
  MALE: "ตัวผู้",
  FEMALE: "ตัวเมีย",
};

export const sizeLabel: Record<PetSize, string> = {
  SMALL: "เล็ก",
  MEDIUM: "กลาง",
  LARGE: "ใหญ่",
};

export const sortLabel: Record<PetSort, string> = {
  newest: "มาใหม่ล่าสุด",
  oldest: "อยู่ศูนย์นานที่สุด",
  name: "ชื่อ ก-ฮ",
  age: "อายุน้อยไปมาก",
};

export const petStatusMeta: Record<PetStatus, { label: string; badge: string }> = {
  AVAILABLE: { label: "พร้อมหาบ้าน", badge: "badge-success" },
  PENDING: { label: "รอพิจารณา", badge: "badge-warning" },
  ADOPTED: { label: "ได้บ้านแล้ว", badge: "badge-neutral" },
};

export const requestStatusMeta: Record<RequestStatus, { label: string; badge: string }> = {
  PENDING: { label: "รอพิจารณา", badge: "badge-warning" },
  APPROVED: { label: "อนุมัติแล้ว", badge: "badge-success" },
  REJECTED: { label: "ปฏิเสธ", badge: "badge-error" },
};

const speciesEmojis: Record<string, string> = { dog: "🐶", cat: "🐱", rabbit: "🐰" };

export function speciesEmoji(slug: string): string {
  return speciesEmojis[slug] ?? "🐾";
}

/** ตรวจว่า value เป็นหนึ่งในค่าที่กำหนด (ใช้แปลงค่า string จาก <select> ให้เป็น Type ที่ถูกต้อง) */
export function isOneOf<T extends string>(values: readonly T[], value: string): value is T {
  return (values as readonly string[]).includes(value);
}
