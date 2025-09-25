import { Request, Response } from "express";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import Manufacturer from "../models/Manufacturer.js";
import {
  productSchema,
  updateProductSchema,
} from "../schemas/productSchema.js";
import { zodErrorToObject } from "../utils/zodHelpers.js";

export async function getAllProducts(req: Request, res: Response) {
  // Copilot skrev denna del
  const categoryFilter: string | string[] | undefined = req.query[
    "category"
  ] as string | string[] | undefined;

  const priceMinFilter: number | undefined = req.query["priceMin"]
    ? Number(req.query["priceMin"])
    : undefined;

  const priceMaxFilter: number | undefined = req.query["priceMax"]
    ? Number(req.query["priceMax"])
    : undefined;

  const sort: { [key: string]: mongoose.SortOrder } =
    req.query["sort"] === "priceAsc"
      ? { price: "asc" }
      : req.query["sort"] === "priceDesc"
      ? { price: "desc" }
      : {
          name: "asc",
        };

  const searchQuery = req.query["search"] as string | undefined;

  const manufacturerId = req.query["manufacturerId"] as string | undefined;

  const limit = req.query["limit"] ? Number(req.query["limit"]) : 1000;

  try {
    const products = await Product.find({
      ...(categoryFilter ? { category: categoryFilter } : {}),
      ...(priceMinFilter ? { price: { $gte: priceMinFilter } } : {}),
      ...(priceMaxFilter ? { price: { $lte: priceMaxFilter } } : {}),
      ...(searchQuery
        ? {
            $or: [
              { name: { $regex: searchQuery, $options: "i" } },
              { description: { $regex: searchQuery, $options: "i" } },
              { sku: { $regex: searchQuery, $options: "i" } },
            ],
          }
        : {}),
      ...(manufacturerId ? { manufacturer: manufacturerId } : {}),
    })
      .populate({
        path: "manufacturer",
        populate: { path: "contact" },
      })
      .sort(sort)
      .limit(limit);
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
    const product = await Product.findById(id).populate({
      path: "manufacturer",
      populate: { path: "contact" },
    });

    if (!product) return res.status(404).json({ error: "Id no valid" });

    return res.status(200).json(product);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch product", err });
  }
}

export async function addProduct(req: Request, res: Response) {
  // Validate with Zod
  const parseResult = productSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: zodErrorToObject(parseResult.error) });
  }

  const { manufacturer, manufacturerId, ...productData } = parseResult.data;

  // Validate manufacturerId before session
  if (manufacturerId && !mongoose.isValidObjectId(manufacturerId)) {
    return res.status(400).json({ error: "Invalid manufacturerId" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let finalManufacturerId: string;

    if (manufacturer && manufacturerId) {
      return res
        .status(400)
        .json({ error: "Provide either manufacturer or manufacturerId, not both" });
    }

    if (manufacturer) {
      const contact = new Contact(manufacturer.contact);
      await contact.save({ session });

      const newManufacturer = new Manufacturer({
        ...manufacturer,
        contact: contact._id,
      });
      await newManufacturer.save({ session });

      finalManufacturerId = newManufacturer._id.toString();
    } else if (manufacturerId) {
      const existingManufacturer = await Manufacturer.findById(manufacturerId).session(session);
      if (!existingManufacturer) {
        return res.status(404).json({ error: "Manufacturer not found" });
      }
      finalManufacturerId = manufacturerId;
    } else {
      return res.status(400).json({ error: "Manufacturer or manufacturerId required" });
    }

    // Check duplicate SKU
    const existingProduct = await Product.findOne({ sku: productData.sku }).session(session);
    if (existingProduct) {
      return res.status(409).json({ error: "Product with this sku already exists" });
    }

    const product = new Product({ ...productData, manufacturer: finalManufacturerId });
    await product.save({ session });

    await session.commitTransaction();
    await product.populate({ path: "manufacturer", populate: { path: "contact" } });

    return res.status(201).json(product);
  } catch (err) {
    await session.abortTransaction();
    return res.status(500).json({ error: "Failed to add product", details: (err as Error).message });
  } finally {
    session.endSession();
  }
}

export async function updateProductById(req: Request, res: Response) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Not valid objectId" });
  }

  const parseResult = updateProductSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: zodErrorToObject(parseResult.error) });
  } 

  const { manufacturerId, manufacturer, ...rest } = parseResult.data;
  const updateData: any = { ...rest };

  if (manufacturerId) {
    if (!mongoose.isValidObjectId(manufacturerId)) {
      return res.status(400).json({ error: "Invalid manufacturerId" });
    }

    const existingManufacturer = await Manufacturer.findById(manufacturerId);
    if (!existingManufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }
    updateData.manufacturer = manufacturerId;
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate({ path: "manufacturer", populate: { path: "contact" } });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Return product directly (for test compatibility)
    return res.status(200).json(updatedProduct);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update product", details: (err as Error).message });
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
          totalValue: { $multiply: ["$price", "$amountInStock"] },
        },
      },
      {
        $group: {
          _id: null,
          totalStockValue: { $sum: "$totalValue" },
        },
      },
    ];
    const result = await Product.aggregate(pipeline);
    res.status(200).json(result[0].totalStockValue);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed fetch total stock value", err: error });
  }
}

export async function getTotalStockValueByManufacturer(
  _req: Request,
  res: Response
) {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturer",
          foreignField: "_id",
          as: "manufacturer",
        },
      },
      {
        $unwind: "$manufacturer",
      },
      {
        $group: {
          _id: "$manufacturer._id",
          name: { $first: "$manufacturer.name" },
          totalStockValue: {
            $sum: { $multiply: ["$price", "$amountInStock"] },
          },
        },
      },
    ];
    const products = await Product.aggregate(pipeline);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      error: "Failed fetch total stock value by manufacturer",
      err: error,
    });
  }
}

export async function getLowStockProducts(_req: Request, res: Response) {
  try {
    const pipeline = [{ $match: { amountInStock: { $lt: 10 } } }];
    const products = await Product.aggregate(pipeline);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed fetch low stock value", err: error });
  }
}

//Hämta en kompakt lista över produkter med färre än 5 enheter i lager (inkluderar endast tillverkarens/manufacturer samt kontaktens/contact namn, telefon och e-post)
export async function getCriticalStockProducts(_req: Request, res: Response) {
  try {
    const pipeline = [
      {
        $match: { amountInStock: { $lt: 5 } },
      },
      {
        $lookup: {
          from: "manufacturers",
          localField: "manufacturer",
          foreignField: "_id",
          as: "manufacturer",
        },
      },
      {
        $unwind: "$manufacturer",
      },

      {
        $lookup: {
          from: "contacts",
          localField: "manufacturer.contact",
          foreignField: "_id",
          as: "contact",
        },
      },
      {
        $unwind: "$contact",
      },
      {
        $project: {
          _id: 0,
          productName: "$name",
          manufacturerName: "$manufacturer.name",
          contactName: "$contact.name",
          contactPhone: "$contact.phone",
          contactEmail: "$contact.email",
        },
      },
    ];

    const products = await Product.aggregate(pipeline);
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch critical stock products", err: error });
  }
}
