'use client';

import { useState } from 'react';
import { PatientSidebar } from './PatientSidebar';
import { Header } from './Header';

interface PatientDashboardLayoutProps {
  children: React.ReactNode;
  user: any;
}

export function PatientDashboardLayout({ children, user }: PatientDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <PatientSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
