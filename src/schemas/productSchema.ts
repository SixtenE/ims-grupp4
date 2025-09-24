import { z } from "zod";
import { manufacturerSchema } from "./manufacturerSchema.js";

export const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
  amountInStock: z.number().int().nonnegative(),
  manufacturerId: z.string().optional(),
  manufacturer: manufacturerSchema.optional(),
});

export const updateProductSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
