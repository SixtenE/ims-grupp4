export const typeDefs = /* GraphQL */ `
  type Query {
    products: [Product!]!
    product(id: ID!): Product!
  }

  type Product {
    _id: ID!
    name: String!
    sku: String!
    description: String!
    price: Float!
    category: String!
    amountInStock: Int!
    manufacturer: Manufacturer
  }

  type Manufacturer {
    _id: ID!
    name: String!
    country: String!
    website: String!
    description: String!
    address: String!
    contact: Contact
  }

  type Contact {
    _id: ID!
    name: String!
    email: String!
    phone: String!
  }

  input ContactInput {
    name: String!
    email: String!
    phone: String!
  }

  input ProductInput {
    name: String!
    sku: String!
    description: String!
    price: Float!
    category: String!
    amountInStock: Int!
    manufacturer: ManufacturerInput
  }

  input ManufacturerInput {
    name: String!
    country: String!
    website: String!
    description: String!
    address: String!
    contact: ContactInput!
  }

  type Mutation {
    addProduct(input: ProductInput!): Product!
  }
`;
