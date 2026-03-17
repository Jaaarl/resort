import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceApi, type MaintenanceTask } from "../../api/maintenance";
import { usersApi } from "../../api/users";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  frequency: z.enum(["DAILY", "MONTHLY", "ONCE"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignedToId: z.string().min(1, "Assignee is required"),
});

const completeSchema = z.object({
  remarks: z.string().optional(),
  photoUrl: z.string().optional(),
});

type TaskInput = z.infer<typeof taskSchema>;
type CompleteInput = z.infer<typeof completeSchema>;

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
};

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [taskOpen, setTaskOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [frequencyFilter, setFrequencyFilter] = useState("ALL");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: () => maintenanceApi.getAll().then((res) => res.data.data),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getAll().then((res) => res.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskInput>({ resolver: zodResolver(taskSchema) });

  const {
    register: registerComplete,
    handleSubmit: handleCompleteSubmit,
    reset: resetComplete,
  } = useForm<CompleteInput>({ resolver: zodResolver(completeSchema) });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      maintenanceApi.create({ ...data, createdById: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      setTaskOpen(false);
      reset();
      toast.success("Maintenance task created");
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.error || "Failed to create task"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      maintenanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      setTaskOpen(false);
      setSelectedTask(null);
      reset();
      toast.success("Maintenance task updated");
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.error || "Failed to update task"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      maintenanceApi.updateStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteInput }) =>
      maintenanceApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      setCompleteOpen(false);
      resetComplete();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: maintenanceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Maintenance task deleted");
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.error || "Failed to delete task"),
  });

  const onTaskSubmit = (data: TaskInput) => {
    const payload = {
      ...data,
      dueDate: new Date(data.dueDate + "T00:00:00.000Z").toISOString(),
    };
    if (selectedTask) {
      updateMutation.mutate({ id: selectedTask.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const onCompleteSubmit = (data: CompleteInput) => {
    if (!selectedTask) return;
    completeMutation.mutate({ id: selectedTask.id, data });
  };

  const handleEdit = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setValue("title", task.title);
    setValue("description", task.description || "");
    setValue("frequency", task.frequency);
    setValue("dueDate", new Date(task.dueDate).toISOString().split("T")[0]);
    setValue("assignedToId", task.assignedToId);
    setTaskOpen(true);
  };

  const filtered = tasks?.filter((t) => {
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchFrequency =
      frequencyFilter === "ALL" || t.frequency === frequencyFilter;
    return matchStatus && matchFrequency;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <Button
          onClick={() => {
            setSelectedTask(null);
            reset();
            setTaskOpen(true);
          }}
        >
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Frequency</SelectItem>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="ONCE">Once</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-gray-500">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{task.frequency}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{task.assignedTo?.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[task.status]}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </Button>
                      {task.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: task.id,
                              status: "IN_PROGRESS",
                            })
                          }
                        >
                          Start
                        </Button>
                      )}
                      {task.status === "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setCompleteOpen(true);
                          }}
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(task.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Task Dialog */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask ? "Edit Task" : "Add Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onTaskSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...register("title")} placeholder="Task title" />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                {...register("description")}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  defaultValue={selectedTask?.frequency}
                  onValueChange={(val) => setValue("frequency", val as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="ONCE">Once</SelectItem>
                  </SelectContent>
                </Select>
                {errors.frequency && (
                  <p className="text-sm text-red-500">
                    {errors.frequency.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input {...register("dueDate")} type="date" />
                {errors.dueDate && (
                  <p className="text-sm text-red-500">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select
                defaultValue={selectedTask?.assignedToId}
                onValueChange={(val) => setValue("assignedToId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedToId && (
                <p className="text-sm text-red-500">
                  {errors.assignedToId.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              {selectedTask ? "Update Task" : "Create Task"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complete Task Dialog */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleCompleteSubmit(onCompleteSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Remarks (optional)</Label>
              <Input
                {...registerComplete("remarks")}
                placeholder="Any notes or observations"
              />
            </div>
            <div className="space-y-2">
              <Label>Photo URL (optional)</Label>
              <Input
                {...registerComplete("photoUrl")}
                placeholder="https://..."
              />
            </div>
            <Button type="submit" className="w-full">
              Mark as Completed
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
