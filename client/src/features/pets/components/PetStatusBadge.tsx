import type { ReactElement } from "react";
import { petStatusMeta } from "../../../lib/format";
import type { PetStatus } from "../../../types/models";

export function PetStatusBadge({ status, className = "" }: { status: PetStatus; className?: string }): ReactElement {
  const meta = petStatusMeta[status];
  return <span className={`badge ${meta.badge} ${className}`}>{meta.label}</span>;
}
