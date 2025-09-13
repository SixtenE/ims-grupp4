import { Request, Router, Response } from "express";
import { getAllManufacturers } from "../controllers/manufacturerController";

const router: Router = Router();

router.get("/manufacturers", getAllManufacturers);

export default router;
