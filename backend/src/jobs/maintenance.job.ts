import cron from "node-cron";
import prisma from "../lib/prisma";

export const startMaintenanceJob = () => {
  // runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily maintenance task reset...");

    try {
      // find all completed DAILY tasks
      const completedDailyTasks = await prisma.maintenanceTask.findMany({
        where: {
          frequency: "DAILY",
          status: "COMPLETED",
        },
      });

      if (completedDailyTasks.length === 0) {
        console.log("No daily tasks to reset.");
        return;
      }

      // reset them to PENDING and update dueDate to today
      await prisma.maintenanceTask.updateMany({
        where: {
          frequency: "DAILY",
          status: "COMPLETED",
        },
        data: {
          status: "PENDING",
          completedAt: null,
          remarks: null,
          dueDate: new Date(),
        },
      });

      console.log(
        `Reset ${completedDailyTasks.length} daily tasks to PENDING.`,
      );
    } catch (error) {
      console.error("Error resetting daily tasks:", error);
    }
  });

  console.log("Maintenance job scheduled.");
};
