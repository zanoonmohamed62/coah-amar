import path from "node:path";
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env.local first (Next.js convention), fallback to .env
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
