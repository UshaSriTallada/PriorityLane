
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Task, Subtask } from "@/types";
import { useDivisions } from "@/hooks/use-divisions";
import { useUser } from "@/firebase";

const impacts: Task['impact'][] = ['High', 'Medium', 'Low'];

const taskSchema = z.object({
  name: z.string().min(3, { message: "Task name must be at least 3 characters." }),
  description: z.string().optional(),
  division: z.string().min(1, { message: "Please select a division" }),
  impact: z.enum(impacts),
  deadline: z.date({ required_error: "A deadline is required." }),
});

interface EditTaskDialogProps {
  task: Task;
  onTaskUpdate: (task: Task) => void;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, onTaskUpdate, onOpenChange }: EditTaskDialogProps) {
  const { divisions } = useDivisions();
  const { user } = useUser();
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema.extend({
        division: z.enum(divisions as [string, ...string[]], {
            errorMap: () => ({ message: "Please select a division." }),
        })
    })),
    defaultValues: {
      name: task.name,
      description: task.description,
      division: task.division,
      impact: task.impact,
      deadline: new Date(task.deadline),
    },
  });

  function onSubmit(values: z.infer<typeof taskSchema>) {
    const updatedTask: Task = {
      ...task,
      name: values.name,
      description: values.description || "",
      division: values.division as Task['division'],
      impact: values.impact,
      deadline: values.deadline.toISOString(),
      subtasks: subtasks
    };

    // If the task was done but we added new subtasks, move it back to active.
    if (updatedTask.doneAt && updatedTask.subtasks.length > task.subtasks.length) {
      updatedTask.doneAt = undefined;
    }

    onTaskUpdate(updatedTask);
  }

  const handleAddSubtask = () => {
    const assigneeName = user?.displayName || user?.email || 'Unassigned';
    const newSubtask: Subtask = {
        id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'New Subtask',
        description: '',
        deadline: new Date().toISOString(),
        completed: false,
        createdAt: new Date().toISOString(),
        assignee: {
            name: assigneeName,
            avatarUrl: user?.photoURL || `https://picsum.photos/seed/${assigneeName}/32/32`,
        }
    };
    setSubtasks([...subtasks, newSubtask]);
  };
  
  const handleSubtaskChange = (index: number, field: keyof Subtask, value: string | boolean) => {
    const newSubtasks = [...subtasks];
    // @ts-ignore
    newSubtasks[index][field] = value;
    setSubtasks(newSubtasks);
  };
  
  const handleSubtaskAssigneeChange = (index: number, name: string) => {
    const newSubtasks = [...subtasks];
    if (name) {
        newSubtasks[index].assignee = {
            name: name,
            avatarUrl: `https://picsum.photos/seed/${name}/32/32`,
        }
    } else {
        delete newSubtasks[index].assignee;
    }
    setSubtasks(newSubtasks);
  }


  const handleSubtaskDateChange = (index: number, date: Date | undefined) => {
      if(date) {
        const newSubtasks = [...subtasks];
        newSubtasks[index].deadline = date.toISOString();
        setSubtasks(newSubtasks);
      }
  }

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };


  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details for "{task.name}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Calibrate packaging sensors" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a detailed description for the owner..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <FormControl>
                    <Input disabled value={task.owner.name} />
                  </FormControl>
                </FormItem>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {impacts.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">Subtasks</h4>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddSubtask}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Subtask
                    </Button>
                </div>
                <div className="space-y-4">
                {subtasks.map((subtask, index) => (
                    <div key={subtask.id} className="grid gap-3 p-3 border rounded-lg">
                        <div className="flex justify-between items-start gap-2">
                            <Input
                                value={subtask.name}
                                onChange={(e) => handleSubtaskChange(index, 'name', e.target.value)}
                                placeholder="Subtask name"
                                className="font-medium flex-1"
                            />
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleRemoveSubtask(subtask.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                        <Textarea
                            value={subtask.description}
                            onChange={(e) => handleSubtaskChange(index, 'description', e.target.value)}
                            placeholder="Subtask description"
                            className="resize-none"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "pl-3 text-left font-normal",
                                        !subtask.deadline && "text-muted-foreground"
                                        )}
                                    >
                                        {subtask.deadline ? format(new Date(subtask.deadline), "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={new Date(subtask.deadline)}
                                        onSelect={(date) => handleSubtaskDateChange(index, date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                             <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={subtask.assignee?.name || ''}
                                    onChange={(e) => handleSubtaskAssigneeChange(index, e.target.value)}
                                    placeholder="Assignee"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
