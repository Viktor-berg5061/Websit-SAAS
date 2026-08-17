import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "radera checkout-personuppgifter efter retentionstiden",
  { hourUTC: 2, minuteUTC: 15 },
  internal.retention.purgeExpiredOrders,
  {},
);

export default crons;
