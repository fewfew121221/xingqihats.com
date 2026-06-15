import fs from "node:fs/promises";
import path from "node:path";

const action = process.argv[2];
const id = process.env.ID || process.argv[3] || "all";
const queuePath = path.resolve("execution", "queue.json");

if (!["approve", "reject"].includes(action)) {
  throw new Error("用法：node scripts/review-queue.mjs approve|reject [id|all]");
}

const queue = JSON.parse(await fs.readFile(queuePath, "utf8"));
const now = new Date().toISOString();

let changed = 0;
for (const item of queue) {
  if (id !== "all" && item.id !== id) continue;
  if (item.status !== "pending") continue;
  item.review = true;
  item.action = action;
  item.status = action === "approve" ? "approved" : "rejected";
  item.reviewed_at = now;
  item.updated_at = now;
  changed += 1;
}

await fs.writeFile(queuePath, JSON.stringify(queue, null, 2), "utf8");
console.log(`${action} ${changed} queue records`);
