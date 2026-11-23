import { useState, type FormEvent, type ReactElement } from "react";
import { Link, useLocation } from "react-router";
import { ErrorAlert } from "../../../components/ui/ErrorAlert";
import { ApiError } from "../../../lib/apiClient";
import { useToastStore } from "../../../stores/toastStore";
import type { AdoptionRequestInput, AuthUser } from "../../../types/models";
import { useMe } from "../../auth/authApi";
import { useCreateAdoptionRequest } from "../adoptionApi";

type FormValues = Omit<AdoptionRequestInput, "petId">;
type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 2) errors.name = "กรุณากรอกชื่อ-นามสกุล";
  if (!/^0\d{1,2}-?\d{3}-?\d{3,4}$/.test(values.phone.trim())) {
    errors.phone = "เบอร์โทรไม่ถูกต้อง (เช่น 081-234-5678)";
  }
  if (values.message.trim().length < 10) errors.message = "กรุณาเล่าเกี่ยวกับตัวคุณอย่างน้อย 10 ตัวอักษร";
  return errors;
}

interface AdoptionRequestModalProps {
  petId: number;
  petName: string;
  onClose: () => void;
}

/** ฟอร์มขอรับเลี้ยง (POST /api/adoption-requests) ต้องล็อกอินก่อน */
export function AdoptionRequestModal({ petId, petName, onClose }: AdoptionRequestModalProps): ReactElement {
  const { user, isLoggedIn, isLoading } = useMe();

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle" role="dialog" aria-modal="true" aria-labelledby="adopt-title">
      <div className="modal-box">
        <h3 id="adopt-title" className="text-lg font-bold">
          ขอรับเลี้ยง "{petName}"
        </h3>
        {!isLoggedIn ? (
          <LoginPrompt onClose={onClose} />
        ) : isLoading || !user ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : (
          <RequestForm petId={petId} petName={petName} user={user} onClose={onClose} />
        )}
      </div>
      <button type="button" className="modal-backdrop" aria-label="ปิด" onClick={onClose} />
    </div>
  );
}

function LoginPrompt({ onClose }: { onClose: () => void }): ReactElement {
  const location = useLocation();
  const redirect = encodeURIComponent(location.pathname);
  return (
    <div className="py-4">
      <p className="text-base-content/80">
        กรุณาเข้าสู่ระบบก่อนส่งคำขอ เพื่อให้คุณติดตามสถานะคำขอได้ในหน้า "คำขอของฉัน" และรับอีเมลแจ้งผล
      </p>
      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          ไว้ก่อน
        </button>
        <Link to={`/register?redirect=${redirect}`} className="btn btn-outline btn-primary">
          สมัครสมาชิก
        </Link>
        <Link to={`/login?redirect=${redirect}`} className="btn btn-primary">
          เข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}

interface RequestFormProps {
  petId: number;
  petName: string;
  user: AuthUser;
  onClose: () => void;
}

function RequestForm({ petId, petName, user, onClose }: RequestFormProps): ReactElement {
  const [values, setValues] = useState<FormValues>({ name: user.name, phone: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const mutation = useCreateAdoptionRequest();
  const showToast = useToastStore((state) => state.show);

  const serverErrors = mutation.error instanceof ApiError ? mutation.error.fieldErrors : {};
  const errorOf = (field: keyof FormValues): string | undefined => errors[field] ?? serverErrors[field];

  const update = (key: keyof FormValues, value: string): void => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    mutation.mutate(
      { petId, name: values.name.trim(), phone: values.phone.trim(), message: values.message.trim() },
      {
        onSuccess: () => {
          showToast("success", `ส่งคำขอรับเลี้ยง "${petName}" เรียบร้อยแล้ว 🎉`);
          onClose();
        },
      },
    );
  };

  return (
    <>
      <p className="mt-1 text-sm text-base-content/70">
        บ้านพักพิงจะติดต่อกลับเพื่อนัดพูดคุยและเยี่ยมบ้าน ผลการพิจารณาจะแจ้งไปที่ {user.email}
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-4 grid gap-1">
        {mutation.isError && Object.keys(serverErrors).length === 0 && (
          <ErrorAlert error={mutation.error} title="ส่งคำขอไม่สำเร็จ" />
        )}

        <div className="grid gap-x-3 sm:grid-cols-2">
          <label className="fieldset">
            <span className="fieldset-legend">ชื่อ-นามสกุล</span>
            <input
              className={`input w-full ${errorOf("name") ? "input-error" : ""}`}
              value={values.name}
              autoComplete="name"
              onChange={(e) => update("name", e.target.value)}
            />
            {errorOf("name") && <span className="label text-error">{errorOf("name")}</span>}
          </label>

          <label className="fieldset">
            <span className="fieldset-legend">เบอร์โทร</span>
            <input
              type="tel"
              className={`input w-full ${errorOf("phone") ? "input-error" : ""}`}
              value={values.phone}
              placeholder="081-234-5678"
              autoComplete="tel"
              onChange={(e) => update("phone", e.target.value)}
            />
            {errorOf("phone") && <span className="label text-error">{errorOf("phone")}</span>}
          </label>
        </div>

        <label className="fieldset">
          <span className="fieldset-legend">อีเมล (จากบัญชีของคุณ)</span>
          <input type="email" className="input w-full" value={user.email} readOnly disabled />
        </label>

        <label className="fieldset">
          <span className="fieldset-legend">เล่าเกี่ยวกับตัวคุณและที่พักอาศัย</span>
          <textarea
            className={`textarea h-24 w-full ${errorOf("message") ? "textarea-error" : ""}`}
            value={values.message}
            maxLength={500}
            placeholder="เช่น อยู่บ้านเดี่ยว มีสนาม เคยเลี้ยงสุนัขมาก่อน..."
            onChange={(e) => update("message", e.target.value)}
          />
          {errorOf("message") && <span className="label text-error">{errorOf("message")}</span>}
        </label>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={mutation.isPending}>
            ยกเลิก
          </button>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending && <span className="loading loading-spinner loading-sm" />}
            ส่งคำขอ
          </button>
        </div>
      </form>
    </>
  );
}
