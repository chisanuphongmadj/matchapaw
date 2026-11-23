import { RequestStatus } from "@prisma/client";
import { sendEmail } from "./mailer";

/** ข้อมูลขั้นต่ำของคำขอที่ใช้สร้างอีเมล */
interface RequestForEmail {
  status: RequestStatus;
  adopter: { name: string; email: string };
  pet: { id: number; name: string };
}

const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

function petLink(petId: number): string {
  const origin = (process.env["CLIENT_ORIGIN"] ?? "http://localhost:5173").split(",")[0]?.trim();
  return `${origin}/pets/${petId}`;
}

function layout(title: string, body: string): string {
  return `<div style="font-family:Tahoma,sans-serif;max-width:520px;margin:auto;color:#1f2a1c">
  <h2 style="color:#5f8b4c">🐾 MatchAPaw</h2>
  <h3>${title}</h3>${body}
  <p style="color:#667563;font-size:13px">อีเมลนี้ส่งอัตโนมัติจากระบบ MatchAPaw</p></div>`;
}

/** แจ้งผู้ขอว่าได้รับคำขอแล้ว */
export function notifyRequestReceived(request: RequestForEmail): Promise<void> {
  const name = escapeHtml(request.adopter.name);
  const pet = escapeHtml(request.pet.name);
  return sendEmail({
    to: request.adopter.email,
    subject: `ได้รับคำขอรับเลี้ยง "${request.pet.name}" แล้ว`,
    html: layout(
      `สวัสดีคุณ ${name}`,
      `<p>เราได้รับคำขอรับเลี้ยงน้อง <b>${pet}</b> ของคุณแล้ว บ้านพักพิงจะพิจารณาและแจ้งผลทางอีเมลนี้</p>
       <p><a href="${petLink(request.pet.id)}">ดูข้อมูลน้อง ${pet}</a></p>`,
    ),
  });
}

/** แจ้งผลการพิจารณา (อนุมัติ / ปฏิเสธ) */
export function notifyRequestDecision(request: RequestForEmail): Promise<void> {
  if (request.status === RequestStatus.PENDING) return Promise.resolve();
  const approved = request.status === RequestStatus.APPROVED;
  const name = escapeHtml(request.adopter.name);
  const pet = escapeHtml(request.pet.name);
  return sendEmail({
    to: request.adopter.email,
    subject: approved
      ? `ยินดีด้วย! คำขอรับเลี้ยง "${request.pet.name}" ได้รับการอนุมัติ`
      : `ผลการพิจารณาคำขอรับเลี้ยง "${request.pet.name}"`,
    html: layout(
      `สวัสดีคุณ ${name}`,
      approved
        ? `<p>คำขอรับเลี้ยงน้อง <b>${pet}</b> ได้รับการ<b style="color:#5f8b4c">อนุมัติ</b>แล้ว 🎉 บ้านพักพิงจะติดต่อกลับเพื่อนัดรับน้อง</p>`
        : `<p>ขออภัย คำขอรับเลี้ยงน้อง <b>${pet}</b> ไม่ได้รับการอนุมัติในครั้งนี้ ยังมีน้องอีกหลายตัวที่รอบ้านอยู่</p>`,
    ),
  });
}
