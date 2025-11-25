
'use client';
import MainNav from '@/components/main-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Factory, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { StateProvider } from '@/hooks/use-state-manager';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/header';
import { useMemo } from 'react';
import { isPast } from 'date-fns';
import { useStateManager } from '@/hooks/use-state-manager';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardNav() {
    return <MainNav />;
}

function SkeletonDashboard() {
    return (
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
                   <div className="flex flex-col gap-4">
                        <SidebarMenuSkeleton showIcon />
                        <SidebarMenuSkeleton showIcon />
                   </div>
                   <div className="mt-4 flex flex-col gap-4">
                        <Skeleton className="h-4 w-20" />
                        <SidebarMenuSkeleton showIcon />
                        <SidebarMenuSkeleton showIcon />
                   </div>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <div className="flex h-screen flex-col">
                    <Header overdueCount={0} />
                    <main className="flex-1 p-4 md:p-6 lg:p-8">
                         <div className="flex items-center justify-between mb-8">
                            <div>
                                <Skeleton className="h-8 w-64 mb-2" />
                                <Skeleton className="h-4 w-96" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-10 w-40" />
                                <Skeleton className="h-10 w-28" />
                            </div>
                         </div>
                         <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            <Skeleton className="h-[300px] w-full" />
                            <Skeleton className="h-[300px] w-full" />
                         </div>
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
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
        return <SkeletonDashboard />;
    }
    
    return (
        <StateProvider>
            <ProtectedDashboardLayout>{children}</ProtectedDashboardLayout>
        </StateProvider>
    );
}
