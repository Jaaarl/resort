import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL!,
  ssl: true
});

const prisma = new PrismaClient({ adapter });

export default prisma;