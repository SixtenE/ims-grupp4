import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  addProduct,
  deleteProductById,
  updateProductById,
  getTotalStockValue,
  getTotalStockValueByManufacturer,
  getLowStockProducts,
  getCriticalStockProducts,
} from "../controllers/productController.js";

const router: Router = Router();

router.post("/products", addProduct);

router.get("/products", getAllProducts);

router.get("/products/total-stock-value", getTotalStockValue);

router.get(
  "/products/total-stock-value-by-manufacturer",
  getTotalStockValueByManufacturer
);

router.get("/products/low-stock", getLowStockProducts);

router.get("/products/critical-stock", getCriticalStockProducts);

router.get("/products/:id", getProductById);

router.put("/products/:id", updateProductById);

router.delete("/products/:id", deleteProductById);

export default router;
