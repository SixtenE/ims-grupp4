import { Router } from "express";
import { getAllManufacturers } from "../controllers/manufacturerController.js";

const router: Router = Router();

router.get("/manufacturers", getAllManufacturers);

export default router;
