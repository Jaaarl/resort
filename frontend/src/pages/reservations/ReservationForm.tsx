import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { reservationsApi } from "../../api/reservations";
import { roomsApi } from "../../api/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reservationSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(1, "Phone is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerLocation: z.string().optional(),
  type: z.enum(["ROOM", "POOL", "BOTH"]),
  totalPerson: z.coerce.number().int().positive(),
  totalAmount: z.coerce.number().positive(),
  isWalkIn: z.boolean().default(false),
});

type ReservationFormInput = z.infer<typeof reservationSchema>;

export default function ReservationForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [type, setType] = useState<"ROOM" | "POOL" | "BOTH">("ROOM");

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomsApi.getAll().then((res) => res.data.data),
  });

  const [selectedRooms, setSelectedRooms] = useState([
    { roomId: "", checkIn: "", checkOut: "" },
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReservationFormInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { type: "ROOM", isWalkIn: false },
  });

  const createMutation = useMutation({
    mutationFn: reservationsApi.create,
    onSuccess,
  });

  const onSubmit = (data: ReservationFormInput) => {
    createMutation.mutate({
      ...data,
      rooms: type === "ROOM" || type === "BOTH" ? selectedRooms : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-h-96 overflow-y-auto pr-2"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Customer Name</Label>
          <Input {...register("customerName")} placeholder="Full name" />
          {errors.customerName && (
            <p className="text-sm text-red-500">
              {errors.customerName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input {...register("customerPhone")} placeholder="Phone number" />
          {errors.customerPhone && (
            <p className="text-sm text-red-500">
              {errors.customerPhone.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email (optional)</Label>
          <Input {...register("customerEmail")} placeholder="Email" />
        </div>
        <div className="space-y-2">
          <Label>Location (optional)</Label>
          <Input {...register("customerLocation")} placeholder="City" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={type}
            onValueChange={(val: "ROOM" | "POOL" | "BOTH") => {
              setType(val);
              setValue("type", val);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ROOM">Room</SelectItem>
              <SelectItem value="POOL">Pool</SelectItem>
              <SelectItem value="BOTH">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Total Persons</Label>
          <Input {...register("totalPerson")} type="number" />
          {errors.totalPerson && (
            <p className="text-sm text-red-500">{errors.totalPerson.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Total Amount</Label>
          <Input {...register("totalAmount")} type="number" />
          {errors.totalAmount && (
            <p className="text-sm text-red-500">{errors.totalAmount.message}</p>
          )}
        </div>
      </div>

      {/* Walk-in checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isWalkIn"
          {...register("isWalkIn")}
          className="w-4 h-4"
        />
        <Label htmlFor="isWalkIn">Walk-in customer</Label>
      </div>

      {/* Room fields */}
      {(type === "ROOM" || type === "BOTH") && (
        <div className="space-y-2">
          <Label>Room</Label>
          {selectedRooms.map((_, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <Select
                onValueChange={(val) => {
                  const updated = [...selectedRooms];
                  updated[index].roomId = val;
                  setSelectedRooms(updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms?.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                onChange={(e) => {
                  const updated = [...selectedRooms];
                  updated[index].checkIn = new Date(
                    e.target.value + "T00:00:00.000Z",
                  ).toISOString();
                  setSelectedRooms(updated);
                }}
              />
              <Input
                type="date"
                onChange={(e) => {
                  const updated = [...selectedRooms];
                  updated[index].checkOut = new Date(
                    e.target.value + "T00:00:00.000Z",
                  ).toISOString();
                  setSelectedRooms(updated);
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSelectedRooms([
                ...selectedRooms,
                { roomId: "", checkIn: "", checkOut: "" },
              ])
            }
          >
            + Add Another Room
          </Button>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? "Creating..." : "Create Reservation"}
      </Button>
    </form>
  );
}
