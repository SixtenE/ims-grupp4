import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProductById,
  updateProductById,
  getTotalStockValue,
  getTotalStockValueByManufacturer,
} from "../controllers/productController";

const router: Router = Router();

router.get("/products", getAllProducts);

router.get("/products/totalStockValueByManufacturer", getTotalStockValueByManufacturer)

router.get("/products/:id", getProductById);

router.post("/products", createProduct);

router.put("/products/:id", updateProductById);

router.delete("/products/:id", deleteProductById);

router.get("/products/totalStockValue", getTotalStockValue);

export default router;
