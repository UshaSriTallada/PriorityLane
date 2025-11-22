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
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

function DashboardNav() {
    return <MainNav />;
}

function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return <ProtectedDashboardLayout>{children}</ProtectedDashboardLayout>;
}
