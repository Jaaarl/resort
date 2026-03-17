import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi, type Reservation } from "../../api/reservations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Badge } from "@/components/ui/badge";
import ReservationForm from "./ReservationForm";
import { toast } from "sonner";

const statusColors: Record<
  string,
  "default" | "destructive" | "secondary" | "outline"
> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
};

export default function ReservationListPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [editReservation, setEditReservation] = useState<Reservation | null>(
    null,
  );
  const { data, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => reservationsApi.getAll().then((res) => res.data.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      reservationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Reservation updated successfully");
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.error || "Failed to update reservation",
      ),
  });

  const cancelMutation = useMutation({
    mutationFn: reservationsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Reservation cancelled successfully");
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.error || "Failed to cancel reservation",
      ),
  });

  const filtered = data?.filter((r) =>
    statusFilter === "ALL" ? true : r.status === statusFilter,
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <Button onClick={() => setOpen(true)}>New Reservation</Button>
      </div>
      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Filter by status:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
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
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Add-ons</TableHead>
                <TableHead>Persons</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Walk-in</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{reservation.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {reservation.customerPhone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{reservation.type}</TableCell>
                  <TableCell>
                    {reservation.addOns?.length > 0
                      ? reservation.addOns
                          .map((a) => `${a.addOn.name} x${a.quantity}`)
                          .join(", ")
                      : "-"}
                  </TableCell>
                  <TableCell>{reservation.totalPerson}</TableCell>
                  <TableCell>₱{reservation.totalAmount}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[reservation.status]}>
                      {reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{reservation.isWalkIn ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {/* View button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditReservation(reservation)}
                      >
                        Edit
                      </Button>

                      {reservation.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: reservation.id,
                              status: "CONFIRMED",
                            })
                          }
                        >
                          Confirm
                        </Button>
                      )}
                      {reservation.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: reservation.id,
                              status: "COMPLETED",
                            })
                          }
                        >
                          Complete
                        </Button>
                      )}
                      {reservation.status !== "CANCELLED" &&
                        reservation.status !== "COMPLETED" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              cancelMutation.mutate(reservation.id)
                            }
                          >
                            Cancel
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Reservation</DialogTitle>
          </DialogHeader>
          <ReservationForm
            onSuccess={() => {
              setOpen(false);
              queryClient.invalidateQueries({ queryKey: ["reservations"] });
            }}
          />
        </DialogContent>
      </Dialog>
      <Sheet
        open={!!selectedReservation}
        onOpenChange={() => setSelectedReservation(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Reservation Details</SheetTitle>
          </SheetHeader>
          {selectedReservation && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">
                  {selectedReservation.customerName}
                </p>
                <p className="text-sm">{selectedReservation.customerPhone}</p>
                <p className="text-sm">{selectedReservation.customerEmail}</p>
                <p className="text-sm">
                  {selectedReservation.customerLocation}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reservation</p>
                <p className="font-medium">Type: {selectedReservation.type}</p>
                <p>Persons: {selectedReservation.totalPerson}</p>
                <p>Amount: ₱{selectedReservation.totalAmount}</p>
                <p>Walk-in: {selectedReservation.isWalkIn ? "Yes" : "No"}</p>
              </div>
              {selectedReservation.rooms?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Rooms</p>
                  {selectedReservation.rooms.map((r, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium">{r.room.name}</p>
                      <p>
                        Check-in: {new Date(r.checkIn).toLocaleDateString()}
                      </p>
                      <p>
                        Check-out: {new Date(r.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {selectedReservation.poolSlots?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Pool Slots</p>
                  {selectedReservation.poolSlots.map((s, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium">{s.poolSlot.label}</p>
                      <p>Date: {new Date(s.poolDate).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedReservation.addOns?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Add-ons</p>
                  {selectedReservation.addOns.map((a, i) => (
                    <div key={i} className="text-sm">
                      <p>
                        {a.addOn.name} x{a.quantity} — ₱{a.price}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Badge variant={statusColors[selectedReservation.status]}>
                {selectedReservation.status}
              </Badge>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!editReservation}
        onOpenChange={() => setEditReservation(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
          </DialogHeader>
          {editReservation && (
            <ReservationForm
              reservation={editReservation}
              onSuccess={() => {
                setEditReservation(null);
                queryClient.invalidateQueries({ queryKey: ["reservations"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
