'use client';
import MainNav from '@/components/main-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Factory } from 'lucide-react';
import Link from 'next/link';
import { StateProvider } from '@/hooks/use-state-manager';

function DashboardNav() {
    // This component no longer needs to manage providers.
    // The state is managed globally by StateProvider in the layout.
    return <MainNav />;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <StateProvider>
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex h-16 items-center border-b px-4 lg:h-[60px] lg:px-6">
                            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                                <Factory className="h-6 w-6 text-primary" />
                                <span className="group-data-[collapsible=icon]:hidden">FactoryFlow</span>
                            </Link>
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="p-2">
                        <DashboardNav />
                    </SidebarContent>
                </Sidebar>
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </StateProvider>
    );
}
