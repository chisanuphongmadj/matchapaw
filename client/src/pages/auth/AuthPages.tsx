import { useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { ErrorAlert } from "../../components/ui/ErrorAlert";
import { PawIcon } from "../../components/ui/Icons";
import { useLogin, useMe, useRegister } from "../../features/auth/authApi";
import { ApiError } from "../../lib/apiClient";
import { useToastStore } from "../../stores/toastStore";

/** ให้ redirect ไปได้เฉพาะ path ในเว็บเรา (กันลิงก์หลอกไปเว็บอื่น) */
function useRedirectTarget(): string {
  const [params] = useSearchParams();
  const target = params.get("redirect") ?? "/";
  return target.startsWith("/") && !target.startsWith("//") ? target : "/";
}

function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }): ReactElement {
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <div className="text-center">
            <span className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-primary text-primary-content">
              <PawIcon className="size-6" />
            </span>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-base-content/70">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  type?: string;
  value: string;
  autoComplete: string;
  error?: string | undefined;
  onChange: (value: string) => void;
}

function Field({ label, type = "text", value, autoComplete, error, onChange }: FieldProps): ReactElement {
  return (
    <label className="fieldset">
      <span className="fieldset-legend">{label}</span>
      <input
        type={type}
        className={`input w-full ${error ? "input-error" : ""}`}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span className="label text-error">{error}</span>}
    </label>
  );
}

// ---------------------------------------------------------------------------
// /login
// ---------------------------------------------------------------------------
export function LoginPage(): ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const { isLoggedIn } = useMe();
  const navigate = useNavigate();
  const redirect = useRedirectTarget();
  const showToast = useToastStore((state) => state.show);

  if (isLoggedIn && !login.isPending && !login.isSuccess) return <Navigate to={redirect} replace />;

  const fieldErrors = login.error instanceof ApiError ? login.error.fieldErrors : {};

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (result) => {
          showToast("success", `ยินดีต้อนรับ ${result.user.name}`);
          void navigate(redirect, { replace: true });
        },
      },
    );
  };

  return (
    <AuthCard title="เข้าสู่ระบบ" subtitle="เพื่อส่งคำขอรับเลี้ยงและติดตามสถานะ">
      <form onSubmit={handleSubmit} noValidate className="grid gap-1">
        {login.isError && Object.keys(fieldErrors).length === 0 && <ErrorAlert error={login.error} title="เข้าสู่ระบบไม่สำเร็จ" />}
        <Field label="อีเมล" type="email" value={email} autoComplete="email" error={fieldErrors["email"]} onChange={setEmail} />
        <Field label="รหัสผ่าน" type="password" value={password} autoComplete="current-password" error={fieldErrors["password"]} onChange={setPassword} />
        <button type="submit" className="btn btn-primary mt-3" disabled={login.isPending}>
          {login.isPending && <span className="loading loading-spinner loading-sm" />}
          เข้าสู่ระบบ
        </button>
      </form>
      <p className="text-center text-sm">
        ยังไม่มีบัญชี?{" "}
        <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="link link-primary">
          สมัครสมาชิก
        </Link>
      </p>
    </AuthCard>
  );
}

// ---------------------------------------------------------------------------
// /register
// ---------------------------------------------------------------------------
export function RegisterPage(): ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const register = useRegister();
  const { isLoggedIn } = useMe();
  const navigate = useNavigate();
  const redirect = useRedirectTarget();
  const showToast = useToastStore((state) => state.show);

  if (isLoggedIn && !register.isPending && !register.isSuccess) return <Navigate to={redirect} replace />;

  const fieldErrors = register.error instanceof ApiError ? register.error.fieldErrors : {};

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (password !== confirm) {
      setConfirmError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    setConfirmError(undefined);
    register.mutate(
      { name: name.trim(), email: email.trim(), password },
      {
        onSuccess: (result) => {
          showToast("success", `สมัครสมาชิกสำเร็จ ยินดีต้อนรับ ${result.user.name}`);
          void navigate(redirect, { replace: true });
        },
      },
    );
  };

  return (
    <AuthCard title="สมัครสมาชิก" subtitle="ใช้เวลาไม่ถึงนาที เพื่อเริ่มหาเพื่อนสี่ขา">
      <form onSubmit={handleSubmit} noValidate className="grid gap-1">
        {register.isError && Object.keys(fieldErrors).length === 0 && <ErrorAlert error={register.error} title="สมัครไม่สำเร็จ" />}
        <Field label="ชื่อ-นามสกุล" value={name} autoComplete="name" error={fieldErrors["name"]} onChange={setName} />
        <Field label="อีเมล" type="email" value={email} autoComplete="email" error={fieldErrors["email"]} onChange={setEmail} />
        <Field label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)" type="password" value={password} autoComplete="new-password" error={fieldErrors["password"]} onChange={setPassword} />
        <Field label="ยืนยันรหัสผ่าน" type="password" value={confirm} autoComplete="new-password" error={confirmError} onChange={setConfirm} />
        <button type="submit" className="btn btn-primary mt-3" disabled={register.isPending}>
          {register.isPending && <span className="loading loading-spinner loading-sm" />}
          สมัครสมาชิก
        </button>
      </form>
      <p className="text-center text-sm">
        มีบัญชีอยู่แล้ว?{" "}
        <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="link link-primary">
          เข้าสู่ระบบ
        </Link>
      </p>
    </AuthCard>
  );
}
