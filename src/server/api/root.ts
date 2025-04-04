import { createTRPCRouter } from "./trpc";
import { problemReportRouter } from "./routers/problemReport";

export const appRouter = createTRPCRouter({
  problemReport: problemReportRouter,
});

export type AppRouter = typeof appRouter; 