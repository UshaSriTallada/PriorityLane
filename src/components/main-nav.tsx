'use client';

import { usePathname } from 'next/navigation';
import { ClipboardList, Users } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import Link from 'next/link';

const divisions = ['Operations', 'Processing', 'Production', 'Maintenance', 'Logistics'];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Tasks">
            <Link href="/dashboard">
              <ClipboardList />
              <span className="group-data-[collapsible=icon]:hidden">All Tasks</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarGroup>
        <SidebarGroupLabel>Divisions</SidebarGroupLabel>
        <SidebarMenu>
          {divisions.map((division) => (
            <SidebarMenuItem key={division}>
              <SidebarMenuButton disabled tooltip={division}>
                <Users />
                <span className="group-data-[collapsible=icon]:hidden">{division}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
