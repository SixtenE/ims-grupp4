import { Request, Response } from "express";

export async function getAllProducts(_req: Request, res: Response) {
  res.status(200).json({ message: "getAllProducts" });
}

export async function getProductById(req: Request, res: Response) {
  const { id } = req.params;
  res.status(200).json({ message: `getProductById: ${id}` });
}

export async function createProduct(req: Request, res: Response) {
  const productData = req.body;
  res.status(201).json({ message: "createProduct", data: productData });
}

export async function updateProductById(req: Request, res: Response) {
  const { id } = req.params;
  const updatedData = req.body;
  res
    .status(200)
    .json({ message: `updateProductById: ${id}`, data: updatedData });
}

export async function deleteProductById(req: Request, res: Response) {
  const { id } = req.params;
  res.status(200).json({ message: `deleteProductById: ${id}` });
}

export async function getTotalStockValue(_req: Request, res: Response) {
  res.status(200).json({ message: "getTotalStockValue" });
}

export async function getTotalStockValueByManufacturer(
  req: Request,
  res: Response
) {
  const { manufacturer } = req.params;
  res
    .status(200)
    .json({ message: `getTotalStockValueByManufacturer: ${manufacturer}` });
}

export async function getLowStockProducts(_req: Request, res: Response) {
  res.status(200).json({ message: "getLowStockProducts" });
}

export async function getCriticalStockProducts(_req: Request, res: Response) {
  res.status(200).json({ message: "getCriticalStockProducts" });
}
