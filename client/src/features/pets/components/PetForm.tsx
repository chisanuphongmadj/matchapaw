import { useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import { ApiError, getErrorMessage } from "../../../lib/apiClient";
import { formatAge, genderLabel, isOneOf, petStatusMeta, sizeLabel } from "../../../lib/format";
import {
  GENDERS,
  PET_SIZES,
  PET_STATUSES,
  type Gender,
  type PetDetail,
  type PetInput,
  type PetSize,
  type PetStatus,
} from "../../../types/models";
import { ErrorAlert } from "../../../components/ui/ErrorAlert";
import { useShelters, useSpecies } from "../../meta/metaApi";
import { useUploadPetImage } from "../petApi";
import { PetImage } from "./PetImage";

/** ค่าในฟอร์ม (ตัวเลขเก็บเป็น string ระหว่างพิมพ์ แล้วค่อยแปลงตอนส่ง) */
interface PetFormValues {
  name: string;
  breed: string;
  gender: Gender;
  ageMonths: string;
  size: PetSize;
  color: string;
  description: string;
  imageUrl: string;
  vaccinated: boolean;
  sterilized: boolean;
  status: PetStatus;
  speciesId: string;
  shelterId: string;
}

type FormErrors = Partial<Record<keyof PetFormValues, string>>;

export const emptyPetForm: PetFormValues = {
  name: "",
  breed: "",
  gender: "MALE",
  ageMonths: "",
  size: "MEDIUM",
  color: "",
  description: "",
  imageUrl: "",
  vaccinated: false,
  sterilized: false,
  status: "AVAILABLE",
  speciesId: "",
  shelterId: "",
};

export function toFormValues(pet: PetDetail): PetFormValues {
  return {
    name: pet.name,
    breed: pet.breed,
    gender: pet.gender,
    ageMonths: String(pet.ageMonths),
    size: pet.size,
    color: pet.color,
    description: pet.description,
    imageUrl: pet.imageUrl ?? "",
    vaccinated: pet.vaccinated,
    sterilized: pet.sterilized,
    status: pet.status,
    speciesId: String(pet.speciesId),
    shelterId: String(pet.shelterId),
  };
}

/** ตรวจสอบข้อมูลฝั่ง Client ก่อนส่ง (Server ตรวจซ้ำอีกชั้นด้วย Zod) */
function validate(values: PetFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "กรุณากรอกชื่อ";
  if (!values.breed.trim()) errors.breed = "กรุณากรอกสายพันธุ์";
  if (!values.color.trim()) errors.color = "กรุณากรอกสี";
  if (!values.speciesId) errors.speciesId = "กรุณาเลือกชนิดสัตว์";
  if (!values.shelterId) errors.shelterId = "กรุณาเลือกบ้านพักพิง";

  const age = Number(values.ageMonths);
  if (values.ageMonths.trim() === "" || !Number.isInteger(age) || age < 0 || age > 360) {
    errors.ageMonths = "อายุต้องเป็นจำนวนเต็ม 0-360 เดือน";
  }
  if (values.description.trim().length < 10) {
    errors.description = "คำอธิบายต้องมีอย่างน้อย 10 ตัวอักษร";
  }
  if (values.imageUrl.trim()) {
    try {
      new URL(values.imageUrl.trim());
    } catch {
      errors.imageUrl = "ลิงก์รูปภาพไม่ถูกต้อง";
    }
  }
  return errors;
}

function toInput(values: PetFormValues): PetInput {
  return {
    name: values.name.trim(),
    breed: values.breed.trim(),
    gender: values.gender,
    ageMonths: Number(values.ageMonths),
    size: values.size,
    color: values.color.trim(),
    description: values.description.trim(),
    imageUrl: values.imageUrl.trim() || null,
    vaccinated: values.vaccinated,
    sterilized: values.sterilized,
    status: values.status,
    speciesId: Number(values.speciesId),
    shelterId: Number(values.shelterId),
  };
}

interface FieldProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  className?: string;
  children: ReactNode;
}

function Field({ label, error, hint, className = "", children }: FieldProps): ReactElement {
  return (
    <fieldset className={`fieldset ${className}`}>
      <legend className="fieldset-legend">{label}</legend>
      {children}
      {error ? <p className="label text-error">{error}</p> : hint && <p className="label">{hint}</p>}
    </fieldset>
  );
}

interface PetFormProps {
  initialValues: PetFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  submitError: unknown;
  onSubmit: (input: PetInput) => void;
  onCancel: () => void;
}

