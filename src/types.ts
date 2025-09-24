export type ProductInput = {
  name: string;
  sku: string;
  description: string;
  price: number;
  category: string;
  amountInStock: number;
  manufacturer?: ManufacturerInput;
  manufacturerId?: string;
};

export type ManufacturerInput = {
  name: string;
  country: string;
  website: string;
  description: string;
  address: string;
  contact: ContactInput;
};

export type ContactInput = {
  name: string;
  email: string;
  phone: string;
};

export type UpdateProductInput = {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  category?: string;
  amountInStock?: number;
  manufacturer?: ManufacturerInput;
  manufacturerId?: string;
};
