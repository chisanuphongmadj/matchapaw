import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { queryKeys } from "../../lib/queryKeys";
import { useAuthStore } from "../../stores/authStore";
import type { ApiSuccess } from "../../types/api";
import type { AuthResult, AuthUser, LoginInput, RegisterInput } from "../../types/models";

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResult> =>
    (await apiClient.post<ApiSuccess<AuthResult>>("/auth/login", input)).data,
  register: async (input: RegisterInput): Promise<AuthResult> =>
    (await apiClient.post<ApiSuccess<AuthResult>>("/auth/register", input)).data,
  me: async (): Promise<AuthUser> => (await apiClient.get<ApiSuccess<AuthUser>>("/auth/me")).data,
};

/**
 * ผู้ใช้ที่ล็อกอินอยู่ (Server State)
 * token อยู่ใน Zustand แต่ข้อมูลผู้ใช้ดึงจาก Server ผ่าน TanStack Query
 * ไม่มี token = ผู้เยี่ยมชม (ไม่ยิง API)
 */
export function useMe() {
  const token = useAuthStore((state) => state.token);
  const query = useQuery({
    queryKey: [...queryKeys.me, token],
    queryFn: authApi.me,
    enabled: token !== null,
    staleTime: 5 * 60_000,
  });
  return {
    user: token ? query.data : undefined,
    isLoggedIn: token !== null,
    isLoading: token !== null && query.isLoading,
    isAdmin: query.data?.role === "ADMIN",
  };
}

/** หลังล็อกอิน/สมัคร: เก็บ token แล้วใส่ข้อมูลผู้ใช้ลง cache ทันที (ไม่ต้องยิง /me ซ้ำ) */
function useSaveSession() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  return (result: AuthResult) => {
    queryClient.setQueryData([...queryKeys.me, result.token], result.user);
    setToken(result.token);
  };
}

export function useLogin() {
  const save = useSaveSession();
  return useMutation({ mutationFn: authApi.login, onSuccess: save });
}

export function useRegister() {
  const save = useSaveSession();
  return useMutation({ mutationFn: authApi.register, onSuccess: save });
}

/** ออกจากระบบ: ลบ token และล้าง cache ที่เป็นข้อมูลส่วนตัว */
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  return () => {
    logout();
    queryClient.removeQueries({ queryKey: queryKeys.me });
    queryClient.removeQueries({ queryKey: queryKeys.requests.all });
  };
}
