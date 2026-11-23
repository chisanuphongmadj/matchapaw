import type { ReactElement, ReactNode } from "react";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ emoji = "🐾", title, description, action }: EmptyStateProps): ReactElement {
  return (
    <div className="flex flex-col items-center gap-3 rounded-box border border-dashed border-base-300 bg-base-200/50 px-6 py-14 text-center">
      <span className="text-5xl" aria-hidden="true">
        {emoji}
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-md text-sm text-base-content/70">{description}</p>}
      {action}
    </div>
  );
}
