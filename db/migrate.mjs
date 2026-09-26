// Applies schema.sql then seed.sql against DATABASE_URL.
// Usage: DATABASE_URL=postgres://... npm run db:migrate
//        npm run db:migrate -- --seed=false   (schema only)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";

const dir = path.dirname(fileURLToPath(import.meta.url));
const withSeed = !process.argv.includes("--seed=false");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();

  const schema = readFileSync(path.join(dir, "schema.sql"), "utf8");
  console.log("Applying schema.sql...");
  await client.query(schema);

  if (withSeed) {
    const seed = readFileSync(path.join(dir, "seed.sql"), "utf8");
    console.log("Applying seed.sql...");
    await client.query(seed);
  }

  console.log("Done.");
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
