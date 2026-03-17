import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { poolApi, type PoolSlot, type PoolAvailability } from "../../api/pool";
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

const poolSlotSchema = z.object({
  label: z.enum(["MORNING", "AFTERNOON"]),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  capacity: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
});

const disableSchema = z.object({
  date: z.string().min(1, "Date is required"),
  reason: z.string().optional(),
});

type PoolSlotInput = z.infer<typeof poolSlotSchema>;
type DisableInput = z.infer<typeof disableSchema>;

export default function PoolListPage() {
  const queryClient = useQueryClient();
  const [slotOpen, setSlotOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<PoolSlot | null>(null);
  const [disableSlot, setDisableSlot] = useState<PoolSlot | null>(null);

  const { data: slots, isLoading } = useQuery({
    queryKey: ["pool"],
    queryFn: () => poolApi.getAll().then((res) => res.data.data),
  });

  const { data: availability } = useQuery({
    queryKey: ["pool-availability", availabilityDate],
    queryFn: () =>
      poolApi
        .getAvailability(new Date(availabilityDate).toISOString())
        .then((res) => res.data.data),
    enabled: !!availabilityDate,
  });

  const {
    register: registerSlot,
    handleSubmit: handleSlotSubmit,
    reset: resetSlot,
    setValue: setSlotValue,
    formState: { errors: slotErrors },
  } = useForm<PoolSlotInput>({ resolver: zodResolver(poolSlotSchema) });

  const {
    register: registerDisable,
    handleSubmit: handleDisableSubmit,
    reset: resetDisable,
  } = useForm<DisableInput>({ resolver: zodResolver(disableSchema) });

  const createMutation = useMutation({
    mutationFn: poolApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
      setSlotOpen(false);
      resetSlot();
      toast.success("Pool slot created");
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.error || "Failed to create pool slot"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PoolSlot> }) =>
      poolApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
      setSlotOpen(false);
      setSelectedSlot(null);
      resetSlot();
      toast.success("Pool slot updated");
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.error || "Failed to update pool slot"),
  });

  const disableMutation = useMutation({
    mutationFn: (data: { label: string; date: string; reason?: string }) =>
      poolApi.disable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool-availability"] });
      setDisableOpen(false);
      resetDisable();
      toast.success("Pool slot disabled");
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.error || "Failed to disable pool slot"),
  });

  const enableMutation = useMutation({
    mutationFn: ({ label, date }: { label: string; date: string }) =>
      poolApi.enable(label, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool-availability"] });
      toast.success("Pool slot enabled");
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.error || "Failed to enable pool slot"),
  });

  const onSlotSubmit = (data: PoolSlotInput) => {
    if (selectedSlot) {
      updateMutation.mutate({ id: selectedSlot.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onDisableSubmit = (data: DisableInput) => {
    if (!disableSlot) return;
    disableMutation.mutate({
      label: disableSlot.label,
      date: new Date(data.date + "T00:00:00.000Z").toISOString(),
      reason: data.reason,
    });
  };

  const handleEdit = (slot: PoolSlot) => {
    setSelectedSlot(slot);
    setSlotValue("label", slot.label);
    setSlotValue("startTime", slot.startTime);
    setSlotValue("endTime", slot.endTime);
    setSlotValue("capacity", slot.capacity);
    setSlotValue("price", slot.price);
    setSlotOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pool Slots</h1>
        <Button
          onClick={() => {
            setSelectedSlot(null);
            resetSlot();
            setSlotOpen(true);
          }}
        >
          Add Slot
        </Button>
      </div>

      {/* Pool Slots Table */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots?.map((slot) => (
              <TableRow key={slot.id}>
                <TableCell>
                  <Badge>{slot.label}</Badge>
                </TableCell>
                <TableCell>{slot.startTime}</TableCell>
                <TableCell>{slot.endTime}</TableCell>
                <TableCell>{slot.capacity}</TableCell>
                <TableCell>₱{slot.price}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(slot)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDisableSlot(slot);
                      setDisableOpen(true);
                    }}
                  >
                    Disable Date
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Availability Checker */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Check Availability</h2>
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            className="w-48"
            onChange={(e) => setAvailabilityDate(e.target.value)}
          />
        </div>
        {availability && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availability.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell>
                    <Badge>{slot.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {slot.startTime} - {slot.endTime}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={slot.isAvailable ? "default" : "destructive"}
                    >
                      {slot.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>{slot.disabledReason || "-"}</TableCell>
                  <TableCell>
                    {!slot.isAvailable && slot.disabledReason && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          enableMutation.mutate({
                            label: slot.label,
                            date: new Date(
                              availabilityDate + "T00:00:00.000Z",
                            ).toISOString(),
                          })
                        }
                      >
                        Enable
                      </Button>
                    )}
                    {slot.isAvailable && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setDisableSlot(slot);
                          setDisableOpen(true);
                        }}
                      >
                        Disable
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Slot Dialog */}
      <Dialog open={slotOpen} onOpenChange={setSlotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSlot ? "Edit Slot" : "Add Slot"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSlotSubmit(onSlotSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Select
                defaultValue={selectedSlot?.label}
                onValueChange={(val) =>
                  setSlotValue("label", val as "MORNING" | "AFTERNOON")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING">Morning</SelectItem>
                  <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                </SelectContent>
              </Select>
              {slotErrors.label && (
                <p className="text-sm text-red-500">
                  {slotErrors.label.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  {...registerSlot("startTime")}
                  placeholder="e.g. 06:00"
                />
                {slotErrors.startTime && (
                  <p className="text-sm text-red-500">
                    {slotErrors.startTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input {...registerSlot("endTime")} placeholder="e.g. 14:00" />
                {slotErrors.endTime && (
                  <p className="text-sm text-red-500">
                    {slotErrors.endTime.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input {...registerSlot("capacity")} type="number" />
                {slotErrors.capacity && (
                  <p className="text-sm text-red-500">
                    {slotErrors.capacity.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input {...registerSlot("price")} type="number" />
                {slotErrors.price && (
                  <p className="text-sm text-red-500">
                    {slotErrors.price.message}
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full">
              {selectedSlot ? "Update Slot" : "Create Slot"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Disable Slot Dialog */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable {disableSlot?.label} Slot</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleDisableSubmit(onDisableSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...registerDisable("date")} />
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input
                {...registerDisable("reason")}
                placeholder="e.g. Pool maintenance"
              />
            </div>
            <Button type="submit" className="w-full">
              Disable Slot
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
