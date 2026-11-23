import { useState, type ReactElement } from "react";
import { Link } from "react-router";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorAlert } from "../../components/ui/ErrorAlert";
import { EditIcon, PlusIcon, SearchIcon, TrashIcon } from "../../components/ui/Icons";
import { PetImage } from "../../features/pets/components/PetImage";
import { useDeletePet, usePatchPet, usePets } from "../../features/pets/petApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { getErrorMessage } from "../../lib/apiClient";
import { formatAge, isOneOf, petStatusMeta } from "../../lib/format";
import { useFavoriteStore } from "../../stores/favoriteStore";
import { useToastStore } from "../../stores/toastStore";
import { PET_STATUSES, type Pet, type PetStatus } from "../../types/models";

/** ตารางจัดการสัตว์: ดู / เปลี่ยนสถานะ / แก้ไข / ลบ */
export function AdminPetsPage(): ReactElement {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PetStatus | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Pet | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError, error, refetch, isFetching } = usePets({
    search: debouncedSearch,
    status,
    sort: "newest",
  });
  const patchPet = usePatchPet();
  const deletePet = useDeletePet();
  const removeFavorite = useFavoriteStore((state) => state.remove);
  const showToast = useToastStore((state) => state.show);

  const changeStatus = (pet: Pet, next: PetStatus): void => {
    patchPet.mutate(
      { id: pet.id, input: { status: next } },
      {
        onSuccess: () => showToast("success", `เปลี่ยนสถานะ "${pet.name}" เป็น ${petStatusMeta[next].label}`),
        onError: (err) => showToast("error", getErrorMessage(err)),
      },
    );
  };

  const confirmDelete = (): void => {
    if (!pendingDelete) return;
    const pet = pendingDelete;
    deletePet.mutate(pet.id, {
      onSuccess: () => {
        removeFavorite(pet.id); // ลบออกจากรายการโปรด (Zustand) ด้วย
        showToast("success", `ลบ "${pet.name}" ออกจากระบบแล้ว`);
        setPendingDelete(null);
      },
      onError: (err) => showToast("error", getErrorMessage(err)),
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="input w-full sm:w-72">
          <SearchIcon className="size-4 opacity-60" />
          <input
            type="search"
            placeholder="ค้นหาชื่อ สายพันธุ์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="ค้นหาสัตว์"
          />
        </label>
        <select
          className="select w-full sm:w-44"
          aria-label="กรองสถานะ"
          value={status ?? ""}
          onChange={(e) => setStatus(isOneOf(PET_STATUSES, e.target.value) ? e.target.value : null)}
        >
          <option value="">ทุกสถานะ</option>
          {PET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {petStatusMeta[s].label}
            </option>
          ))}
        </select>
        {isFetching && !isLoading && <span className="loading loading-spinner loading-sm" />}
        <Link to="/admin/pets/new" className="btn btn-primary sm:ml-auto">
          <PlusIcon className="size-4" /> เพิ่มสัตว์ใหม่
        </Link>
      </div>

      {data && <p className="text-sm text-base-content/70">ทั้งหมด {data.meta.total} รายการ</p>}

      {isError ? (
        <ErrorAlert error={error} onRetry={() => void refetch()} />
      ) : data && data.data.length === 0 ? (
        <EmptyState emoji="📭" title="ไม่พบข้อมูล" description="ลองเปลี่ยนคำค้นหาหรือตัวกรอง" />
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>สัตว์</th>
                <th className="hidden md:table-cell">อายุ</th>
                <th className="hidden lg:table-cell">บ้านพักพิง</th>
                <th>สถานะ</th>
                <th className="hidden sm:table-cell">คำขอ</th>
                <th className="text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={6}>
                        <div className="skeleton h-10 w-full" />
                      </td>
                    </tr>
                  ))
                : data?.data.map((pet) => (
                    <tr key={pet.id} className="hover:bg-base-200/60">
                      <td>
                        <Link to={`/pets/${pet.id}`} className="flex items-center gap-3">
                          <PetImage
                            src={pet.imageUrl}
                            alt={pet.name}
                            speciesSlug={pet.species.slug}
                            className="size-12 shrink-0 rounded-lg text-2xl"
                          />
                          <span>
                            <span className="block font-semibold">{pet.name}</span>
                            <span className="block text-xs text-base-content/60">
                              {pet.species.name} · {pet.breed}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="hidden md:table-cell">{formatAge(pet.ageMonths)}</td>
                      <td className="hidden lg:table-cell">{pet.shelter.name}</td>
                      <td>
                        <select
                          className="select select-sm w-36"
                          aria-label={`สถานะของ ${pet.name}`}
                          value={pet.status}
                          disabled={patchPet.isPending && patchPet.variables.id === pet.id}
                          onChange={(e) => {
                            if (isOneOf(PET_STATUSES, e.target.value)) changeStatus(pet, e.target.value);
                          }}
                        >
                          {PET_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {petStatusMeta[s].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="hidden sm:table-cell">{pet._count.adoptionRequests}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/admin/pets/${pet.id}/edit`}
                            className="btn btn-ghost btn-sm btn-square"
                            aria-label={`แก้ไข ${pet.name}`}
                            title="แก้ไข"
                          >
                            <EditIcon className="size-4" />
                          </Link>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square text-error"
                            aria-label={`ลบ ${pet.name}`}
                            title="ลบ"
                            onClick={() => setPendingDelete(pet)}
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="ยืนยันการลบ"
        message={`ต้องการลบ "${pendingDelete?.name ?? ""}" ออกจากระบบหรือไม่? คำขอรับเลี้ยงที่เกี่ยวข้องจะถูกลบไปด้วย และย้อนกลับไม่ได้`}
        confirmLabel="ลบข้อมูล"
        isLoading={deletePet.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
