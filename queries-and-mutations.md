# Queries and mutations

Add your queries and mutations here.
A tip is to use [GraphQL Formatter](https://jsonformatter.org/graphql-formatter) to format them to make them easier to read.

## This is an example

```graphql
mutation {
  addSale(
    saleDate: "1427144809506"
    items: [
      {
        name: "printer paper"
        tags: ["office", "stationary"]
        price: 40.01
        quantity: 2
      }
    ]
    storeLocation: "Denver"
    customer: {
      gender: "M"
      age: 42
      email: "cauhowitwuta.sv"
      satisfaction: 4
    }
    couponUsed: true
    purchaseMethod: "Online"
  ) {
    id
  }
}
```

## Queries

### products

```graphql
query {
  products {
    _id
    name
    sku
    description
    price
    category
    amountInStock
    manufacturer {
      name
      contact {
        name
      }
    }
  }
}
```

### product(id: ID!)

```graphql
query {
  product(id: "68d28673e1d9b9d685addadd") {
    _id
    name
    sku
  }
}
```

### totalStockValue

```graphql
query {
  totalStockValue
}
```

### totalStockValueByManufacturer

```graphql
query {
  totalStockValueByManufacturer {
    manufacturer {
      name
    }
    totalStockValue
  }
}
```

### lowStockProducts

```graphql
query {
  lowStockProducts {
    name
    amountInStock
  }
}
```

### criticalStockProducts

```graphql
{
  criticalStockProducts {
    name
    amountInStock
    manufacturer {
      name
      contact {
        name
        email
        phone
      }
    }
  }
}
```

### manufacturers

```graphql
{
  manufacturers {
    _id
    name
  }
}
```

## Mutations

### addProduct

```graphql
mutation {
  addProduct(
    input: {
      name: "Joel"
      sku: "JOJO1234"
      description: "Composer & Web Developer Teacher blending creativity and technology for structured, expressive learning"
      price: 100
      category: "garden"
      amountInStock: 5
      manufacturerId: "68d28673e1d9b9d685addac9"
    }
  ) {
    _id
    name
    sku
  }
}
```

### updateProduct

```graphql
mutation {
  updateProduct(id: "68d29fbea9c65f3f7564bb0d", input: { name: "Joel J" }) {
    _id
    name
    sku
  }
}
```

### deleteProduct

```graphql
mutation {
  deleteProductById(id: "68d29fbea9c65f3f7564bb0d") {
    _id
    name
    sku
  }
}
```
