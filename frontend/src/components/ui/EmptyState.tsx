import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900/20 w-full">
      <div className="mb-4 rounded-full bg-brand-100 p-4 dark:bg-brand-900/30">
        <Icon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
