import { Request, Response } from "express";
import Product from "../models/Product";
import mongoose from "mongoose";

export async function getAllProducts(_req: Request, res: Response) {
  try {
  const products = await Product.find();
  res.status(200).json(products);
  } catch(err) {
    res.status(500).json({ error: "Failed to fetch products", err});
  }
}

export async function getProductById(req: Request, res: Response) {
  
  const { id } = req.params;

  if(!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Not valid objectId"});

  try {
    const product = await Product.findById(id);

    if(!product) return res.status(404).json({ error: "Id no valid" });

    return res.status(200).json(product);

  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch product", err});
  }
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
