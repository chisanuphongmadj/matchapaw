import type { ReactElement } from "react";
import { Link } from "react-router";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorAlert } from "../components/ui/ErrorAlert";
import { PetGrid } from "../features/pets/components/PetCard";
import { usePets } from "../features/pets/petApi";
import { useFavoriteStore } from "../stores/favoriteStore";

/**
 * รายการโปรด: รหัสมาจาก Zustand (localStorage) ส่วนข้อมูลสัตว์ดึงจาก API ด้วย ?ids=
 * -> ข้อมูลไม่ซ้ำซ้อนและเป็นปัจจุบันเสมอ
 */
export function FavoritesPage(): ReactElement {
  const ids = useFavoriteStore((state) => state.ids);
  const clear = useFavoriteStore((state) => state.clear);
  const hasFavorites = ids.length > 0;

  const { data, isLoading, isError, error, refetch } = usePets({ ids }, { enabled: hasFavorites });
  // กรองซ้ำฝั่ง client เพื่อให้การ์ดหายทันทีเมื่อกดเอาหัวใจออก
  const pets = data?.data.filter((pet) => ids.includes(pet.id));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">รายการโปรด</h1>
          <p className="mt-1 text-base-content/70">น้องที่คุณกดหัวใจไว้ ({ids.length} ตัว)</p>
        </div>
        {hasFavorites && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
            ล้างทั้งหมด
          </button>
        )}
      </header>

      {!hasFavorites ? (
        <EmptyState
          emoji="💛"
          title="ยังไม่มีรายการโปรด"
          description="กดรูปหัวใจบนการ์ดของน้องที่สนใจ เพื่อเก็บไว้ดูภายหลัง"
          action={
            <Link to="/pets" className="btn btn-primary btn-sm">
              ไปหาน้องกันเลย
            </Link>
          }
        />
      ) : isError ? (
        <ErrorAlert error={error} onRetry={() => void refetch()} />
      ) : (
        <PetGrid pets={pets} isLoading={isLoading} skeletonCount={Math.min(ids.length, 8)} />
      )}
    </div>
  );
}
