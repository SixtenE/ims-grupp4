import mongoose from "mongoose";
import Product from "../models/Product.js";
import Manufacturer from "../models/Manufacturer.js";
import Contact from "../models/Contact.js";
import { ProductInput, UpdateProductInput } from "../types.js";
import {
  productSchema,
  updateProductSchema,
} from "../schemas/productSchema.js";

export const resolvers = {
  Query: {
    products: async () => {
      try {
        return await Product.find().populate({
          path: "manufacturer",
          populate: { path: "contact" },
        });
      } catch (err) {
        throw new Error("Failed to fetch products:" + (err as Error).message);
      }
    },
    product: async (_p: never, { id }: { id: string }) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Id is not valid");
      }
      try {
        const product = await Product.findById(id).populate({
          path: "manufacturer",
          populate: { path: "contact" },
        });

        if (!product) {
          throw new Error(`Product with id ${id} not found`);
        }
        return product;
      } catch (err) {
        throw new Error("Failed to fetch product:" + (err as Error).message);
      }
    },
    totalStockValue: async () => {
      try {
        const pipeline = [
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$amountInStock", "$price"] } },
            },
          },
        ];

        const result: { _id: null; total: number }[] = await Product.aggregate(
          pipeline
        );
        return result[0]?.total || 0;
      } catch (err) {
        throw new Error(
          "Failed to fetch total stock value" + (err as Error).message
        );
      }
    },
    totalStockValueByManufacturer: async () => {
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
              manufacturer: { $first: "$manufacturer" },
              totalStockValue: {
                $sum: { $multiply: ["$price", "$amountInStock"] },
              },
            },
          },
        ];
        const result = await Product.aggregate(pipeline);

        return result;
      } catch (err) {
        throw new Error(
          "Failed to fetch total stock value" + (err as Error).message
        );
      }
    },
    manufacturers: async () => {
      try {
        return await Manufacturer.find().populate({
          path: "contact",
        });
      } catch (err) {
        throw new Error(
          "Failed to fetch manufacturers:" + (err as Error).message
        );
      }
    },
    lowStockProducts: async (
      _p: never,
      { threshold = 10 }: { threshold: number }
    ) => {
      try {
        return await Product.find({ amountInStock: { $lt: threshold } });
      } catch (err) {
        throw new Error(
          "Failed to fetch low stock products" + (err as Error).message
        );
      }
    },
    criticalStockProducts: async (
      _p: never,
      { threshold = 5 }: { threshold: number }
    ) => {
      try {
        return await Product.find({
          amountInStock: { $lt: threshold },
        }).populate({
          path: "manufacturer",
          select: "name contact",
          populate: {
            path: "contact",
            select: "name email phone",
          },
        });
      } catch (err) {
        throw new Error(
          "Failed to fetch critical stock products" + (err as Error).message
        );
      }
    },
  },

  Mutation: {
    addProduct: async (_p: never, { input }: { input: ProductInput }) => {
      // Validera med Zod
      const parseResult = productSchema.safeParse(input);
      if (!parseResult.success) {
        throw new Error(
          "Validation error: " + JSON.stringify(parseResult.error.flatten())
        );
      }

      const {
        manufacturer: manufacturerInput,
        manufacturerId,
        ...productData
      } = parseResult.data;
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        let finalManufacturerId: string | undefined;

        if (manufacturerInput && manufacturerId) {
          throw new Error(
            "You cannot provide both manufacturer and manufacturerId. Choose one."
          );
        }

        if (manufacturerInput) {
          // Skapa kontakt
          const contact = new Contact(manufacturerInput.contact);
          await contact.save({ session });

          // Skapa ny tillverkare
          const newManufacturer = new Manufacturer({
            ...manufacturerInput,
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

        return product;
      } catch (err) {
        await session.abortTransaction();
        throw new Error("Failed to add product:" + (err as Error).message);
      } finally {
        session.endSession();
      }
    },

    updateProduct: async (
      _p: never,
      { id, input }: { id: string; input: UpdateProductInput }
    ) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Not valid objectId");
      }

      // Validera med Zod
      const parseResult = updateProductSchema.safeParse(input);
      if (!parseResult.success) {
        throw new Error(
          "Validation error: " + JSON.stringify(parseResult.error.flatten())
        );
      }

      const validatedData = parseResult.data;

      if (validatedData.manufacturerId) {
        if (!mongoose.isValidObjectId(validatedData.manufacturerId)) {
          throw new Error("Invalid manufacturerId");
        }
        const existingManufacturer = await Manufacturer.findById(
          validatedData.manufacturerId
        );
        if (!existingManufacturer) {
          throw new Error("Manufacturer not found");
        }
      }

      try {
        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          validatedData,
          {
            new: true,
            runValidators: true,
          }
        );
        if (!updatedProduct) throw new Error("Product not found");
        return updatedProduct;
      } catch (error) {
        throw new Error("Failed to update product:" + (error as Error).message);
      }
    },

    deleteProductById: async (_p: never, { id }: { id: string }) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Not valid objectId");
      }

      try {
        const product = await Product.findByIdAndDelete(id).populate({
          path: "manufacturer",
          populate: { path: "contact" },
        });
        if (!product) throw new Error("Product not found");
        return product;
      } catch (error) {
        throw new Error("Failed to delete product:" + (error as Error).message);
      }
    },
  },
};
