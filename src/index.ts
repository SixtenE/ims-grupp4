import express, { Response, Request, Application } from "express";
import "dotenv/config";
import productRouter from "./routes/productRouter";
import manufacturerRouter from "./routes/manufacturerRouter";
import mongoose from "mongoose";
import { seedDatabase } from "./utils/seed";
import { ApolloServer } from "@apollo/server";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/typeDefs";
import { expressMiddleware } from "@as-integrations/express5";

const PORT = process.env["PORT"] ? parseInt(process.env["PORT"]) : 3000;

const app: Application = express();
app.use(express.json());

//GraphQL setup
const apollo = new ApolloServer({ typeDefs, resolvers });
app.use("/graphql", expressMiddleware(apollo));

async function connectToMongo() {
  try {
    await mongoose.connect(String(process.env["DATABASE_URL"]), {
      dbName: "ims",
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
connectToApollo();

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "mongokjell" });
});

app.use("/api", productRouter);
app.use("/api", manufacturerRouter);

app.post("/seed", seedDatabase);

const server = app.listen(PORT, "::", () => {
  console.log(`Server is running at ${JSON.stringify(server.address())}`);
});

export { app };
