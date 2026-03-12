import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inventoryApi,
  type InventoryItem,
  type InventoryMovement,
} from "../../api/inventory";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["SHOP", "MAINTENANCE"]),
  unit: z.string().min(1, "Unit is required"),
  lowStockAlert: z.coerce.number().int().positive(),
  price: z.coerce.number().optional(),
});

const movementSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().optional(),
  reasonType: z
    .enum(["SOLD", "EXPIRED", "DAMAGED", "USED", "ADJUSTMENT"])
    .optional(),
});

type ItemInput = z.infer<typeof itemSchema>;
type MovementInput = z.infer<typeof movementSchema>;

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [itemOpen, setItemOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");

  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory", typeFilter],
    queryFn: () =>
      inventoryApi
        .getAll(typeFilter === "ALL" ? undefined : typeFilter)
        .then((res) => res.data.data),
  });

  const { data: itemMovements } = useQuery({
    queryKey: ["inventory-movements", selectedItem?.id],
    queryFn: () =>
      inventoryApi
        .getItemMovements(selectedItem!.id)
        .then((res) => res.data.data),
    enabled: !!selectedItem && historyOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ItemInput>({ resolver: zodResolver(itemSchema) });

  const {
    register: registerMovement,
    handleSubmit: handleMovementSubmit,
    reset: resetMovement,
    setValue: setMovementValue,
    formState: { errors: movementErrors },
  } = useForm<MovementInput>({ resolver: zodResolver(movementSchema) });

  const createMutation = useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setItemOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setItemOpen(false);
      setSelectedItem(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventory"] }),
  });

  const movementMutation = useMutation({
    mutationFn: (data: any) => inventoryApi.recordMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
      setMovementOpen(false);
      resetMovement();
    },
  });

  const onItemSubmit = (data: ItemInput) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onMovementSubmit = (data: MovementInput) => {
    if (!selectedItem) return;
    movementMutation.mutate({
      ...data,
      itemId: selectedItem.id,
      createdById: user?.id,
    });
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setValue("name", item.name);
    setValue("description", item.description || "");
    setValue("type", item.type);
    setValue("unit", item.unit);
    setValue("lowStockAlert", item.lowStockAlert);
    setValue("price", item.price || 0);
    setItemOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button
          onClick={() => {
            setSelectedItem(null);
            reset();
            setItemOpen(true);
          }}
        >
          Add Item
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="SHOP">Shop</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.price ? `₱${item.price}` : "-"}</TableCell>
                  <TableCell>
                    {item.quantity <= item.lowStockAlert ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge variant="default">OK</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item);
                          setMovementOpen(true);
                        }}
                      >
                        Movement
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item);
                          setHistoryOpen(true);
                        }}
                      >
                        History
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(item.id)}
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

      {/* Add/Edit Item Dialog */}
      <Dialog open={itemOpen} onOpenChange={setItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit Item" : "Add Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onItemSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Item name" />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...register("description")} placeholder="Optional" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  defaultValue={selectedItem?.type}
                  onValueChange={(val) => setValue("type", val as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHOP">Shop</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input {...register("unit")} placeholder="e.g. pcs, kg" />
                {errors.unit && (
                  <p className="text-sm text-red-500">{errors.unit.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Low Stock Alert</Label>
                <Input {...register("lowStockAlert")} type="number" />
                {errors.lowStockAlert && (
                  <p className="text-sm text-red-500">
                    {errors.lowStockAlert.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Price (optional)</Label>
                <Input {...register("price")} type="number" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {selectedItem ? "Update Item" : "Create Item"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Movement Dialog */}
      <Dialog open={movementOpen} onOpenChange={setMovementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Movement — {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleMovementSubmit(onMovementSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                defaultValue="IN"
                onValueChange={(val) => {
                  setMovementType(val as "IN" | "OUT");
                  setMovementValue("type", val as any);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">IN (Restock)</SelectItem>
                  <SelectItem value="OUT">OUT (Use/Sell)</SelectItem>
                </SelectContent>
              </Select>
              {movementErrors.type && (
                <p className="text-sm text-red-500">
                  {movementErrors.type.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input {...registerMovement("quantity")} type="number" />
              {movementErrors.quantity && (
                <p className="text-sm text-red-500">
                  {movementErrors.quantity.message}
                </p>
              )}
            </div>
            {movementType === "OUT" && (
              <div className="space-y-2">
                <Label>Reason Type</Label>
                <Select
                  onValueChange={(val) =>
                    setMovementValue("reasonType", val as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOLD">Sold</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="DAMAGED">Damaged</SelectItem>
                    <SelectItem value="USED">Used</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input
                {...registerMovement("reason")}
                placeholder="Additional notes"
              />
            </div>
            <Button type="submit" className="w-full">
              Record Movement
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Movement History Sheet */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Movement History — {selectedItem?.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemMovements?.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Badge
                        variant={m.type === "IN" ? "default" : "destructive"}
                      >
                        {m.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{m.quantity}</TableCell>
                    <TableCell>{m.reasonType || m.reason || "-"}</TableCell>
                    <TableCell>{m.createdBy?.name}</TableCell>
                    <TableCell>
                      {new Date(m.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
