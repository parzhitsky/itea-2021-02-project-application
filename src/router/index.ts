import { Router } from "express";
import auth from "./auth.middleware";
import rootRouter from "./root/router";
import authRouter from "./auth/router";
import usersRouter from "./users/router";

/** @public */
const router = Router();

router.use("/", rootRouter);
router.use("/auth", authRouter);
router.use("/users", auth(), usersRouter);

export default router;
