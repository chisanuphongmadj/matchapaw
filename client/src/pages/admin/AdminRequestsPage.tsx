import { useState, type ReactElement } from "react";
import { Link } from "react-router";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorAlert } from "../../components/ui/ErrorAlert";
import { CheckIcon, TrashIcon, XIcon } from "../../components/ui/Icons";
import {
  useAdoptionRequests,
  useDeleteAdoptionRequest,
  useUpdateRequestStatus,
} from "../../features/adoption/adoptionApi";
import { PetImage } from "../../features/pets/components/PetImage";
import { getErrorMessage } from "../../lib/apiClient";
import { formatDate, requestStatusMeta } from "../../lib/format";
import { useToastStore } from "../../stores/toastStore";
import { REQUEST_STATUSES, type AdoptionRequest, type RequestStatus } from "../../types/models";

/** จัดการคำขอรับเลี้ยง: อนุมัติ / ปฏิเสธ / ลบ */
export function AdminRequestsPage(): ReactElement {
  const [status, setStatus] = useState<RequestStatus | null>("PENDING");
  const [pendingDelete, setPendingDelete] = useState<AdoptionRequest | null>(null);

  const { data, isLoading, isError, error, refetch } = useAdoptionRequests(status);
  const updateStatus = useUpdateRequestStatus();
  const deleteRequest = useDeleteAdoptionRequest();
  const showToast = useToastStore((state) => state.show);

  const busyId = updateStatus.isPending ? updateStatus.variables.id : null;

  const changeStatus = (request: AdoptionRequest, next: RequestStatus): void => {
    updateStatus.mutate(
      { id: request.id, status: next },
      {
        onSuccess: () =>
          showToast(
            "success",
            next === "APPROVED"
              ? `อนุมัติให้ ${request.adopter.name} รับเลี้ยง "${request.pet.name}" แล้ว 🎉`
              : `ปฏิเสธคำขอของ ${request.adopter.name} แล้ว`,
          ),
        onError: (err) => showToast("error", getErrorMessage(err)),
      },
    );
  };

  const confirmDelete = (): void => {
    if (!pendingDelete) return;
    deleteRequest.mutate(pendingDelete.id, {
      onSuccess: () => {
        showToast("success", "ลบคำขอเรียบร้อยแล้ว");
        setPendingDelete(null);
      },
      onError: (err) => showToast("error", getErrorMessage(err)),
    });
  };

  const filterTabs: { value: RequestStatus | null; label: string }[] = [
    { value: null, label: "ทั้งหมด" },
    ...REQUEST_STATUSES.map((s) => ({ value: s, label: requestStatusMeta[s].label })),
  ];

  return (
    <section className="space-y-4">
      <div role="tablist" className="tabs tabs-border">
        {filterTabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={status === tab.value}
            className={`tab ${status === tab.value ? "tab-active" : ""}`}
            onClick={() => setStatus(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorAlert error={error} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-28 w-full" />
          ))}
        </div>
      ) : data && data.data.length === 0 ? (
        <EmptyState emoji="📭" title="ไม่มีคำขอในหมวดนี้" />
      ) : (
        <ul className="grid gap-3">
          {data?.data.map((request) => {
            const meta = requestStatusMeta[request.status];
            const busy = busyId === request.id;
            return (
              <li key={request.id} className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <Link to={`/pets/${request.pet.id}`} className="flex shrink-0 items-center gap-3 sm:w-48">
                    <PetImage
                      src={request.pet.imageUrl}
                      alt={request.pet.name}
                      speciesSlug={request.pet.species.slug}
                      className="size-14 rounded-lg text-2xl"
                    />
                    <span>
                      <span className="block font-semibold">{request.pet.name}</span>
                      <span className="block text-xs text-base-content/60">{request.pet.species.name}</span>
                    </span>
                  </Link>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{request.adopter.name}</span>
                      <span className={`badge badge-sm ${meta.badge}`}>{meta.label}</span>
                      <span className="text-xs text-base-content/60">{formatDate(request.createdAt)}</span>
                    </div>
                    <p className="text-sm break-all text-base-content/70">
                      {request.adopter.email} · {request.adopter.phone}
                    </p>
                    <p className="text-sm">“{request.message}”</p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    {request.status !== "APPROVED" && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        disabled={busy}
                        onClick={() => changeStatus(request, "APPROVED")}
                      >
                        <CheckIcon className="size-4" /> อนุมัติ
                      </button>
                    )}
                    {request.status !== "REJECTED" && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={busy}
                        onClick={() => changeStatus(request, "REJECTED")}
                      >
                        <XIcon className="size-4" /> ปฏิเสธ
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square text-error"
                      aria-label="ลบคำขอ"
                      disabled={busy}
                      onClick={() => setPendingDelete(request)}
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="ยืนยันการลบคำขอ"
        message={`ลบคำขอของ ${pendingDelete?.adopter.name ?? ""} สำหรับ "${pendingDelete?.pet.name ?? ""}" หรือไม่?`}
        confirmLabel="ลบคำขอ"
        isLoading={deleteRequest.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
