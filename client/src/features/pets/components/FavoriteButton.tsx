import type { ReactElement } from "react";
import { HeartIcon } from "../../../components/ui/Icons";
import { useFavoriteStore } from "../../../stores/favoriteStore";
import { useToastStore } from "../../../stores/toastStore";

interface FavoriteButtonProps {
  petId: number;
  petName: string;
  variant?: "icon" | "full";
  className?: string;
}

/** ปุ่มหัวใจ: เพิ่ม/ลบ รายการโปรด (Zustand + localStorage) */
export function FavoriteButton({
  petId,
  petName,
  variant = "icon",
  className = "",
}: FavoriteButtonProps): ReactElement {
  const isFavorite = useFavoriteStore((state) => state.ids.includes(petId));
  const toggle = useFavoriteStore((state) => state.toggle);
  const showToast = useToastStore((state) => state.show);

  const handleClick = (): void => {
    toggle(petId);
    showToast(
      "info",
      isFavorite ? `นำ "${petName}" ออกจากรายการโปรดแล้ว` : `เพิ่ม "${petName}" ในรายการโปรดแล้ว`,
    );
  };

  const label = isFavorite ? "นำออกจากรายการโปรด" : "เพิ่มในรายการโปรด";

  if (variant === "full") {
    return (
      <button
        type="button"
        aria-pressed={isFavorite}
        onClick={handleClick}
        className={`btn ${isFavorite ? "btn-secondary" : "btn-outline btn-secondary"} ${className}`}
      >
        <HeartIcon filled={isFavorite} /> {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={`${label}: ${petName}`}
      title={label}
      onClick={handleClick}
      className={`btn btn-circle btn-sm border-0 shadow ${
        isFavorite ? "btn-secondary" : "bg-base-100/90 text-secondary hover:bg-base-100"
      } ${className}`}
    >
      <HeartIcon filled={isFavorite} className="size-4" />
    </button>
  );
}
