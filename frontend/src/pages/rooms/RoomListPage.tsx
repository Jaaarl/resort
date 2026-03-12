import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi, type Room } from "../../api/rooms";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const roomSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  capacity: z.coerce.number().int().positive("Capacity must be positive"),
});

type RoomFormInput = z.infer<typeof roomSchema>;

export default function RoomListPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [searchDates, setSearchDates] = useState<{
    checkIn: string;
    checkOut: string;
  } | null>(null);

  const { data: availability } = useQuery({
    queryKey: ["room-availability", searchDates],
    queryFn: () =>
      roomsApi
        .getAvailability(
          new Date(searchDates!.checkIn + "T00:00:00.000Z").toISOString(),
          new Date(searchDates!.checkOut + "T00:00:00.000Z").toISOString(),
        )
        .then((res) => res.data.data),
    enabled: !!searchDates,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomsApi.getAll().then((res) => res.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RoomFormInput>({
    resolver: zodResolver(roomSchema),
  });

  const createMutation = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Room> }) =>
      roomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setOpen(false);
      setSelectedRoom(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: roomsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const onSubmit = (data: RoomFormInput) => {
    if (selectedRoom) {
      updateMutation.mutate({ id: selectedRoom.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setValue("name", room.name);
    setValue("description", room.description || "");
    setValue("price", room.price);
    setValue("capacity", room.capacity);
    setOpen(true);
  };

  const handleAdd = () => {
    setSelectedRoom(null);
    reset();
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Button onClick={handleAdd}>Add Room</Button>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.description || "-"}</TableCell>
                <TableCell>₱{room.price}</TableCell>
                <TableCell>{room.capacity} persons</TableCell>
                <TableCell>
                  <Badge variant={room.isActive ? "default" : "destructive"}>
                    {room.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(room)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(room.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRoom ? "Edit Room" : "Add Room"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Room name" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                {...register("description")}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                {...register("price")}
                type="number"
                placeholder="Price per night"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                {...register("capacity")}
                type="number"
                placeholder="Max persons"
              />
              {errors.capacity && (
                <p className="text-sm text-red-500">
                  {errors.capacity.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              {selectedRoom ? "Update Room" : "Create Room"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      // Add this section below the rooms table
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Check Availability</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="space-y-1">
            <Label>Check-in</Label>
            <Input
              type="date"
              className="w-40"
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Check-out</Label>
            <Input
              type="date"
              className="w-40"
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          <Button
            className="mt-5"
            onClick={() => setSearchDates({ checkIn, checkOut })}
            disabled={!checkIn || !checkOut}
          >
            Check
          </Button>
        </div>

        {availability && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availability.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.capacity} persons</TableCell>
                  <TableCell>₱{room.price}</TableCell>
                  <TableCell>
                    <Badge
                      variant={room.isAvailable ? "default" : "destructive"}
                    >
                      {room.isAvailable ? "Available" : "Booked"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
