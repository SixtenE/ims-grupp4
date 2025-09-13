import express, { Response, Request, Application } from "express";
import "dotenv/config";
import productRouter from "./routes/productRouter";
import manufacturerRouter from "./routes/manufacturerRouter";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app: Application = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "mongokjell" });
});

app.use("/api", productRouter);
app.use("/api", manufacturerRouter);

const server = app.listen(PORT, "::", () => {
  console.log(`Server is running at ${JSON.stringify(server.address())}`);
});

export { app };
