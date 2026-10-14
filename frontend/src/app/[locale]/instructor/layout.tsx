import React from 'react';
import InstructorSidebar from '@/layout/InstructorSidebar';
import AppHeader from '@/layout/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <InstructorSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}