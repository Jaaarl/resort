import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { reservationsApi, type Reservation } from "../../api/reservations";
import { roomsApi } from "../../api/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addonsApi } from "../../api/addons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { poolApi } from "../../api/pool";

const reservationSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(1, "Phone is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerLocation: z.string().optional(),
  type: z.enum(["ROOM", "POOL", "BOTH"]),
  totalPerson: z.coerce.number().int().positive(),
  totalAmount: z.coerce.number().positive(),
  isWalkIn: z.boolean().default(false),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
});

type ReservationFormInput = z.infer<typeof reservationSchema>;

interface Props {
  reservation?: Reservation;
  onSuccess: () => void;
}

export default function ReservationForm({ reservation, onSuccess }: Props) {
  const isEditing = !!reservation;
  const [type, setType] = useState<"ROOM" | "POOL" | "BOTH">(
    reservation?.type || "ROOM",
  );

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomsApi.getAll().then((res) => res.data.data),
  });

  const { data: poolSlots } = useQuery({
    queryKey: ["pool"],
    queryFn: () => poolApi.getAll().then((res) => res.data.data),
  });

  const { data: addons } = useQuery({
    queryKey: ["addons"],
    queryFn: () => addonsApi.getAll().then((res) => res.data.data),
  });

  const [selectedRooms, setSelectedRooms] = useState(
    reservation?.rooms?.map((r) => ({
      roomId: r.roomId,
      checkIn: new Date(r.checkIn).toISOString().split("T")[0],
      checkOut: new Date(r.checkOut).toISOString().split("T")[0],
    })) || [{ roomId: "", checkIn: "", checkOut: "" }],
  );

  type PoolSlotSelection = { poolSlotId: string; poolDate: string };

  const [selectedPoolSlots, setSelectedPoolSlots] = useState<
    PoolSlotSelection[]
  >(
    reservation?.poolSlots?.map((s) => ({
      poolSlotId: s.poolSlotId,
      poolDate: new Date(s.poolDate).toISOString().split("T")[0],
    })) || [],
  );

  function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex items-center gap-2 pt-2">
        <span className="text-sm font-semibold text-gray-700">{children}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReservationFormInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      customerName: reservation?.customerName || "",
      customerPhone: reservation?.customerPhone || "",
      customerEmail: reservation?.customerEmail || "",
      customerLocation: reservation?.customerLocation || "",
      type: reservation?.type || "ROOM",
      totalPerson: reservation?.totalPerson || 1,
      totalAmount: reservation?.totalAmount || 0,
      isWalkIn: reservation?.isWalkIn || false,
      status: reservation?.status || "PENDING",
    },
  });
  const [selectedAddons, setSelectedAddons] = useState<
    Array<{ addOnId: string; quantity: number }>
  >(
    reservation?.addOns?.map((a) => ({
      addOnId: a.addOnId,
      quantity: a.quantity,
    })) || [],
  );

  const addAddonsMutation = useMutation({
    mutationFn: ({
      id,
      addOns,
    }: {
      id: string;
      addOns: { addOnId: string; quantity: number }[];
    }) => reservationsApi.updateAddOns(id, addOns),
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to update add-ons"),
  });

  const createMutation = useMutation({
    mutationFn: reservationsApi.create,
    onSuccess: () => {
      toast.success("Reservation created successfully");
      onSuccess();
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Failed to create reservation",
      ),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      reservationsApi.update(id, data),
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Failed to update reservation",
      ),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      reservationsApi.updateStatus(id, status),
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to update status"),
  });

  const onSubmit = (data: ReservationFormInput) => {
    if (isEditing && reservation) {
      updateMutation.mutate(
        { id: reservation.id, data },
        {
          onSuccess: () => {
            if (data.status && data.status !== reservation.status) {
              updateStatusMutation.mutate({
                id: reservation.id,
                status: data.status,
              });
            }

            addAddonsMutation.mutate(
              {
                id: reservation.id,
                addOns: selectedAddons.filter((a) => a.addOnId !== ""),
              },
              {
                onSuccess: () => onSuccess(),
                onError: (error: any) => {
                  const message =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Failed to update add-ons";
                  toast.error(message);
                },
              },
            );
          },
        },
      );
    } else {
      createMutation.mutate({
        ...data,
        rooms:
          type === "ROOM" || type === "BOTH"
            ? selectedRooms.map((r) => ({
                ...r,
                checkIn: new Date(r.checkIn + "T00:00:00.000Z").toISOString(),
                checkOut: new Date(r.checkOut + "T00:00:00.000Z").toISOString(),
              }))
            : undefined,
        poolSlots:
          type === "POOL" || type === "BOTH"
            ? selectedPoolSlots.map((s) => ({
                poolSlotId: s.poolSlotId,
                poolDate: new Date(s.poolDate + "T00:00:00.000Z").toISOString(),
              }))
            : undefined,
        addOns: selectedAddons.filter((a) => a.addOnId !== ""),
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-h-[75vh] overflow-y-auto pr-2"
    >
      {/* Customer Info */}
      <SectionTitle>Customer Information</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Name *</Label>
          <Input {...register("customerName")} placeholder="Full name" />
          {errors.customerName && (
            <p className="text-xs text-red-500">
              {errors.customerName.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Phone *</Label>
          <Input {...register("customerPhone")} placeholder="Phone number" />
          {errors.customerPhone && (
            <p className="text-xs text-red-500">
              {errors.customerPhone.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input {...register("customerEmail")} placeholder="Optional" />
        </div>
        <div className="space-y-1">
          <Label>Location</Label>
          <Input {...register("customerLocation")} placeholder="City" />
        </div>
      </div>

      {/* Reservation Details */}
      <SectionTitle>Reservation Details</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Type *</Label>
          <Select
            value={type}
            disabled={isEditing}
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
        <div className="space-y-1">
          <Label>Total Persons *</Label>
          <Input {...register("totalPerson")} type="number" min={1} />
        </div>
        <div className="space-y-1">
          <Label>Total Amount *</Label>
          <Input {...register("totalAmount")} type="number" min={0} />
        </div>
      </div>

      {/* Walk-in */}
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          {...register("isWalkIn")}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm text-gray-700">Walk-in customer</span>
      </label>

      {/* Room fields */}
      {(type === "ROOM" || type === "BOTH") && (
        <>
          <SectionTitle>Room Selection</SectionTitle>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs text-gray-500">Room</span>
              <span className="text-xs text-gray-500">Check-in</span>
              <span className="text-xs text-gray-500">Check-out</span>
            </div>
            {selectedRooms.map((room, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-center">
                <Select
                  value={room.roomId}
                  disabled={isEditing}
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
                    {rooms?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={room.checkIn}
                  disabled={isEditing}
                  onChange={(e) => {
                    const updated = [...selectedRooms];
                    updated[index].checkIn = e.target.value;
                    setSelectedRooms(updated);
                  }}
                />
                <div className="flex gap-1">
                  <Input
                    type="date"
                    value={room.checkOut}
                    disabled={isEditing}
                    onChange={(e) => {
                      const updated = [...selectedRooms];
                      updated[index].checkOut = e.target.value;
                      setSelectedRooms(updated);
                    }}
                  />
                  {!isEditing && selectedRooms.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setSelectedRooms(
                          selectedRooms.filter((_, i) => i !== index),
                        )
                      }
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!isEditing && (
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
            )}
          </div>
        </>
      )}

      {/* Pool fields */}
      {(type === "POOL" || type === "BOTH") && (
        <>
          <SectionTitle>Pool Slot Selection</SectionTitle>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-xs text-gray-500">Slot</span>
              <span className="text-xs text-gray-500">Date</span>
            </div>
            {selectedPoolSlots.map((slot, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 items-center">
                <Select
                  value={slot.poolSlotId}
                  disabled={isEditing}
                  onValueChange={(val) => {
                    const updated = [...selectedPoolSlots];
                    updated[index].poolSlotId = val;
                    setSelectedPoolSlots(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="MORNING or AFTERNOON" />
                  </SelectTrigger>
                  <SelectContent>
                    {poolSlots?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label} ({s.startTime} - {s.endTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Input
                    type="date"
                    value={slot.poolDate}
                    disabled={isEditing}
                    onChange={(e) => {
                      const updated = [...selectedPoolSlots];
                      updated[index].poolDate = e.target.value;
                      setSelectedPoolSlots(updated);
                    }}
                  />
                  {!isEditing && selectedPoolSlots.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setSelectedPoolSlots(
                          selectedPoolSlots.filter((_, i) => i !== index),
                        )
                      }
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedPoolSlots([
                    ...selectedPoolSlots,
                    { poolSlotId: "", poolDate: "" },
                  ])
                }
              >
                + Add Slot
              </Button>
            )}
          </div>
        </>
      )}

      {/* Add-ons */}
      <SectionTitle>Add-ons (Optional)</SectionTitle>
      <div className="space-y-2">
        {selectedAddons.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <span className="text-xs text-gray-500 col-span-2">Item</span>
            <span className="text-xs text-gray-500">Qty</span>
          </div>
        )}
        {selectedAddons.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 items-center">
            <Select
              value={item.addOnId}
              onValueChange={(val) => {
                const updated = [...selectedAddons];
                updated[index].addOnId = val;
                setSelectedAddons(updated);
              }}
            >
              <SelectTrigger className="col-span-2">
                <SelectValue placeholder="Select add-on" />
              </SelectTrigger>
              <SelectContent>
                {addons?.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} — ₱{a.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                min={1}
                onChange={(e) => {
                  const updated = [...selectedAddons];
                  updated[index].quantity = Number(e.target.value);
                  setSelectedAddons(updated);
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() =>
                  setSelectedAddons(
                    selectedAddons.filter((_, i) => i !== index),
                  )
                }
              >
                ✕
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setSelectedAddons([...selectedAddons, { addOnId: "", quantity: 1 }])
          }
        >
          + Add Add-on
        </Button>
      </div>

      {/* Status - only show when editing */}
      {isEditing && (
        <>
          <SectionTitle>Status</SectionTitle>
          <Select
            defaultValue={reservation.status}
            onValueChange={(val) => setValue("status", val as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={createMutation.isPending || updateStatusMutation.isPending}
      >
        {isEditing ? "Update Reservation" : "Create Reservation"}
      </Button>
    </form>
  );
}
