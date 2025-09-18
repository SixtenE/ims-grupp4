import { Request, Response } from "express";
import Product from "../models/Product";
import mongoose from "mongoose";

export async function getAllProducts(_req: Request, res: Response) {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products", err });
  }
}

export async function getProductById(req: Request, res: Response) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "Not valid objectId" });

  try {
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ error: "Id no valid" });

    return res.status(200).json(product);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch product", err });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: "Sku already exist" });
      return;
    }
    res.status(500).json({ error: "Failed to create product", err });
  }
}

export async function updateProductById(req: Request, res: Response) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Not valid objectId" });
  }

  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to update product", err: error });
  }
}

export async function deleteProductById(req: Request, res: Response) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Not valid objectId" });
  }

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res
      .status(200)
      .json({ message: "Product deleted successfully", product });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to delete product", err: error });
  }
}

export async function getTotalStockValue(_req: Request, res: Response) {
    try {
      const pipeline = [
        {
          $project: {
            totalValue: { $multiply: ["$price", "$amountInStock"]}
          },
          $group: {
            _id: null,
            totalStockValue: { $sum: "$totalValue"}
          }
        }
      ]
      const products = await Product.aggregate(pipeline)
      res.status(200).json(products);

    } catch (error) {
      res
      .status(500)
      .json({ error: "Failed fetch total stock value", err: error });
    }
  
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
