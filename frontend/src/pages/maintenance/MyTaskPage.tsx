import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceApi, type MaintenanceTask } from "../../api/maintenance";
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

const completeSchema = z.object({
  remarks: z.string().optional(),
  photoUrl: z.string().optional(),
});

type CompleteInput = z.infer<typeof completeSchema>;

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
};

export default function MyTasksPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["my-tasks", user?.id],
    queryFn: () =>
      maintenanceApi.getMyTasks(user!.id).then((res) => res.data.data),
    enabled: !!user?.id,
  });

  const { register, handleSubmit, reset } = useForm<CompleteInput>({
    resolver: zodResolver(completeSchema),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      maintenanceApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      toast.success("Status updated");
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to update status"),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteInput }) =>
      maintenanceApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      setCompleteOpen(false);
      reset();
      toast.success("Task marked as completed");
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to complete task"),
  });

  const onCompleteSubmit = (data: CompleteInput) => {
    if (!selectedTask) return;
    completeMutation.mutate({ id: selectedTask.id, data });
  };

  const filtered = tasks?.filter((t) =>
    statusFilter === "ALL" ? true : t.status === statusFilter,
  );

  const pendingCount = tasks?.filter((t) => t.status === "PENDING").length || 0;
  const inProgressCount =
    tasks?.filter((t) => t.status === "IN_PROGRESS").length || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-500">{inProgressCount}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{tasks?.length || 0}</p>
        </div>
      </div>

      {/* Filter */}
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

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
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
                  <TableCell>
                    <Badge variant={statusColors[task.status]}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Complete Dialog */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task — {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCompleteSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Remarks (optional)</Label>
              <Input
                {...register("remarks")}
                placeholder="Any notes or observations"
              />
            </div>
            <div className="space-y-2">
              <Label>Photo URL (optional)</Label>
              <Input {...register("photoUrl")} placeholder="https://..." />
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
