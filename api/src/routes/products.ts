import { Router } from "express";
import { getAll } from "../controllers/productsController";

const router = Router();

router.get("/", getAll);

export default router;