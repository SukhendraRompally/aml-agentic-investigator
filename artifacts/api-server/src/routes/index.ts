import { Router, type IRouter } from "express";
import healthRouter from "./health";
import amlRouter from "./aml";

const router: IRouter = Router();

router.use(healthRouter);
router.use(amlRouter);

export default router;
