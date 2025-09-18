export const typeDefs = /* GraphQL */ `
  type Query {
    products: [Product!]!
  }

  type Product {
    _id: ID!
    name: String!
    sku: String!
    description: String!
    price: Float!
    category: String!
    manufacturer: Manufacturer!
    amountInStock: Int!
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
`;
