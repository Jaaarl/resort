import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addonsApi, type AddOn } from "../../api/addons";
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
import { toast } from "sonner";

const addonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  unit: z.string().optional(),
});

type AddOnInput = z.infer<typeof addonSchema>;

export default function AddOnsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<AddOn | null>(null);
  const [searchDate, setSearchDate] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");

  const { data: addons, isLoading } = useQuery({
    queryKey: ["addons"],
    queryFn: () => addonsApi.getAll().then((res) => res.data.data),
  });

  const { data: availability } = useQuery({
    queryKey: ["addon-availability", availabilityDate],
    queryFn: async () => {
      if (!addons) return [];
      const results = await Promise.all(
        addons.map(async (addon) => {
          const res = await addonsApi.getAvailability(
            addon.id,
            new Date(availabilityDate + "T00:00:00.000Z").toISOString(),
          );
          return { ...addon, available: res.data.data.available };
        }),
      );
      return results;
    },
    enabled: !!availabilityDate && !!addons,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddOnInput>({ resolver: zodResolver(addonSchema) });

  const createMutation = useMutation({
    mutationFn: addonsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      setOpen(false);
      reset();
      toast.success("Add-on created");
    },
    onError: () => toast.error("Failed to create add-on"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      addonsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      setOpen(false);
      setSelectedAddon(null);
      reset();
      toast.success("Add-on updated");
    },
    onError: () => toast.error("Failed to update add-on"),
  });

  const deleteMutation = useMutation({
    mutationFn: addonsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      toast.success("Add-on deleted");
    },
    onError: () => toast.error("Failed to delete add-on"),
  });

  const onSubmit = (data: AddOnInput) => {
    if (selectedAddon) {
      updateMutation.mutate({ id: selectedAddon.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (addon: AddOn) => {
    setSelectedAddon(addon);
    setValue("name", addon.name);
    setValue("price", addon.price);
    setValue("quantity", addon.quantity);
    setValue("unit", addon.unit || "");
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add-ons</h1>
        <Button
          onClick={() => {
            setSelectedAddon(null);
            reset();
            setOpen(true);
          }}
        >
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons?.map((addon) => (
              <TableRow key={addon.id}>
                <TableCell className="font-medium">{addon.name}</TableCell>
                <TableCell>₱{addon.price}</TableCell>
                <TableCell>{addon.quantity}</TableCell>
                <TableCell>{addon.unit || "-"}</TableCell>
                <TableCell>
                  <Badge variant={addon.isActive ? "default" : "destructive"}>
                    {addon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(addon)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(addon.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Availability Checker */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Check Availability by Date</h2>
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            className="w-48"
            onChange={(e) => setSearchDate(e.target.value)}
          />
          <Button
            onClick={() => setAvailabilityDate(searchDate)}
            disabled={!searchDate}
          >
            Check
          </Button>
        </div>
        {availability && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availability.map((addon) => (
                <TableRow key={addon.id}>
                  <TableCell>{addon.name}</TableCell>
                  <TableCell>₱{addon.price}</TableCell>
                  <TableCell>{addon.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      variant={addon.available > 0 ? "default" : "destructive"}
                    >
                      {addon.available > 0
                        ? `${addon.available} left`
                        : "Fully Booked"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAddon ? "Edit Add-on" : "Add Add-on"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Add-on name" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input {...register("price")} type="number" />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Total Quantity</Label>
                <Input {...register("quantity")} type="number" />
                {errors.quantity && (
                  <p className="text-sm text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unit (optional)</Label>
              <Input {...register("unit")} placeholder="e.g. pcs, set" />
            </div>
            <Button type="submit" className="w-full">
              {selectedAddon ? "Update Add-on" : "Create Add-on"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
