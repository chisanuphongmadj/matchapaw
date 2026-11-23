import { useState, type ReactElement } from "react";
import { Link, useParams } from "react-router";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorAlert } from "../components/ui/ErrorAlert";
import { CheckIcon, MapPinIcon, PhoneIcon, XIcon } from "../components/ui/Icons";
import { AdoptionRequestModal } from "../features/adoption/components/AdoptionRequestModal";
import { FavoriteButton } from "../features/pets/components/FavoriteButton";
import { PetImage } from "../features/pets/components/PetImage";
import { PetStatusBadge } from "../features/pets/components/PetStatusBadge";
import { usePet } from "../features/pets/petApi";
import { ApiError } from "../lib/apiClient";
import { formatAge, formatDate, genderLabel, sizeLabel } from "../lib/format";

function DetailSkeleton(): ReactElement {
  return (
    <div className="grid gap-8 md:grid-cols-2" aria-hidden="true">
      <div className="skeleton aspect-4/3 rounded-box" />
      <div className="space-y-4">
        <div className="skeleton h-10 w-1/2" />
        <div className="skeleton h-5 w-1/3" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
        <div className="skeleton h-24" />
      </div>
    </div>
  );
}

function HealthItem({ ok, label }: { ok: boolean; label: string }): ReactElement {
  return (
    <span className={`badge gap-1 ${ok ? "badge-success badge-soft" : "badge-ghost"}`}>
      {ok ? <CheckIcon className="size-3.5" /> : <XIcon className="size-3.5" />}
      {label}
    </span>
  );
}

/** หน้ารายละเอียดสัตว์ (Dynamic Route: /pets/:id) */
export function PetDetailPage(): ReactElement {
  const { id } = useParams();
  const petId = Number(id);
  const { data: pet, isLoading, isError, error, refetch } = usePet(petId);
  const [isAdoptOpen, setAdoptOpen] = useState(false);

  const notFound =
    !Number.isInteger(petId) || petId <= 0 || (error instanceof ApiError && error.status === 404);

  if (notFound) {
    return (
      <EmptyState
        emoji="🙀"
        title="ไม่พบน้องตัวนี้"
        description="น้องอาจถูกลบออกจากระบบแล้ว หรือลิงก์ไม่ถูกต้อง"
        action={
          <Link to="/pets" className="btn btn-primary btn-sm">
            กลับไปหน้ารายการ
          </Link>
        }
      />
    );
  }

  if (isLoading) return <DetailSkeleton />;
  if (isError || !pet) return <ErrorAlert error={error} onRetry={() => void refetch()} />;

  const facts = [
    { label: "เพศ", value: genderLabel[pet.gender] },
    { label: "อายุ", value: formatAge(pet.ageMonths) },
    { label: "ขนาด", value: sizeLabel[pet.size] },
    { label: "สี", value: pet.color },
  ];

  return (
    <div className="space-y-6">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link to="/">หน้าแรก</Link>
          </li>
          <li>
            <Link to="/pets">หาน้อง</Link>
          </li>
          <li>{pet.name}</li>
        </ul>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <PetImage
          src={pet.imageUrl}
          alt={pet.name}
          speciesSlug={pet.species.slug}
          className="aspect-4/3 w-full rounded-box shadow-md"
        />

        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold">{pet.name}</h1>
              <PetStatusBadge status={pet.status} />
            </div>
            <p className="mt-1 text-lg text-base-content/70">
              {pet.species.name} · {pet.breed}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-box bg-base-100 p-3 text-center shadow-sm">
                <dt className="text-xs text-base-content/60">{fact.label}</dt>
                <dd className="font-semibold">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-2">
            <HealthItem ok={pet.vaccinated} label="ฉีดวัคซีนแล้ว" />
            <HealthItem ok={pet.sterilized} label="ทำหมันแล้ว" />
          </div>

          <section>
            <h2 className="mb-1 font-semibold">นิสัยและเรื่องราว</h2>
            <p className="leading-relaxed text-base-content/80">{pet.description}</p>
          </section>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              disabled={pet.status === "ADOPTED"}
              onClick={() => setAdoptOpen(true)}
            >
              {pet.status === "ADOPTED" ? "น้องได้บ้านแล้ว" : "ขอรับเลี้ยง"}
            </button>
            <FavoriteButton petId={pet.id} petName={pet.name} variant="full" />
          </div>
          <p className="text-sm text-base-content/60">
            มีผู้สนใจส่งคำขอแล้ว {pet._count.adoptionRequests} คน · ลงทะเบียนเมื่อ {formatDate(pet.createdAt)}
          </p>

          <section className="card border border-base-300 bg-base-100">
            <div className="card-body gap-1 p-5">
              <h2 className="card-title text-base">ดูแลโดย {pet.shelter.name}</h2>
              <p className="flex items-center gap-2 text-sm text-base-content/70">
                <MapPinIcon className="size-4" /> {pet.shelter.district}, {pet.shelter.province}
              </p>
              <p className="flex items-center gap-2 text-sm text-base-content/70">
                <PhoneIcon className="size-4" /> {pet.shelter.phone}
              </p>
              {pet.shelter.description && (
                <p className="mt-1 text-sm text-base-content/70">{pet.shelter.description}</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {isAdoptOpen && (
        <AdoptionRequestModal petId={pet.id} petName={pet.name} onClose={() => setAdoptOpen(false)} />
      )}
    </div>
  );
}
