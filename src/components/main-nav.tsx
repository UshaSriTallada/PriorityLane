'use client';

import { usePathname } from 'next/navigation';
import { ClipboardList, Users, PlusCircle } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDivisions } from '@/hooks/use-divisions';


function AddDivisionDialog() {
    const { onDivisionCreate, divisions } = useDivisions();
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Division name cannot be empty.');
            return;
        }
        if (divisions.map(d => d.toLowerCase()).includes(name.trim().toLowerCase())) {
            setError('This division already exists.');
            return;
        }
        onDivisionCreate(name.trim());
        toast({
            title: 'Division Added',
            description: `The "${name.trim()}" division has been created.`,
        });
        setName('');
        setError('');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <SidebarMenuItem>
                 <SidebarMenuButton asChild={false} onClick={() => setOpen(true)} className="w-full justify-start">
                    <PlusCircle />
                    <span className="group-data-[collapsible=icon]:hidden">Add Division</span>
                 </SidebarMenuButton>
            </SidebarMenuItem>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Division</DialogTitle>
                    <DialogDescription>
                        Enter the name for the new division.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="division-name">Division Name</Label>
                            <Input
                                id="division-name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setError('');
                                }}
                                placeholder="e.g., Quality Assurance"
                            />
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Division</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export default function MainNav() {
  const pathname = usePathname();
  const { divisions } = useDivisions();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="All Tasks">
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
               <SidebarMenuButton
                asChild
                isActive={pathname === `/dashboard/${division.toLowerCase()}`}
                tooltip={division}
              >
                <Link href={`/dashboard/${division.toLowerCase()}`}>
                  <Users />
                  <span className="group-data-[collapsible=icon]:hidden">{division}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <AddDivisionDialog />
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
