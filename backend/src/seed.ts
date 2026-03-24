import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import prisma from "./lib/prisma";

// ── Date helpers (March–April 2026 only) ──────────────────
const MAR_START = new Date("2026-03-01");
const APR_END = new Date("2026-04-30");

function randDate(from = MAR_START, to = APR_END): Date {
  return faker.date.between({ from, to });
}

async function main() {
  // ── Cleanup (safe re-run) ──────────────────────────────
  console.log("🧹 Cleaning database...");
  await prisma.payment.deleteMany();
  await prisma.reservationAddOn.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.reservationPoolSlot.deleteMany();
  await prisma.reservationRoom.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.maintenanceTask.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.addOn.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.poolSlotDisabled.deleteMany();
  await prisma.poolSlot.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Database cleared\n");

  console.log("🌱 Seeding database...");

  // ── Users ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@resort.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: "Juan dela Cruz",
      email: "staff1@resort.com",
      password: hashedPassword,
      role: "STAFF",
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "staff2@resort.com",
      password: hashedPassword,
      role: "STAFF",
    },
  });

  console.log("✅ Users created");

  // ── Rooms ──────────────────────────────────────────────
  const roomData = [
    {
      name: "Deluxe Room",
      description: "Spacious room with garden view",
      price: 2500,
      capacity: 2,
    },
    {
      name: "Suite Room",
      description: "Premium suite with sea view",
      price: 5000,
      capacity: 4,
    },
    {
      name: "Family Room",
      description: "Large room for families",
      price: 3500,
      capacity: 6,
    },
    {
      name: "Double Deck",
      description: "Fun bunk bed room",
      price: 2000,
      capacity: 4,
    },
    {
      name: "Cottage",
      description: "Private cottage near the pool",
      price: 4000,
      capacity: 8,
    },
  ];

  const rooms = await Promise.all(
    roomData.map((r) => prisma.room.create({ data: r })),
  );

  console.log("✅ Rooms created");

  // ── Pool Slots ─────────────────────────────────────────
  const morning = await prisma.poolSlot.create({
    data: {
      label: "MORNING",
      startTime: "06:00",
      endTime: "12:00",
      capacity: 50,
      price: 200,
    },
  });

  const afternoon = await prisma.poolSlot.create({
    data: {
      label: "AFTERNOON",
      startTime: "13:00",
      endTime: "18:00",
      capacity: 50,
      price: 200,
    },
  });

  console.log("✅ Pool slots created");

  // ── Add-ons ────────────────────────────────────────────
  const addons = await Promise.all([
    prisma.addOn.create({
      data: { name: "Karaoke", price: 500, quantity: 3, unit: "set" },
    }),
    prisma.addOn.create({
      data: { name: "BBQ Package", price: 1000, quantity: 5, unit: "set" },
    }),
    prisma.addOn.create({
      data: { name: "Extra Towel", price: 50, quantity: 20, unit: "pcs" },
    }),
    prisma.addOn.create({
      data: { name: "Welcome Drink", price: 150, quantity: 30, unit: "pcs" },
    }),
    prisma.addOn.create({
      data: { name: "Breakfast", price: 300, quantity: 10, unit: "pax" },
    }),
  ]);

  console.log("✅ Add-ons created");

  // ── Inventory ──────────────────────────────────────────
  const inventoryData = [
    {
      name: "Shampoo",
      type: "SHOP" as const,
      quantity: 300,
      unit: "pcs",
      lowStockAlert: 30,
      price: 35,
    },
    {
      name: "Soap",
      type: "SHOP" as const,
      quantity: 400,
      unit: "pcs",
      lowStockAlert: 50,
      price: 25,
    },
    {
      name: "Bottled Water",
      type: "SHOP" as const,
      quantity: 600,
      unit: "pcs",
      lowStockAlert: 100,
      price: 20,
    },
    {
      name: "Snacks",
      type: "SHOP" as const,
      quantity: 350,
      unit: "pcs",
      lowStockAlert: 40,
      price: 30,
    },
    {
      name: "Chlorine",
      type: "MAINTENANCE" as const,
      quantity: 80,
      unit: "kg",
      lowStockAlert: 10,
      price: 150,
    },
    {
      name: "Broom",
      type: "MAINTENANCE" as const,
      quantity: 20,
      unit: "pcs",
      lowStockAlert: 3,
      price: 80,
    },
    {
      name: "Mop",
      type: "MAINTENANCE" as const,
      quantity: 15,
      unit: "pcs",
      lowStockAlert: 3,
      price: 120,
    },
    {
      name: "Trash Bags",
      type: "MAINTENANCE" as const,
      quantity: 300,
      unit: "pcs",
      lowStockAlert: 40,
      price: 5,
    },
  ];

  const inventoryItems = await Promise.all(
    inventoryData.map((item) => prisma.inventoryItem.create({ data: item })),
  );

  console.log("✅ Inventory created");

  // ── Maintenance Tasks ──────────────────────────────────
  const taskData: {
    title: string;
    description: string;
    frequency: "DAILY" | "MONTHLY" | "ONCE";
  }[] = [
    {
      title: "Clean Pool",
      description: "Scrub and clean the pool area",
      frequency: "DAILY",
    },
    {
      title: "Check Chlorine Level",
      description: "Ensure proper chlorine balance",
      frequency: "DAILY",
    },
    {
      title: "Inspect Fire Extinguishers",
      description: "Monthly safety check",
      frequency: "MONTHLY",
    },
    {
      title: "Clean Rooms",
      description: "Deep clean all rooms",
      frequency: "DAILY",
    },
    {
      title: "Check Electrical",
      description: "Inspect electrical panels",
      frequency: "MONTHLY",
    },
    {
      title: "Replenish Towels",
      description: "Refill towel stock in rooms",
      frequency: "DAILY",
    },
    {
      title: "Sanitize Restrooms",
      description: "Full restroom cleaning and sanitizing",
      frequency: "DAILY",
    },
    {
      title: "Inspect Pool Pumps",
      description: "Check pump pressure and performance",
      frequency: "ONCE",
    },
  ];

  for (const task of taskData) {
    await prisma.maintenanceTask.create({
      data: {
        ...task,
        dueDate: randDate(),
        assignedToId: faker.helpers.arrayElement([staff1.id, staff2.id]),
        createdById: admin.id,
        status: faker.helpers.arrayElement([
          "PENDING",
          "IN_PROGRESS",
          "COMPLETED",
        ] as const),
      },
    });
  }

  console.log("✅ Maintenance tasks created");

  // ── Reservations (50, all Mar–Apr 2026) ───────────────
  // Track used poolSlot+date combos to respect the @@unique([poolSlotId, poolDate]) constraint
  const usedPoolSlotDates = new Set<string>();

  const statuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;
  const types = ["ROOM", "POOL", "BOTH"] as const;
  const methods = ["CASH", "GCASH", "BANK_TRANSFER", "CREDIT_CARD"];

  for (let i = 0; i < 50; i++) {
    const type = faker.helpers.arrayElement(types);
    const status = faker.helpers.arrayElement(statuses);

    const checkIn = randDate();
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + faker.number.int({ min: 1, max: 4 }));

    // Find a unique poolSlot + date combo
    let poolSlotId: string | null = null;
    let poolDate: Date | null = null;

    if (type === "POOL" || type === "BOTH") {
      for (let attempt = 0; attempt < 30; attempt++) {
        const candidateSlot = faker.helpers.arrayElement([
          morning.id,
          afternoon.id,
        ]);
        const candidateDate = randDate();
        const key = `${candidateSlot}_${candidateDate.toISOString().split("T")[0]}`;
        if (!usedPoolSlotDates.has(key)) {
          usedPoolSlotDates.add(key);
          poolSlotId = candidateSlot;
          poolDate = candidateDate;
          break;
        }
      }
    }

    const totalAmount = faker.number.int({ min: 1000, max: 15000 });

    const reservation = await prisma.reservation.create({
      data: {
        customerName: faker.person.fullName(),
        customerPhone: `09${faker.string.numeric(9)}`,
        customerEmail: faker.internet.email(),
        customerLocation: faker.location.city(),
        type,
        status,
        totalPerson: faker.number.int({ min: 1, max: 8 }),
        totalAmount,
        isWalkIn: faker.datatype.boolean(),
        createdAt: randDate(),
        rooms:
          type === "ROOM" || type === "BOTH"
            ? {
                create: [
                  {
                    roomId: faker.helpers.arrayElement(rooms).id,
                    checkIn,
                    checkOut,
                  },
                ],
              }
            : undefined,
        poolSlots:
          (type === "POOL" || type === "BOTH") && poolSlotId && poolDate
            ? {
                create: [{ poolSlotId, poolDate }],
              }
            : undefined,
      },
    });

    // Add-ons (50% chance, 1–2 per reservation)
    if (faker.datatype.boolean()) {
      const selectedAddons = faker.helpers.arrayElements(
        addons,
        faker.number.int({ min: 1, max: 2 }),
      );
      for (const addon of selectedAddons) {
        await prisma.reservationAddOn.create({
          data: {
            reservationId: reservation.id,
            addOnId: addon.id,
            quantity: faker.number.int({ min: 1, max: 3 }),
            price: addon.price,
          },
        });
      }
    }

    // Payment for CONFIRMED or COMPLETED only
    if (status === "CONFIRMED" || status === "COMPLETED") {
      await prisma.payment.create({
        data: {
          reservationId: reservation.id,
          amount: totalAmount,
          method: faker.helpers.arrayElement(methods),
          paidAt: randDate(),
        },
      });
    }
  }

  console.log("✅ Reservations created (50)");

  // ── Feedback (30 entries) ──────────────────────────────
  for (let i = 0; i < 30; i++) {
    await prisma.feedback.create({
      data: {
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.75,
        }),
        isAnonymous: faker.datatype.boolean(),
        customerName: faker.helpers.maybe(() => faker.person.fullName(), {
          probability: 0.65,
        }),
        customerEmail: faker.helpers.maybe(() => faker.internet.email(), {
          probability: 0.55,
        }),
        customerPhone: faker.helpers.maybe(
          () => `09${faker.string.numeric(9)}`,
          { probability: 0.45 },
        ),
        createdAt: randDate(),
      },
    });
  }

  console.log("✅ Feedback created (30)");

  // ── Inventory Movements ────────────────────────────────
  for (const item of inventoryItems) {
    if (item.type === "SHOP") {
      // 15–25 sales per shop item
      const salesCount = faker.number.int({ min: 15, max: 25 });
      for (let s = 0; s < salesCount; s++) {
        await prisma.inventoryMovement.create({
          data: {
            itemId: item.id,
            type: "OUT",
            quantity: faker.number.int({ min: 1, max: 10 }),
            reasonType: "SOLD",
            reason: faker.helpers.arrayElement([
              "Sold to guest",
              "Walk-in purchase",
              "Add-on purchase",
              "Counter sale",
            ]),
            createdById: faker.helpers.arrayElement([
              admin.id,
              staff1.id,
              staff2.id,
            ]),
            createdAt: randDate(),
          },
        });
      }

      // 2–3 restocks per shop item
      for (let r = 0; r < faker.number.int({ min: 2, max: 3 }); r++) {
        await prisma.inventoryMovement.create({
          data: {
            itemId: item.id,
            type: "IN",
            quantity: faker.number.int({ min: 30, max: 80 }),
            reasonType: "ADJUSTMENT",
            reason: "Supplier delivery / restock",
            createdById: admin.id,
            createdAt: randDate(),
          },
        });
      }

      // occasional damaged / expired
      if (faker.datatype.boolean()) {
        await prisma.inventoryMovement.create({
          data: {
            itemId: item.id,
            type: "OUT",
            quantity: faker.number.int({ min: 1, max: 5 }),
            reasonType: faker.helpers.arrayElement([
              "DAMAGED",
              "EXPIRED",
            ] as const),
            reason: "Removed from stock",
            createdById: admin.id,
            createdAt: randDate(),
          },
        });
      }
    }

    if (item.type === "MAINTENANCE") {
      // 5–10 usage movements per maintenance item
      for (let u = 0; u < faker.number.int({ min: 5, max: 10 }); u++) {
        await prisma.inventoryMovement.create({
          data: {
            itemId: item.id,
            type: "OUT",
            quantity: faker.number.int({ min: 1, max: 3 }),
            reasonType: "USED",
            reason: faker.helpers.arrayElement([
              "Used for maintenance",
              "Pool cleaning",
              "Room servicing",
              "General upkeep",
            ]),
            createdById: faker.helpers.arrayElement([staff1.id, staff2.id]),
            createdAt: randDate(),
          },
        });
      }

      // 1–2 restocks per maintenance item
      for (let r = 0; r < faker.number.int({ min: 1, max: 2 }); r++) {
        await prisma.inventoryMovement.create({
          data: {
            itemId: item.id,
            type: "IN",
            quantity: faker.number.int({ min: 10, max: 30 }),
            reasonType: "ADJUSTMENT",
            reason: "Supplier delivery / restock",
            createdById: admin.id,
            createdAt: randDate(),
          },
        });
      }
    }
  }

  console.log("✅ Inventory movements created (high volume)");

  // ── Maintenance Logs ───────────────────────────────────
  const logTypes = ["DAILY", "MONTHLY", "DRAIN"] as const;
  for (let i = 0; i < 15; i++) {
    await prisma.maintenanceLog.create({
      data: {
        type: faker.helpers.arrayElement(logTypes),
        description: faker.lorem.sentence(),
        performedBy: faker.helpers.arrayElement([staff1.name, staff2.name]),
        createdAt: randDate(),
      },
    });
  }

  console.log("✅ Maintenance logs created");

  console.log("\n🌱 Seeding complete!");
  console.log("─────────────────────────────");
  console.log("Admin:  admin@resort.com / password123");
  console.log("Staff1: staff1@resort.com / password123");
  console.log("Staff2: staff2@resort.com / password123");
  console.log("─────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
