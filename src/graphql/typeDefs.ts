export const typeDefs = /* GraphQL */ `
  type Product {
    _id: ID!
    name: String!
    sku: String!
    description: String!
    price: Float!
    category: String!
    amountInStock: Int!
    manufacturer: Manufacturer!
  }

  type Manufacturer {
    _id: ID!
    name: String!
    country: String!
    website: String!
    description: String!
    address: String!
    contact: Contact!
  }

  type Contact {
    _id: ID!
    name: String!
    email: String!
    phone: String!
  }

  type StockValueByManufacturer {
    _id: ID!
    manufacturer: Manufacturer!
    totalStockValue: Float!
  }

  input ProductInput {
    name: String!
    sku: String!
    description: String!
    price: Float!
    category: String!
    amountInStock: Int!
    manufacturerId: ID
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product!
    totalStockValue: Float!
    totalStockValueByManufacturer: [StockValueByManufacturer!]!
  }

  type Mutation {
    addProduct(input: ProductInput!): Product!
    deleteProductById(id: ID!): Product!
  }
`;
