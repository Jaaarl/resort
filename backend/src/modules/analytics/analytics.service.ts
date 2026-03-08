import prisma from "../../lib/prisma";

export const getRoomOccupancyRate = async (
  startDate: string,
  endDate: string,
) => {
  const totalRooms = await prisma.room.count({
    where: { isActive: true },
  });

  const bookedRooms = await prisma.reservationRoom.count({
    where: {
      reservation: { status: { notIn: ["CANCELLED"] } },
      checkIn: { gte: new Date(startDate) },
      checkOut: { lte: new Date(endDate) },
    },
  });

  const occupancyRate = totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0;

  return {
    totalRooms,
    bookedRooms,
    occupancyRate: `${occupancyRate.toFixed(2)}%`,
    period: { startDate, endDate },
  };
};

export const getPoolOccupancyRate = async (
  startDate: string,
  endDate: string,
) => {
  const totalSlots = await prisma.poolSlot.count();

  // count unique dates in range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const totalPossibleSlots = totalSlots * days;

  const bookedSlots = await prisma.reservationPoolSlot.count({
    where: {
      reservation: { status: { notIn: ["CANCELLED"] } },
      poolDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  const occupancyRate =
    totalPossibleSlots > 0 ? (bookedSlots / totalPossibleSlots) * 100 : 0;

  return {
    totalSlots,
    days,
    totalPossibleSlots,
    bookedSlots,
    occupancyRate: `${occupancyRate.toFixed(2)}%`,
    period: { startDate, endDate },
  };
};

export const getRevenueReport = async (
  period: "DAILY" | "WEEKLY" | "MONTHLY",
  date: string,
) => {
  let startDate: Date;
  let endDate: Date;

  const baseDate = new Date(date);

  if (period === "DAILY") {
    startDate = new Date(baseDate.setHours(0, 0, 0, 0));
    endDate = new Date(baseDate.setHours(23, 59, 59, 999));
  } else if (period === "WEEKLY") {
    const day = baseDate.getDay();
    startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() - day);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else {
    startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      status: { notIn: ["CANCELLED"] },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      totalAmount: true,
      type: true,
      createdAt: true,
    },
  });

  const totalRevenue = reservations.reduce(
    (sum, r) => sum + Number(r.totalAmount),
    0,
  );

  const revenueByType = {
    ROOM: reservations
      .filter((r) => r.type === "ROOM")
      .reduce((sum, r) => sum + Number(r.totalAmount), 0),
    POOL: reservations
      .filter((r) => r.type === "POOL")
      .reduce((sum, r) => sum + Number(r.totalAmount), 0),
    BOTH: reservations
      .filter((r) => r.type === "BOTH")
      .reduce((sum, r) => sum + Number(r.totalAmount), 0),
  };

  return {
    period,
    startDate,
    endDate,
    totalRevenue,
    revenueByType,
    totalReservations: reservations.length,
  };
};

export const getWalkInVsReservedRatio = async (
  startDate: string,
  endDate: string,
) => {
  const total = await prisma.reservation.count({
    where: {
      status: { notIn: ["CANCELLED"] },
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  const walkIns = await prisma.reservation.count({
    where: {
      status: { notIn: ["CANCELLED"] },
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      userId: null, // walk-ins have no staff user assigned
    },
  });

  const reserved = total - walkIns;

  return {
    total,
    walkIns,
    reserved,
    walkInPercentage:
      total > 0 ? `${((walkIns / total) * 100).toFixed(2)}%` : "0%",
    reservedPercentage:
      total > 0 ? `${((reserved / total) * 100).toFixed(2)}%` : "0%",
    period: { startDate, endDate },
  };
};
