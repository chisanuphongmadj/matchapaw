import type { ReactElement } from "react";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorAlert } from "../components/ui/ErrorAlert";
import { PetGrid } from "../features/pets/components/PetCard";
import { PetFilters } from "../features/pets/components/PetFilters";
import { usePets } from "../features/pets/petApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useFilterStore } from "../stores/filterStore";

/** หน้ารายการสัตว์ทั้งหมด (Items Master Page) */
export function PetsPage(): ReactElement {
  const filters = useFilterStore((state) => state.filters);
  const resetFilters = useFilterStore((state) => state.reset);
  const search = useDebouncedValue(filters.search);

  // ตัวกรอง (Zustand) -> queryKey (TanStack Query) -> GET /api/pets?...
  const { data, isLoading, isError, error, refetch, isFetching } = usePets({ ...filters, search });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">หาน้องที่ใช่สำหรับคุณ</h1>
        <p className="mt-1 text-base-content/70">ทุกตัวได้รับการตรวจสุขภาพจากบ้านพักพิงแล้ว</p>
      </header>

      <PetFilters />

      <div className="flex min-h-6 items-center gap-2 text-sm text-base-content/70" aria-live="polite">
        {data && <span>พบทั้งหมด {data.meta.total} ตัว</span>}
        {isFetching && !isLoading && <span className="loading loading-dots loading-sm" aria-label="กำลังอัปเดต" />}
      </div>

      {isError ? (
        <ErrorAlert error={error} onRetry={() => void refetch()} />
      ) : data && data.data.length === 0 ? (
        <EmptyState
          emoji="🔎"
          title="ไม่พบน้องที่ตรงกับเงื่อนไข"
          description="ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองดูนะ"
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={resetFilters}>
              ล้างตัวกรอง
            </button>
          }
        />
      ) : (
        <PetGrid pets={data?.data} isLoading={isLoading} />
      )}
    </div>
  );
}
