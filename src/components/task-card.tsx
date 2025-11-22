
import { Task } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { format, isPast, formatDistanceToNow } from "date-fns";
import { Calendar, Clock, ShieldAlert, Sparkles, Users, Edit, User, PlayCircle, CalendarPlus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface TaskCardProps {
  task: Task;
  onSubtaskChange: (taskId: string, subtaskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onTaskStart: (taskId: string) => void;
  onSubtaskStart: (taskId: string, subtaskId: string) => void;
  className?: string;
}

const impactVariantMap: Record<Task['impact'], 'destructive' | 'secondary' | 'outline'> = {
  'High': 'destructive',
  'Medium': 'secondary',
  'Low': 'outline',
};

const divisionColorMap: Record<Task['division'], string> = {
    'Maintenance': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700',
    'Processing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-700',
    'Production': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700',
    'Operations': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
    'Logistics': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700'
}

export function TaskCard({ task, onSubtaskChange, onEdit, onTaskStart, onSubtaskStart, className }: TaskCardProps) {
  const isTaskOverdue = !task.doneAt && isPast(new Date(task.deadline));
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : (task.doneAt ? 100 : 0);
  const isCompleted = !!task.doneAt;

  return (
    <Card className={cn("border-destructive/50 ring-1 ring-destructive/20", isCompleted && "bg-muted/50", "transition-shadow hover:shadow-md dark:hover:shadow-primary/10 flex flex-col", className)}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                 <CardTitle className="text-lg font-semibold leading-tight">{task.name}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">{task.description}</CardDescription>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Task</span>
                </Button>
                {task.priority !== undefined && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-accent-foreground/80 font-bold bg-accent/10 rounded-full px-3 py-1">
                                    <Sparkles className="h-4 w-4 text-accent" />
                                    <span className="text-lg">{task.priority}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="end">
                                <p className="max-w-xs text-sm"><strong>AI Priority Reason:</strong> {task.priorityReason}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm text-muted-foreground flex-wrap gap-2">
            <div className={cn("flex items-center gap-2", isTaskOverdue && "text-destructive font-medium")}>
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(task.deadline), "MMM d, yyyy")}</span>
                 {isTaskOverdue && <Badge variant="destructive" className="animate-pulse">OVERDUE</Badge>}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{task.owner.name}</span>
            </div>
        </div>
        
        {(task.subtasks.length > 0 || isCompleted) && (
          <div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
                {isCompleted ? "Completed" : `${completedSubtasks} of ${task.subtasks.length} subtasks complete`}
            </div>
          </div>
        )}

        {task.subtasks.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="subtasks" className="border-t">
              <AccordionTrigger className="text-sm font-medium hover:no-underline pt-3">
                {`View ${task.subtasks.length} Subtask(s)`}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 pt-2">
                  {task.subtasks.map(subtask => {
                    const isSubtaskOverdue = !subtask.completed && isPast(new Date(subtask.deadline));
                    return (
                        <li key={subtask.id} className="flex items-start gap-3 p-2 rounded-md transition-colors hover:bg-muted/50">
                             <Checkbox
                                id={`subtask-${subtask.id}`}
                                checked={subtask.completed}
                                onCheckedChange={(checked) => onSubtaskChange(task.id, subtask.id, !!checked)}
                                className="mt-1"
                                aria-label={`Mark subtask ${subtask.name} as complete`}
                            />
                            <div className="grid gap-1.5 leading-snug flex-1">
                                <label htmlFor={`subtask-${subtask.id}`} className={cn("font-medium cursor-pointer", subtask.completed && "line-through text-muted-foreground")}>
                                    {subtask.name}
                                </label>
                                <p className="text-sm text-muted-foreground">{subtask.description}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className={cn("flex items-center", isSubtaskOverdue && "text-destructive font-semibold")}>
                                        <Clock className="h-3 w-3 mr-1"/>
                                        Deadline: {format(new Date(subtask.deadline), "MMM d")}
                                        {isSubtaskOverdue && <span className="ml-2">(Overdue)</span>}
                                    </div>
                                    {subtask.assignee && (
                                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                                            <User className="h-3 w-3 text-muted-foreground"/>
                                            <span>{subtask.assignee.name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground mt-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger className="flex items-center gap-1">
                                                <CalendarPlus className="h-3 w-3"/>
                                                Created {formatDistanceToNow(new Date(subtask.createdAt), { addSuffix: true })}
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" align="start">
                                                {format(new Date(subtask.createdAt), "PPP p")}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                     {!subtask.completed && !subtask.startedAt && (
                                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => onSubtaskStart(task.id, subtask.id)}>
                                            <PlayCircle className="h-3 w-3 mr-1" />
                                            Start
                                        </Button>
                                    )}
                                    {subtask.startedAt && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger className="flex items-center gap-1 text-green-600">
                                                    <PlayCircle className="h-3 w-3" />
                                                    Started {formatDistanceToNow(new Date(subtask.startedAt), { addSuffix: true })}
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" align="start">
                                                    {format(new Date(subtask.startedAt), "PPP p")}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    {subtask.completedAt && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger className="flex items-center gap-1 text-green-600 font-medium">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Completed {formatDistanceToNow(new Date(subtask.completedAt), { addSuffix: true })}
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" align="start">
                                                    {format(new Date(subtask.completedAt), "PPP p")}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </div>
                        </li>
                    )
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
      <CardFooter className="mt-auto flex flex-wrap justify-between items-center gap-2 pt-4">
        <div className="flex items-center gap-2">
            <Badge className={cn(divisionColorMap[task.division] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700')}><Users className="h-3 w-3 mr-1.5"/>{task.division}</Badge>
            <Badge variant={impactVariantMap[task.impact]}><ShieldAlert className="h-3 w-3 mr-1.5"/>{task.impact}</Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1.5">
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                    </TooltipTrigger>
                    <TooltipContent>
                        {format(new Date(task.createdAt), "PPP p")}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {!isCompleted && !task.startedAt && (
                 <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onTaskStart(task.id)}>
                    <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
                    Start Task
                </Button>
            )}

            {task.startedAt && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1.5">
                            <PlayCircle className="h-3.5 w-3.5 text-green-600" />
                            Started {formatDistanceToNow(new Date(task.startedAt), { addSuffix: true })}
                        </TooltipTrigger>
                        <TooltipContent>
                             {format(new Date(task.startedAt), "PPP p")}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {isCompleted && task.doneAt && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1.5 font-medium text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completed {formatDistanceToNow(new Date(task.doneAt), { addSuffix: true })}
                        </TooltipTrigger>
                        <TooltipContent>
                            {format(new Date(task.doneAt), "PPP p")}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
