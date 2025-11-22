'use client';

import { usePathname } from 'next/navigation';
import { ClipboardList, Users, PlusCircle, MoreVertical, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDivisions } from '@/hooks/use-divisions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';


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
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                setError('');
                setName('');
            }
        }}>
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

function DivisionActions({ divisionName }: { divisionName: string }) {
    const { onDivisionUpdate, onDivisionDelete, divisions } = useDivisions();
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [newName, setNewName] = React.useState(divisionName);
    const [error, setError] = React.useState('');
    const { toast } = useToast();

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) {
            setError('Division name cannot be empty.');
            return;
        }
        if (newName.trim().toLowerCase() !== divisionName.toLowerCase() && divisions.map(d => d.toLowerCase()).includes(newName.trim().toLowerCase())) {
            setError('This division already exists.');
            return;
        }
        onDivisionUpdate(divisionName, newName.trim());
        toast({
            title: "Division Updated",
            description: `"${divisionName}" was renamed to "${newName.trim()}".`
        });
        setIsEditDialogOpen(false);
    };
    
    const handleDelete = () => {
        onDivisionDelete(divisionName);
        toast({
            title: "Division Deleted",
            description: `The "${divisionName}" division has been removed.`
        });
        setIsDeleteDialogOpen(false);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                        <MoreVertical />
                        <span className="sr-only">Division Actions</span>
                    </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
                setIsEditDialogOpen(isOpen);
                if (!isOpen) {
                    setError('');
                    setNewName(divisionName);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Division</DialogTitle>
                        <DialogDescription>Enter the new name for the "{divisionName}" division.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="grid gap-4 py-4">
                            <Label htmlFor="new-division-name">New Name</Label>
                            <Input id="new-division-name" value={newName} onChange={(e) => {
                                setNewName(e.target.value);
                                setError('');
                            }}/>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the "{divisionName}" division. This action cannot be undone. Any tasks in this division will need to be reassigned.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
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
         <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === '/dashboard/done'} tooltip="Done Tasks">
            <Link href="/dashboard/done">
              <CheckCircle2 />
              <span className="group-data-[collapsible=icon]:hidden">Done Tasks</span>
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
                  <span className="group-data-[collapsible=icon]:hidden truncate">{division}</span>
                </Link>
              </SidebarMenuButton>
              <DivisionActions divisionName={division} />
            </SidebarMenuItem>
          ))}
          <AddDivisionDialog />
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
