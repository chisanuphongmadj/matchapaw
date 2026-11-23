import type { ReactElement } from "react";
import { Link } from "react-router";
import { MapPinIcon } from "../../../components/ui/Icons";
import { formatAge, genderLabel, sizeLabel } from "../../../lib/format";
import type { Pet } from "../../../types/models";
import { FavoriteButton } from "./FavoriteButton";
import { PetImage } from "./PetImage";
import { PetStatusBadge } from "./PetStatusBadge";

export function PetCard({ pet }: { pet: Pet }): ReactElement {
  const detailPath = `/pets/${pet.id}`;

  return (
    <article className="card group overflow-hidden border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <figure className="relative aspect-4/3">
        <Link to={detailPath} className="block size-full" tabIndex={-1} aria-hidden="true">
          <PetImage
            src={pet.imageUrl}
            alt={pet.name}
            speciesSlug={pet.species.slug}
            className="size-full transition duration-300 group-hover:scale-105"
          />
        </Link>
        <PetStatusBadge status={pet.status} className="absolute left-3 top-3 shadow" />
        <FavoriteButton petId={pet.id} petName={pet.name} className="absolute right-3 top-3" />
      </figure>

      <div className="card-body gap-1 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="card-title text-lg">
            <Link to={detailPath} className="link-hover">
              {pet.name}
            </Link>
          </h3>
          <span className="shrink-0 text-sm text-base-content/70">{genderLabel[pet.gender]}</span>
        </div>
        <p className="truncate text-sm text-base-content/70">
          {pet.species.name} · {pet.breed}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="badge badge-ghost badge-sm">{formatAge(pet.ageMonths)}</span>
          <span className="badge badge-ghost badge-sm">ขนาด{sizeLabel[pet.size]}</span>
        </div>
        <p className="mt-2 flex items-center gap-1 text-xs text-base-content/60">
          <MapPinIcon className="size-3.5" /> {pet.shelter.province}
        </p>
      </div>
    </article>
  );
}

export function PetCardSkeleton(): ReactElement {
  return (
    <div className="card overflow-hidden border border-base-300 bg-base-100" aria-hidden="true">
      <div className="skeleton aspect-4/3 rounded-none" />
      <div className="card-body gap-2 p-4">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
        <div className="flex gap-2">
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

interface PetGridProps {
  pets: Pet[] | undefined;
  isLoading: boolean;
  skeletonCount?: number;
}

/** Grid แบบ Responsive: มือถือ 1 คอลัมน์ -> จอใหญ่ 4 คอลัมน์ */
export function PetGrid({ pets, isLoading, skeletonCount = 8 }: PetGridProps): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {isLoading
        ? Array.from({ length: skeletonCount }, (_, i) => <PetCardSkeleton key={i} />)
        : pets?.map((pet) => <PetCard key={pet.id} pet={pet} />)}
    </div>
  );
}
