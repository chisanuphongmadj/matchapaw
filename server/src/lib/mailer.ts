/**
 * ส่งอีเมลผ่าน Resend (https://resend.com) ด้วย HTTP API
 * - ไม่ได้ตั้ง RESEND_API_KEY: ข้ามการส่ง (แสดง log) ระบบส่วนอื่นยังทำงานปกติ
 * - ส่งไม่สำเร็จ: log error แต่ไม่ทำให้ request ของผู้ใช้ล้มเหลว
 *
 * หมายเหตุ: บัญชี Resend ฟรีที่ยังไม่ยืนยันโดเมน ส่งได้เฉพาะอีเมลเจ้าของบัญชีเท่านั้น
 */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

const RESEND_URL = "https://api.resend.com/emails";

export function isEmailEnabled(): boolean {
  return Boolean(process.env["RESEND_API_KEY"]);
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.info(`[email] ข้ามการส่ง (ยังไม่ได้ตั้ง RESEND_API_KEY): "${message.subject}" → ${message.to}`);
    return;
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env["EMAIL_FROM"] ?? "MatchAPaw <onboarding@resend.dev>",
        to: [message.to],
        subject: message.subject,
        html: message.html,
      }),
    });
    if (!response.ok) {
      console.error(`[email] ส่งไม่สำเร็จ (${response.status}):`, await response.text());
      return;
    }
    console.info(`[email] ส่งแล้ว: "${message.subject}" → ${message.to}`);
  } catch (error: unknown) {
    console.error("[email] ส่งไม่สำเร็จ:", error);
  }
}
