import Product from "../models/Product";

export const resolvers = {
  Query: {
    products: async () => {
      return await Product.find();
    },
  },
};
