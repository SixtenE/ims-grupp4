import express, { Application } from "express";
import "dotenv/config";
import productRouter from "./routes/productRouter.js";
import manufacturerRouter from "./routes/manufacturerRouter.js";
import mongoose from "mongoose";
import { seedDatabase } from "./utils/seed.js";
import { ApolloServer } from "@apollo/server";
import { resolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";

const PORT = process.env["PORT"] ? parseInt(process.env["PORT"]) : 3000;

const app: Application = express();
app.use(express.json());
app.use(cors());

//GraphQL setup
const apollo = new ApolloServer({ typeDefs, resolvers });
connectToApollo().then(() => {
  console.log("Connected to Apollo Server");
  app.use("/graphql", expressMiddleware(apollo));
});

async function connectToMongo() {
  try {
    await mongoose.connect(String(process.env["DATABASE_URL"]), {
      dbName: "ims",
      // Hanna behöver dessa för att kunna starta server:
      // serverSelectionTimeoutMS: 5000,
      // tls: true,
      // tlsAllowInvalidCertificates: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function connectToApollo() {
  try {
    await apollo.start();
  } catch (error) {
    console.error("Error starting Apollo Server:", error);
  }
}

connectToMongo();

app.use("/api", productRouter);
app.use("/api", manufacturerRouter);

app.post("/seed", seedDatabase);

app.use("/", express.static("public"));

const server = app.listen(PORT, "::", () => {
  console.log(`Server is running at ${JSON.stringify(server.address())}`);
});

export { app };
