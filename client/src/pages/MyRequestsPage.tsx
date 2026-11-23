import type { ReactElement } from "react";
import { Link } from "react-router";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorAlert } from "../components/ui/ErrorAlert";
import { useMyRequests } from "../features/adoption/adoptionApi";
import { PetImage } from "../features/pets/components/PetImage";
import { formatDate, requestStatusMeta } from "../lib/format";

const statusHint = {
  PENDING: "บ้านพักพิงกำลังพิจารณา",
  APPROVED: "ยินดีด้วย! บ้านพักพิงจะติดต่อกลับเพื่อนัดรับน้อง",
  REJECTED: "ไม่ได้รับการอนุมัติในครั้งนี้",
} as const;

/** หน้า "คำขอของฉัน" (/my-requests) ต้องล็อกอิน */
export function MyRequestsPage(): ReactElement {
  const { data, isLoading, isError, error, refetch } = useMyRequests();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">คำขอรับเลี้ยงของฉัน</h1>
        <p className="mt-1 text-base-content/70">ติดตามสถานะคำขอทั้งหมดที่คุณส่งไป</p>
      </header>

      {isError ? (
        <ErrorAlert error={error} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          emoji="📭"
          title="ยังไม่มีคำขอรับเลี้ยง"
          description="เลือกน้องที่ถูกใจแล้วกด ขอรับเลี้ยง ในหน้ารายละเอียด"
          action={
            <Link to="/pets" className="btn btn-primary btn-sm">
              ไปหาน้องกันเลย
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3">
          {data.map((request) => {
            const meta = requestStatusMeta[request.status];
            return (
              <li key={request.id} className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body flex-row items-center gap-4 p-4">
                  <Link to={`/pets/${request.pet.id}`} className="shrink-0">
                    <PetImage
                      src={request.pet.imageUrl}
                      alt={request.pet.name}
                      speciesSlug={request.pet.species.slug}
                      className="size-16 rounded-xl text-3xl"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/pets/${request.pet.id}`} className="font-semibold link-hover">
                        {request.pet.name}
                      </Link>
                      <span className={`badge badge-sm ${meta.badge}`}>{meta.label}</span>
                    </div>
                    <p className="text-sm text-base-content/70">{statusHint[request.status]}</p>
                    <p className="text-xs text-base-content/50">ส่งเมื่อ {formatDate(request.createdAt)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
