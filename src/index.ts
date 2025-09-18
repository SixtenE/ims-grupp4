import express, { Response, Request, Application } from "express";
import "dotenv/config";
import productRouter from "./routes/productRouter";
import manufacturerRouter from "./routes/manufacturerRouter";
import mongoose from "mongoose";

const PORT = process.env["PORT"] ? parseInt(process.env["PORT"]) : 3000;

const app: Application = express();
app.use(express.json());

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

connectToMongo();

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "mongokjell" });
});

app.use("/api", productRouter);
app.use("/api", manufacturerRouter);

const server = app.listen(PORT, "::", () => {
  console.log(`Server is running at ${JSON.stringify(server.address())}`);
});

export { app };