export function PetForm({
  initialValues,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: PetFormProps): ReactElement {
  const [values, setValues] = useState<PetFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const species = useSpecies();
  const shelters = useShelters();
  const upload = useUploadPetImage();

  // อัปโหลดรูป -> ได้ URL จาก Supabase Storage -> ใส่ลงช่องลิงก์รูปให้อัตโนมัติ
  const handleUpload = (file: File): void => {
    if (file.size > 3 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, imageUrl: "ไฟล์รูปใหญ่เกิน 3MB" }));
      return;
    }
    upload.mutate(file, { onSuccess: (url) => update("imageUrl", url) });
  };

  // error ของแต่ละฟิลด์ที่ Server ส่งกลับมา (400 Validation)
  const serverErrors: Record<string, string> =
    submitError instanceof ApiError ? submitError.fieldErrors : {};
  const errorOf = (field: keyof PetFormValues): string | undefined => errors[field] ?? serverErrors[field];

  const update = <K extends keyof PetFormValues>(key: K, value: PetFormValues[K]): void => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(toInput(values));
  };

  const age = Number(values.ageMonths);
  const selectedSpecies = species.data?.find((s) => String(s.id) === values.speciesId);

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-x-4 sm:grid-cols-2">
        {submitError !== null && submitError !== undefined && (
          <div className="sm:col-span-2">
            <ErrorAlert error={submitError} title="บันทึกไม่สำเร็จ" />
          </div>
        )}

        <Field label="ชื่อ *" error={errorOf("name")}>
          <input
            className={`input w-full ${errorOf("name") ? "input-error" : ""}`}
            value={values.name}
            maxLength={50}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>

        <Field label="สายพันธุ์ *" error={errorOf("breed")}>
          <input
            className={`input w-full ${errorOf("breed") ? "input-error" : ""}`}
            value={values.breed}
            maxLength={60}
            placeholder="เช่น พันธุ์ผสม, ไทยหลังอาน"
            onChange={(e) => update("breed", e.target.value)}
          />
        </Field>

        <Field label="ชนิดสัตว์ *" error={errorOf("speciesId")}>
          <select
            className={`select w-full ${errorOf("speciesId") ? "select-error" : ""}`}
            value={values.speciesId}
            disabled={species.isLoading}
            onChange={(e) => update("speciesId", e.target.value)}
          >
            <option value="">{species.isLoading ? "กำลังโหลด..." : "-- เลือกชนิดสัตว์ --"}</option>
            {species.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="บ้านพักพิง *" error={errorOf("shelterId")}>
          <select
            className={`select w-full ${errorOf("shelterId") ? "select-error" : ""}`}
            value={values.shelterId}
            disabled={shelters.isLoading}
            onChange={(e) => update("shelterId", e.target.value)}
          >
            <option value="">{shelters.isLoading ? "กำลังโหลด..." : "-- เลือกบ้านพักพิง --"}</option>
            {shelters.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.province})
              </option>
            ))}
          </select>
        </Field>

        <Field label="เพศ">
          <select
            className="select w-full"
            value={values.gender}
            onChange={(e) => {
              if (isOneOf(GENDERS, e.target.value)) update("gender", e.target.value);
            }}
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {genderLabel[g]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="ขนาด">
          <select
            className="select w-full"
            value={values.size}
            onChange={(e) => {
              if (isOneOf(PET_SIZES, e.target.value)) update("size", e.target.value);
            }}
          >
            {PET_SIZES.map((s) => (
              <option key={s} value={s}>
                {sizeLabel[s]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="อายุ (เดือน) *"
          error={errorOf("ageMonths")}
          hint={Number.isInteger(age) && values.ageMonths !== "" ? `= ${formatAge(age)}` : "เช่น 18 = 1 ปี 6 เดือน"}
        >
          <input
            type="number"
            min={0}
            max={360}
            inputMode="numeric"
            className={`input w-full ${errorOf("ageMonths") ? "input-error" : ""}`}
            value={values.ageMonths}
            onChange={(e) => update("ageMonths", e.target.value)}
          />
        </Field>

        <Field label="สี *" error={errorOf("color")}>
          <input
            className={`input w-full ${errorOf("color") ? "input-error" : ""}`}
            value={values.color}
            maxLength={40}
            onChange={(e) => update("color", e.target.value)}
          />
        </Field>

        <Field label="สถานะ">
          <select
            className="select w-full"
            value={values.status}
            onChange={(e) => {
              if (isOneOf(PET_STATUSES, e.target.value)) update("status", e.target.value);
            }}
          >
            {PET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {petStatusMeta[s].label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="สุขภาพ">
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={values.vaccinated}
                onChange={(e) => update("vaccinated", e.target.checked)}
              />
              ฉีดวัคซีนแล้ว
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={values.sterilized}
                onChange={(e) => update("sterilized", e.target.checked)}
              />
              ทำหมันแล้ว
            </label>
          </div>
        </Field>

        <Field label="ลิงก์รูปภาพ" error={errorOf("imageUrl")} className="sm:col-span-2" hint="เว้นว่างได้">
          <input
            type="url"
            className={`input w-full ${errorOf("imageUrl") ? "input-error" : ""}`}
            value={values.imageUrl}
            placeholder="https://..."
            onChange={(e) => update("imageUrl", e.target.value)}
          />
        </Field>

        <Field
          label="นิสัยและเรื่องราว *"
          error={errorOf("description")}
          className="sm:col-span-2"
          hint={`${values.description.length}/1000 ตัวอักษร`}
        >
          <textarea
            className={`textarea h-28 w-full ${errorOf("description") ? "textarea-error" : ""}`}
            value={values.description}
            maxLength={1000}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>

        <div className="mt-4 flex gap-2 sm:col-span-2">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <span className="loading loading-spinner loading-sm" />}
            {submitLabel}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
            ยกเลิก
          </button>
        </div>
      </div>

      <aside className="order-first lg:order-last">
        <p className="mb-2 text-sm font-medium text-base-content/70">ตัวอย่างรูป</p>
        <PetImage
          key={values.imageUrl}
          src={values.imageUrl.trim() || null}
          alt={values.name || "ตัวอย่างรูป"}
          speciesSlug={selectedSpecies?.slug ?? ""}
          className="aspect-4/3 w-full rounded-box"
        />
        <label className={`btn btn-outline btn-primary btn-sm mt-3 w-full ${upload.isPending ? "btn-disabled" : ""}`}>
          {upload.isPending && <span className="loading loading-spinner loading-xs" />}
          {upload.isPending ? "กำลังอัปโหลด..." : "อัปโหลดรูปจากเครื่อง"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={upload.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) handleUpload(file);
            }}
          />
        </label>
        <p className="mt-1 text-xs text-base-content/60">JPG, PNG, WEBP หรือ GIF ไม่เกิน 3MB หรือวางลิงก์รูปในช่องด้านซ้าย</p>
        {upload.isError && <p className="mt-1 text-xs text-error">{getErrorMessage(upload.error)}</p>}
      </aside>
    </form>
  );
}
