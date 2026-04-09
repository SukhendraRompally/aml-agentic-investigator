import { Router, type IRouter } from "express";
import healthRouter from "./health";
import amlRouter from "./aml";
import pipelineProxyRouter from "./pipeline-proxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(amlRouter);
router.use(pipelineProxyRouter);

export default router;
