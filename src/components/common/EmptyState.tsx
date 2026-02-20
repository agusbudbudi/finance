import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  className = "",
  action,
}) => {
  return (
    <div
      className={`py-10 text-center flex flex-col items-center bg-gray-50/10 dark:bg-gray-950/50 rounded-xl border border-dashed border-gray-100 dark:border-white/5 ${className}`}
    >
      <Icon className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
      <div className="space-y-1">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
          {title}
        </p>
        {description && (
          <p className="text-gray-500 dark:text-white/40 text-xs font-medium">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
