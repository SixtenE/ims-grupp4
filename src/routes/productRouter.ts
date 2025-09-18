import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
} from "../controllers/productController";

const router: Router = Router();

router.get("/products", getAllProducts);

router.get("/products/:id", getProductById);

router.post("/products", createProduct);

export default router;
