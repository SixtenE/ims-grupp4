import { Request, Response } from "express";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import Manufacturer from "../models/Manufacturer.js";
import {
  productSchema,
  updateProductSchema,
} from "../schemas/productSchema.js";

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
  // Validera med Zod
  const parseResult = productSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.flatten() });
  }

  const { manufacturer, manufacturerId, ...productData } = parseResult.data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let finalManufacturerId: string | undefined;

    if (manufacturer && manufacturerId) {
      throw new Error(
        "You cannot provide both manufacturer and manufacturerId. Choose one."
      );
    }

    if (manufacturer) {
      // Skapa kontakt
      const contact = new Contact(manufacturer.contact);
      await contact.save({ session });

      // Skapa ny tillverkare
      const newManufacturer = new Manufacturer({
        ...manufacturer,
        contact: contact._id,
      });
      await newManufacturer.save({ session });

      finalManufacturerId = newManufacturer._id.toString();
    } else if (manufacturerId) {
      if (!mongoose.isValidObjectId(manufacturerId)) {
        throw new Error("Invalid manufacturerId");
      }

      const existingManufacturer = await Manufacturer.findById(
        manufacturerId
      ).session(session);

      if (!existingManufacturer) {
        throw new Error("Manufacturer not found");
      }

      finalManufacturerId = manufacturerId;
    } else {
      throw new Error(
        "You must provide either a manufacturer or manufacturerId"
      );
    }

    // Kontrollera duplicerad produkt SKU
    const existingProduct = await Product.findOne({
      sku: productData.sku,
    }).session(session);
    if (existingProduct) {
      throw new Error("Product with this sku already exists");
    }

    // Skapa produkt
    const product = new Product({
      ...productData,
      manufacturer: finalManufacturerId,
    });
    await product.save({ session });

    await session.commitTransaction();

    await product.populate({
      path: "manufacturer",
      populate: { path: "contact" },
    });

    return res.status(201).json(product);
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({
      error: "Failed to add product",
      details: (error as Error).message,
    });
  } finally {
    session.endSession();
  }
}

export async function updateProductById(req: Request, res: Response) {
  const { id } = req.params;

  // Kontrollera att id är giltigt
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Not valid objectId" });
  }

  // Validera request body med Zod
  const parseResult = updateProductSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.flatten() });
  }

  const validatedData = parseResult.data;

  if (validatedData.manufacturerId) {
    if (!mongoose.isValidObjectId(validatedData.manufacturerId)) {
      return res.status(400).json({ error: "Invalid manufacturerId" });
    }
    const existingManufacturer = await Manufacturer.findById(
      validatedData.manufacturerId
    );
    if (!existingManufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update product",
      details: (error as Error).message,
    });
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
