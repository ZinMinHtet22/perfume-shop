import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { generateProductImages } from "../prisma/image-gen";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const overwrite = process.env.OVERWRITE === "1";
  const { written, updated, skipped } = await generateProductImages(prisma, { overwrite });
  console.log(
    `images written: ${written}, skipped existing: ${skipped}, db rows updated: ${updated}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
