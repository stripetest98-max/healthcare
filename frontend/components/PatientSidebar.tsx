'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Calendar,
  Pill,
  FlaskConical,
  Activity,
  FileText,
  User,
} from 'lucide-react';

interface PatientSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const patientMenuItems = [
  {
    title: 'Dashboard',
    href: '/patient-dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Profile',
    href: '/patient-dashboard/profile',
    icon: User,
  },
  {
    title: 'Appointments',
    href: '/patient-dashboard/appointments',
    icon: Calendar,
  },
  {
    title: 'Prescriptions',
    href: '/patient-dashboard/prescriptions',
    icon: Pill,
  },
  {
    title: 'Lab Reports',
    href: '/patient-dashboard/lab-reports',
    icon: FlaskConical,
  },
  {
    title: 'Vitals',
    href: '/patient-dashboard/vitals',
    icon: Activity,
  },
  {
    title: 'Diagnosis',
    href: '/patient-dashboard/diagnosis',
    icon: FileText,
  },
];

export function PatientSidebar({ collapsed }: PatientSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      'relative pb-12 min-h-screen border-r bg-card transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className={cn(
            'mb-4 px-4 h-6 flex items-center',
            collapsed ? 'justify-center' : 'justify-start'
          )}>
            {!collapsed ? (
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-400">
                  MediCare
                </h2>
                <p className="text-xs text-muted-foreground">
                  Patient Portal
                </p>
              </div>
            ) : (
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-400">M</div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            {patientMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full',
                      collapsed ? 'justify-center px-2' : 'justify-start',
                      isActive && 'bg-blue-900 text-white hover:bg-blue-800 dark:bg-blue-900 dark:text-white dark:hover:bg-blue-800'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className={cn('h-5 w-5', !collapsed && 'mr-2')} />
                    {!collapsed && <span>{item.title}</span>}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
