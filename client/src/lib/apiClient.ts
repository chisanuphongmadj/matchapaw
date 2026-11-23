import { useAuthStore } from "../stores/authStore";
import type { ApiErrorBody, ValidationIssue } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

/** Error จาก API ที่มี status code และรายละเอียดของแต่ละฟิลด์ */
export class ApiError extends Error {
  readonly status: number;
  readonly details: ValidationIssue[];

  constructor(message: string, status: number, details: ValidationIssue[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  /** แปลง details เป็น { ชื่อฟิลด์: ข้อความ } เพื่อแสดงใต้ช่องกรอก */
  get fieldErrors(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const issue of this.details) {
      result[issue.field] ??= issue.message;
    }
    return result;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null || !("error" in value)) return false;
  const error: unknown = value.error;
  return typeof error === "object" && error !== null && "message" in error;
}

/** ดึงข้อความ error ที่อ่านเข้าใจได้จาก error ทุกชนิด */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}

type QueryValue = string | number | null | undefined;

/** สร้าง query string โดยข้ามค่าที่ว่าง เช่น { search: "", speciesId: 1 } -> "?speciesId=1" */
export function toQueryString(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // FormData (อัปโหลดไฟล์) ให้เบราว์เซอร์ตั้ง Content-Type เอง ส่วนข้อมูลอื่นส่งเป็น JSON
  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { method, headers, body: requestBody });
  } catch {
    throw new ApiError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่", 0);
  }

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // token หมดอายุหรือใช้ไม่ได้แล้ว -> ออกจากระบบอัตโนมัติ
    if (response.status === 401 && token) useAuthStore.getState().logout();
    if (isApiErrorBody(payload)) {
      throw new ApiError(payload.error.message, response.status, payload.error.details);
    }
    throw new ApiError(`เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (HTTP ${response.status})`, response.status);
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>("GET", path),
  post: <T>(path: string, body: unknown): Promise<T> => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown): Promise<T> => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown): Promise<T> => request<T>("PATCH", path, body),
  delete: (path: string): Promise<void> => request<void>("DELETE", path),
  upload: <T>(path: string, form: FormData): Promise<T> => request<T>("POST", path, form),
};
