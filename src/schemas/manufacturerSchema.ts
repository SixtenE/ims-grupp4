import { z } from "zod";
import { contactSchema } from "./contactSchema.js";

export const manufacturerSchema = z.object({
  name: z.string().min(2),
  country: z.string().min(2),
  website: z.string(),
  description: z.string().optional(),
  address: z.string().optional(),
  contact: contactSchema,
});

export type ManufacturerInput = z.infer<typeof manufacturerSchema>;
