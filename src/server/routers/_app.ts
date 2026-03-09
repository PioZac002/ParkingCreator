import { router } from "../trpc";
import { estateRouter } from "./estate";
import { userRouter } from "./user";
import { importRouter } from "./import";
import { layoutRouter } from "./layout";

export const appRouter = router({
  estate: estateRouter,
  user: userRouter,
  import: importRouter,
  layout: layoutRouter,
});

export type AppRouter = typeof appRouter;
