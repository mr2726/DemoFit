"use client"
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, Dumbbell, ShoppingCart, BarChart3, Settings, LogOut, User, Target, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';


const AppHeader = () => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="https://placehold.co/40x40" alt="@user" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

const NavItem = ({ href, icon: Icon, label, searchParams }: { href: string, icon: React.ElementType, label: string, searchParams?: URLSearchParams }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    const linkSearchParams = new URLSearchParams(searchParams);
    const linkHref = `${href}?${linkSearchParams.toString()}`;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                <Link href={linkHref}>
                    <Icon />
                    <span>{label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

const DashboardNav = () => {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const isAdmin = role === 'admin';

    const navSearchParams = new URLSearchParams();
    if (isAdmin) {
        navSearchParams.set('role', 'admin');
    }

    return (
        <SidebarMenu>
            <NavItem href="/dashboard" icon={Home} label="Dashboard" searchParams={navSearchParams} />
            {isAdmin && <NavItem href="/dashboard/analytics" icon={BarChart3} label="Analytics" searchParams={navSearchParams} />}
            {isAdmin && <NavItem href="/dashboard/products" icon={Package} label="Products" searchParams={navSearchParams} />}
            <NavItem href="/dashboard/marketplace" icon={ShoppingCart} label="Marketplace" searchParams={navSearchParams} />
            <NavItem href="/dashboard/my-workouts" icon={Dumbbell} label="My Workouts" searchParams={navSearchParams} />
        </SidebarMenu>
    )
}

const SettingsNav = () => {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const isAdmin = role === 'admin';

    const navSearchParams = new URLSearchParams();
    if (isAdmin) {
        navSearchParams.set('role', 'admin');
    }

    return (
        <SidebarMenu>
            <NavItem href="/dashboard/settings" icon={Settings} label="Settings" searchParams={navSearchParams} />
        </SidebarMenu>
    )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                  <Target className="h-7 w-7 text-primary" />
                  <span className="text-lg font-bold font-headline">Fitness Hub</span>
              </div>
          </SidebarHeader>
          <SidebarContent>
            <DashboardNav />
          </SidebarContent>
          <SidebarFooter>
            <SettingsNav />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </React.Suspense>
  );
}
