import { router } from "../trpc";
import { estateRouter } from "./estate";
import { userRouter } from "./user";
import { importRouter } from "./import";

export const appRouter = router({
  estate: estateRouter,
  user: userRouter,
  import: importRouter,
});

export type AppRouter = typeof appRouter;
