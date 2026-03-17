import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../../api/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-lg border p-4 space-y-1">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-sm text-gray-400">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const [revenuePeriod, setRevenuePeriod] = useState("MONTHLY");
  const [revenueDate, setRevenueDate] = useState(today);
  const [shopPeriod, setShopPeriod] = useState("MONTHLY");
  const [shopDate, setShopDate] = useState(today);
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);

  const { data: revenue } = useQuery({
    queryKey: ["analytics-revenue", revenuePeriod, revenueDate],
    queryFn: () =>
      analyticsApi
        .getRevenue(revenuePeriod, revenueDate)
        .then((res) => res.data.data),
  });

  const { data: roomOccupancy } = useQuery({
    queryKey: ["analytics-room-occupancy", startDate, endDate],
    queryFn: () =>
      analyticsApi
        .getRoomOccupancy(
          new Date(startDate + "T00:00:00.000Z").toISOString(),
          new Date(endDate + "T00:00:00.000Z").toISOString(),
        )
        .then((res) => res.data.data),
    enabled: !!startDate && !!endDate,
  });

  const { data: poolOccupancy } = useQuery({
    queryKey: ["analytics-pool-occupancy", startDate, endDate],
    queryFn: () =>
      analyticsApi
        .getPoolOccupancy(
          new Date(startDate + "T00:00:00.000Z").toISOString(),
          new Date(endDate + "T00:00:00.000Z").toISOString(),
        )
        .then((res) => res.data.data),
    enabled: !!startDate && !!endDate,
  });

  const { data: walkIn } = useQuery({
    queryKey: ["analytics-walkin", startDate, endDate],
    queryFn: () =>
      analyticsApi
        .getWalkInVsReserved(
          new Date(startDate + "T00:00:00.000Z").toISOString(),
          new Date(endDate + "T00:00:00.000Z").toISOString(),
        )
        .then((res) => res.data.data),
    enabled: !!startDate && !!endDate,
  });

  const { data: shopSales } = useQuery({
    queryKey: ["analytics-shop", shopPeriod, shopDate],
    queryFn: () =>
      analyticsApi
        .getShopSales(shopPeriod, shopDate)
        .then((res) => res.data.data),
  });

  const walkInPieData = walkIn
    ? [
        { name: "Walk-in", value: walkIn.walkIns ?? 0 },
        { name: "Reserved", value: walkIn.reserved ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Date Range Filter */}
      <div className="flex gap-4 flex-wrap items-end">
        <div className="space-y-1">
          <Label>Start Date</Label>
          <Input
            type="date"
            className="w-40"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>End Date</Label>
          <Input
            type="date"
            className="w-40"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Walk-in vs Reserved + Room Occupancy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Walk-in vs Reserved */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Walk-in vs Reserved</h2>
          {walkIn ? (
            <div className="space-y-2">
              <div className="flex gap-4 mb-2 flex-wrap">
                <StatCard title="Walk-in" value={walkIn.walkIns ?? 0} />
                <StatCard title="Reserved" value={walkIn.reserved ?? 0} />
                <StatCard title="Total" value={walkIn.total ?? 0} />
              </div>
              {walkInPieData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={walkInPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {walkInPieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">
                  No data for selected period
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Loading...</p>
          )}
        </div>

        {/* Room Occupancy */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Room Occupancy</h2>
          {roomOccupancy ? (
            <div className="space-y-2">
              <div className="flex gap-4 mb-2 flex-wrap">
                <StatCard
                  title="Total Rooms"
                  value={roomOccupancy.totalRooms ?? 0}
                />
                <StatCard
                  title="Occupied"
                  value={roomOccupancy.bookedRooms ?? 0}
                />
                <StatCard
                  title="Rate"
                  value={`${roomOccupancy.occupancyRate ?? 0}%`}
                />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    {
                      name: "Available",
                      value:
                        (roomOccupancy.totalRooms ?? 0) -
                        (roomOccupancy.bookedRooms ?? 0),
                    },
                    { name: "Occupied", value: roomOccupancy.bookedRooms ?? 0 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Loading...</p>
          )}
        </div>
      </div>

      {/* Pool Occupancy */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Pool Occupancy</h2>
        {poolOccupancy ? (
          <>
            <div className="flex gap-4 flex-wrap mb-4">
              <StatCard
                title="Total Slots"
                value={poolOccupancy.totalSlots ?? 0}
              />
              <StatCard
                title="Booked Slots"
                value={poolOccupancy.bookedSlots ?? 0}
              />
              <StatCard
                title="Occupancy Rate"
                value={poolOccupancy.occupancyRate ?? "0%"}
              />
              <StatCard title="Days" value={poolOccupancy.days ?? 0} />
            </div>
            <BarChart
              data={[
                {
                  name: "Total Possible",
                  value: poolOccupancy.totalPossibleSlots ?? 0,
                },
                { name: "Booked", value: poolOccupancy.bookedSlots ?? 0 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">
            No data for selected period
          </p>
        )}
      </div>

      {/* Revenue */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Revenue</h2>
          <div className="flex gap-2">
            <Select value={revenuePeriod} onValueChange={setRevenuePeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-40"
              value={revenueDate}
              onChange={(e) => setRevenueDate(e.target.value)}
            />
          </div>
        </div>
        {revenue ? (
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <StatCard
                title="Total Revenue"
                value={`₱${Number(revenue.totalRevenue ?? 0).toLocaleString()}`}
              />
              <StatCard
                title="Total Reservations"
                value={revenue.totalReservations ?? 0}
              />
            </div>
            {revenue.revenueByType ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { type: "ROOM", revenue: revenue.revenueByType.ROOM },
                    { type: "POOL", revenue: revenue.revenueByType.POOL },
                    { type: "BOTH", revenue: revenue.revenueByType.BOTH },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" name="Revenue (₱)" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                No revenue data for selected period
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Loading...</p>
        )}
      </div>

      {/* Shop Sales */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Shop Sales</h2>
          <div className="flex gap-2">
            <Select value={shopPeriod} onValueChange={setShopPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-40"
              value={shopDate}
              onChange={(e) => setShopDate(e.target.value)}
            />
          </div>
        </div>
        {shopSales ? (
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <StatCard
                title="Total Sales"
                value={`₱${Number(shopSales.totalRevenue ?? 0).toLocaleString()}`}
              />
              <StatCard
                title="Items Sold"
                value={
                  shopSales.salesByItem?.reduce(
                    (sum: number, item: any) => sum + item.totalQuantitySold,
                    0,
                  ) ?? 0
                }
              />
            </div>
            {Array.isArray(shopSales.salesByItem) &&
            shopSales.salesByItem.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={shopSales.salesByItem}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="itemName" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="totalRevenue"
                    name="Revenue (₱)"
                    fill="#f59e0b"
                  />
                  <Bar
                    dataKey="totalQuantitySold"
                    name="Qty Sold"
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                No shop sales data for selected period
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Loading...</p>
        )}
      </div>
    </div>
  );
}
