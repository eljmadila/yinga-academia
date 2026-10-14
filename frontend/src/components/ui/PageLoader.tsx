import React from "react";
import { Skeleton } from "./skeleton";

export function PageLoader() {
  return (
    <div className="space-y-6 w-full p-2">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-4 w-96 bg-gray-200 dark:bg-gray-800" />
        </div>
        <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-800" />
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
      
      <Skeleton className="h-[400px] w-full rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
