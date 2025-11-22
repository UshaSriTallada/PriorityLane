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
import Header from '@/components/header';
import { useMemo } from 'react';
import { isPast } from 'date-fns';
import { useStateManager } from '@/hooks/use-state-manager';


function DashboardNav() {
    return <MainNav />;
}

function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
    const { tasks } = useStateManager();
    const overdueCount = useMemo(() => {
        return tasks.reduce((count, task) => {
            const isTaskOverdue = !task.doneAt && isPast(new Date(task.deadline));
            if (isTaskOverdue) {
                return count + 1;
            }
            return count;
        }, 0);
      }, [tasks]);

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
                    <div className="flex h-screen flex-col">
                        <Header overdueCount={overdueCount} />
                        <div className="flex-1 overflow-y-auto">
                            {children}
                        </div>
                    </div>
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
