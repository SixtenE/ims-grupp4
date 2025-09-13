import { Request, Router, Response } from "express";
import {
  getAllProducts,
  getProductById,
} from "../controllers/productController";

const router: Router = Router();

router.get("/products", getAllProducts);

router.get("/products/:id", getProductById);

export default router;
