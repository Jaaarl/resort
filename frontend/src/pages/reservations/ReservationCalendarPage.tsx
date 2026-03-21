import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery } from "@tanstack/react-query";
import { reservationsApi, type Reservation } from "../../api/reservations";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#22c55e",
  CANCELLED: "#ef4444",
  COMPLETED: "#6366f1",
};

const legendItems = [
  {
    status: "PENDING",
    color: statusColors.PENDING,
    desc: "Awaiting confirmation",
  },
  {
    status: "CONFIRMED",
    color: statusColors.CONFIRMED,
    desc: "Confirmed booking",
  },
  { status: "CANCELLED", color: statusColors.CANCELLED, desc: "Cancelled" },
  { status: "COMPLETED", color: statusColors.COMPLETED, desc: "Checked out" },
];

export default function ReservationCalendarPage() {
  const [selectedReservations, setSelectedReservations] = useState<
    Reservation[]
  >([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleStatuses, setVisibleStatuses] = useState<string[]>([
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
  ]);

  const [visibleTypes, setVisibleTypes] = useState<string[]>([
    "ROOM",
    "POOL",
    "BOTH",
  ]);

  const toggleType = (type: string) => {
    setVisibleTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const { data: reservations } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => reservationsApi.getAll().then((res) => res.data.data),
  });

  const toggleStatus = (status: string) => {
    setVisibleStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const events =
    reservations?.flatMap((r) => {
      const eventsArr: any[] = [];

      if (r.rooms?.length > 0) {
        r.rooms.forEach((room) => {
          eventsArr.push({
            id: `${r.id}-room-${room.roomId}`,
            title: `${r.customerName} — ${room.room.name}`,
            start: room.checkIn,
            end: room.checkOut,
            backgroundColor: statusColors[r.status],
            borderColor: statusColors[r.status],
            extendedProps: { reservation: r },
          });
        });
      }

      if (r.poolSlots?.length > 0) {
        r.poolSlots.forEach((slot) => {
          eventsArr.push({
            id: `${r.id}-pool-${slot.poolSlotId}`,
            title: `${r.customerName} — ${slot.poolSlot.label}`,
            start: slot.poolDate,
            backgroundColor: statusColors[r.status],
            borderColor: statusColors[r.status],
            extendedProps: { reservation: r },
          });
        });
      }

      return eventsArr;
    }) || [];

  const filteredEvents = events.filter(
    (e) =>
      visibleStatuses.includes(e.extendedProps.reservation.status) &&
      visibleTypes.includes(e.extendedProps.reservation.type),
  );

  const handleDateClick = (info: any) => {
    const date = info.dateStr;
    const dayReservations =
      reservations?.filter((r) => {
        const hasRoom = r.rooms?.some((room) => {
          const checkIn = new Date(room.checkIn).toISOString().split("T")[0];
          const checkOut = new Date(room.checkOut).toISOString().split("T")[0];
          return date >= checkIn && date <= checkOut;
        });
        const hasPool = r.poolSlots?.some(
          (slot) =>
            new Date(slot.poolDate).toISOString().split("T")[0] === date,
        );
        return hasRoom || hasPool;
      }) || [];

    setSelectedDate(date);
    setSelectedReservations(dayReservations);
    setDialogOpen(true);
  };

  const handleEventClick = (info: any) => {
    const reservation = info.event.extendedProps.reservation;
    setSelectedReservations([reservation]);
    setSelectedDate(info.event.startStr.split("T")[0]);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reservation Calendar</h1>

      {/* Filter Legend */}
      <div className="bg-white border rounded-lg p-4 flex gap-6 flex-wrap items-center">
        <p className="text-sm font-semibold text-gray-600">Filter by status:</p>
        {legendItems.map(({ status, color, desc }) => (
          <label
            key={status}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={visibleStatuses.includes(status)}
              onChange={() => toggleStatus(status)}
              className="w-4 h-4 rounded"
              style={{ accentColor: color }}
            />
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color }}
            />
            <div>
              <p className="text-sm font-medium leading-none">{status}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4 flex gap-6 flex-wrap items-center">
        <p className="text-sm font-semibold text-gray-600">Filter by type:</p>
        {[
          { type: "ROOM", desc: "Room booking" },
          { type: "POOL", desc: "Pool booking" },
          { type: "BOTH", desc: "Room & Pool" },
        ].map(({ type, desc }) => (
          <label
            key={type}
            className="flex items-center cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={visibleTypes.includes(type)}
              onChange={() => toggleType(type)}
              className="w-4 h-4 rounded"
            />
            <div className="w-4 h-4 rounded" />
            <div>
              <p className="text-sm font-medium leading-none">{type}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={filteredEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          height="auto"
        />
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Reservations on{" "}
              {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedReservations.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No reservations on this date.
              </p>
            ) : (
              selectedReservations.map((r) => (
                <div key={r.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{r.customerName}</p>
                      <p className="text-sm text-gray-500">{r.customerPhone}</p>
                    </div>
                    <Badge
                      style={{
                        backgroundColor: statusColors[r.status],
                        color: "white",
                      }}
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Type: {r.type}</p>
                    <p>Persons: {r.totalPerson}</p>
                    <p>Amount: ₱{r.totalAmount}</p>
                    {r.rooms?.length > 0 && (
                      <p>
                        Rooms:{" "}
                        {r.rooms.map((room) => room.room.name).join(", ")}
                      </p>
                    )}
                    {r.poolSlots?.length > 0 && (
                      <p>
                        Pool:{" "}
                        {r.poolSlots
                          .map((slot) => slot.poolSlot.label)
                          .join(", ")}
                      </p>
                    )}
                    {r.addOns?.length > 0 && (
                      <p>
                        Add-ons:{" "}
                        {r.addOns
                          .map((a) => `${a.addOn.name} x${a.quantity}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
