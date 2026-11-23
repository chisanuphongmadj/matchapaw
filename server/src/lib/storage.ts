import { randomUUID } from "node:crypto";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import { HttpError } from "../utils/HttpError";

/**
 * อัปโหลดรูปไปเก็บที่ Supabase Storage
 * ต้องตั้งค่าใน .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (และ SUPABASE_BUCKET ถ้าไม่ใช้ชื่อ pet-images)
 * ครั้งแรกที่อัปโหลด ถ้ายังไม่มี bucket ระบบจะสร้างให้เป็นแบบ public อัตโนมัติ
 */
const BUCKET = process.env["SUPABASE_BUCKET"] ?? "pet-images";

let client: SupabaseClient | null = null;
let bucketReady = false;

export function isStorageEnabled(): boolean {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]);
}

function getClient(): SupabaseClient {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) {
    throw new HttpError(503, "ยังไม่ได้ตั้งค่า Supabase Storage (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  }
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

async function ensureBucket(supabase: SupabaseClient): Promise<void> {
  if (bucketReady) return;
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error && !/already exists/i.test(error.message)) {
      throw new HttpError(503, `สร้าง bucket ไม่สำเร็จ: ${error.message}`);
    }
  }
  bucketReady = true;
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const ALLOWED_IMAGE_TYPES = Object.keys(EXTENSIONS);

/** อัปโหลดไฟล์รูปแล้วคืน URL สาธารณะ */
export async function uploadPetImage(file: { buffer: Buffer; mimetype: string }): Promise<string> {
  const supabase = getClient();
  await ensureBucket(supabase);

  const path = `pets/${Date.now()}-${randomUUID()}.${EXTENSIONS[file.mimetype] ?? "jpg"}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) throw new HttpError(502, `อัปโหลดรูปไม่สำเร็จ: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
