import { useState, type FormEvent, type ReactElement } from "react";
import { ErrorAlert } from "../../../components/ui/ErrorAlert";
import { ApiError } from "../../../lib/apiClient";
import { useToastStore } from "../../../stores/toastStore";
import type { AdoptionRequestInput } from "../../../types/models";
import { useCreateAdoptionRequest } from "../adoptionApi";

type FormValues = Omit<AdoptionRequestInput, "petId">;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = { name: "", email: "", phone: "", message: "" };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 2) errors.name = "กรุณากรอกชื่อ-นามสกุล";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
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

/** ฟอร์มขอรับเลี้ยง (POST /api/adoption-requests) */
export function AdoptionRequestModal({ petId, petName, onClose }: AdoptionRequestModalProps): ReactElement {
  const [values, setValues] = useState<FormValues>(emptyForm);
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
      {
        petId,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
      },
      {
        onSuccess: () => {
          showToast("success", `ส่งคำขอรับเลี้ยง "${petName}" เรียบร้อยแล้ว 🎉`);
          onClose();
        },
      },
    );
  };

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle" role="dialog" aria-modal="true" aria-labelledby="adopt-title">
      <div className="modal-box">
        <h3 id="adopt-title" className="text-lg font-bold">
          ขอรับเลี้ยง "{petName}"
        </h3>
        <p className="mt-1 text-sm text-base-content/70">
          กรอกข้อมูลให้บ้านพักพิงติดต่อกลับเพื่อนัดพูดคุยและเยี่ยมบ้าน
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-4 grid gap-1">
          {mutation.isError && Object.keys(serverErrors).length === 0 && (
            <ErrorAlert error={mutation.error} title="ส่งคำขอไม่สำเร็จ" />
          )}

          <fieldset className="fieldset">
            <legend className="fieldset-legend">ชื่อ-นามสกุล</legend>
            <input
              className={`input w-full ${errorOf("name") ? "input-error" : ""}`}
              value={values.name}
              autoComplete="name"
              onChange={(e) => update("name", e.target.value)}
            />
            {errorOf("name") && <p className="label text-error">{errorOf("name")}</p>}
          </fieldset>

          <div className="grid gap-x-3 sm:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">อีเมล</legend>
              <input
                type="email"
                className={`input w-full ${errorOf("email") ? "input-error" : ""}`}
                value={values.email}
                autoComplete="email"
                onChange={(e) => update("email", e.target.value)}
              />
              {errorOf("email") && <p className="label text-error">{errorOf("email")}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">เบอร์โทร</legend>
              <input
                type="tel"
                className={`input w-full ${errorOf("phone") ? "input-error" : ""}`}
                value={values.phone}
                placeholder="081-234-5678"
                autoComplete="tel"
                onChange={(e) => update("phone", e.target.value)}
              />
              {errorOf("phone") && <p className="label text-error">{errorOf("phone")}</p>}
            </fieldset>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">เล่าเกี่ยวกับตัวคุณและที่พักอาศัย</legend>
            <textarea
              className={`textarea h-24 w-full ${errorOf("message") ? "textarea-error" : ""}`}
              value={values.message}
              maxLength={500}
              placeholder="เช่น อยู่บ้านเดี่ยว มีสนาม เคยเลี้ยงสุนัขมาก่อน..."
              onChange={(e) => update("message", e.target.value)}
            />
            {errorOf("message") && <p className="label text-error">{errorOf("message")}</p>}
          </fieldset>

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
      </div>
      <button type="button" className="modal-backdrop" aria-label="ปิด" onClick={onClose} />
    </div>
  );
}
