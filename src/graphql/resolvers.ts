import mongoose from "mongoose";
import Product from "../models/Product";
import Manufacturer from "../models/Manufacturer";
import Contact from "../models/Contact";

type ProductInput = {
  name: string;
  sku: string;
  description: string;
  price: number;
  category: string;
  amountInStock: number;
  manufacturer?: ManufacturerInput;
  manufacturerId?: string;
};

type ManufacturerInput = {
  name: string;
  country: string;
  website: string;
  description: string;
  address: string;
  contact: ContactInput;
};

type ContactInput = {
  name: string;
  email: string;
  phone: string;
};

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
    // totalStockValueByManufacturer: async () => {
    //   try {
    //     const pipeline = [
    //       {
    //         $lookup: {
    //           from: "manufacturers",
    //           localField: "manufacturer",
    //           foreignField: "_id",
    //           as: "manufacturer",
    //         },
    //       },
    //       {
    //         $unwind: "$manifacturer",
    //       },
    //       {
    //         $group: {
    //           _id: "$manifacturer",
    //           total: { $sum: { $multiply: ["$amountInStock", "$price"] } },
    //         },
    //       },
    //     ];
    //     const result: { _id: string; total: number }[] =
    //       await Product.aggregate(pipeline);

    //     return result;
    //   } catch (err) {
    //     throw new Error(
    //       "Failed to fetch total stock value" + (err as Error).message
    //     );
    //   }
    // },
  },

  Mutation: {
    addProduct: async (_p: never, { input }: { input: ProductInput }) => {
      try {
        let manufacturerId: string | undefined;

        if (input.manufacturer && input.manufacturerId) {
          throw new Error(
            "You cannot provide both manufacturer and manufacturerId. Choose one."
          );
        }

        if (input.manufacturer) {
          const contact = await Contact.create(input.manufacturer.contact);

          const manufacturer = await Manufacturer.create({
            name: input.manufacturer.name,
            country: input.manufacturer.country,
            website: input.manufacturer.website,
            description: input.manufacturer.description,
            address: input.manufacturer.address,
            contact: contact._id,
          });

          manufacturerId = manufacturer._id.toString();
        } else if (input.manufacturerId) {
          if (!mongoose.isValidObjectId(input.manufacturerId)) {
            throw new Error("Id is not valid");
          }

          manufacturerId = input.manufacturerId;
        } else {
          throw new Error(
            "You must provide either a manufacturer or manufacturerId"
          );
        }

        const product = await Product.create({
          name: input.name,
          sku: input.sku,
          description: input.description,
          price: input.price,
          category: input.category,
          amountInStock: input.amountInStock,
          manufacturer: manufacturerId,
        });

        await product.populate({
          path: "manufacturer",
          populate: { path: "contact" },
        });

        return product;
      } catch (err) {
        throw new Error("Failed to add product:" + (err as Error).message);
      }
    },
  },
};
