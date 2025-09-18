import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProductById,
  updateProductById,
  getTotalStockValue,
  getTotalStockValueByManufacturer,
  getLowStockProducts,
  getCriticalStockProducts,
} from "../controllers/productController";

const router: Router = Router();

router.post("/products", createProduct);

router.get("/products", getAllProducts);

router.get("/products/totalStockValue", getTotalStockValue);

router.get(
  "/products/totalStockValueByManufacturer",
  getTotalStockValueByManufacturer
);

router.get("/products/low-stock", getLowStockProducts);

router.get("/products/critical-stock", getCriticalStockProducts);

router.get("/products/:id", getProductById);

router.put("/products/:id", updateProductById);

router.delete("/products/:id", deleteProductById);

export default router;
