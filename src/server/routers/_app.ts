import { router } from "../trpc";
import { estateRouter } from "./estate";
import { userRouter } from "./user";
import { importRouter } from "./import";
import { layoutRouter } from "./layout";
import { availabilityRouter } from "./availability";
import { reservationRouter } from "./reservation";

export const appRouter = router({
  estate: estateRouter,
  user: userRouter,
  import: importRouter,
  layout: layoutRouter,
  availability: availabilityRouter,
  reservation: reservationRouter,
});

export type AppRouter = typeof appRouter;
