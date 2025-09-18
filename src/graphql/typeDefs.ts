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
    amountInStock: Int!
  }
`;
