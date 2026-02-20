'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Calendar,
  User,
  Pill,
  FlaskConical,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Appointments',
    href: '/appointments',
    icon: Calendar,
  },
  {
    title: 'Prescriptions',
    href: '/prescriptions',
    icon: Pill,
  },
  {
    title: 'Lab Reports',
    href: '/lab-reports',
    icon: FlaskConical,
  },
  {
    title: 'Roles',
    href: '/roles',
    icon: Shield,
  },
  {
    title: 'Permissions',
    href: '/permissions',
    icon: Lock,
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      'relative pb-12 min-h-screen border-r bg-card transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {/* Logo - Fixed Width */}
          <div className={cn(
            'mb-4 px-4 h-6 flex items-center',
            collapsed ? 'justify-center' : 'justify-start'
          )}>
            {!collapsed ? (
              <div >
                <h2 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-400">
                  MediCare
                </h2>
                <p className="text-xs text-muted-foreground">
                  Healthcare Management
                </p>
              </div>
            ) : (
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-400">M</div>
            )}
          </div>

          {/* Toggle Button */}
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              'absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border bg-background shadow-md',
              collapsed && 'rotate-180'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button> */}

          <Separator className="my-4" />

          {/* Menu Items */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full',
                      collapsed ? 'justify-center px-2' : 'justify-start',
                      isActive && 'bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100'
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
