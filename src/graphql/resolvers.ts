import mongoose from "mongoose";
import Product from "../models/Product";

type Product = {
  name: string;
  sku: string;
  description: string;
  price: number;
  category: string;
  amountInStock: number;
  manufacturer?: Manufacturer;
};

type Manufacturer = {
  name: string;
  country: string;
  website: string;
  description: string;
  address: string;
  contact: Contact;
};

type Contact = {
  name: string;
  email: string;
  phone: string;
};

export const resolvers = {
  Query: {
    products: async () => {
      try {
        return await Product.find();
      } catch (err) {
        throw new Error("Failed to fetch products:" + (err as Error).message);
      }
    },
    product: async (_p: never, { id }: { id: string }) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new Error("Id is not valid");
      }
      try {
        const product = await Product.findById(id);

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
  },

  Mutation: {
    addProduct: async (_p: never, { input }: { input: Product }) => {
      try {
        const product = await Product.create(input);
        return product;
      } catch (err) {
        throw new Error("Failed to add product:" + (err as Error).message);
      }
    },
  },
};
