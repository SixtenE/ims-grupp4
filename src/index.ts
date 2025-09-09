import express, { Response, Request } from "express";
import "dotenv/config";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "mongokjell" });
});

const server = app.listen(PORT, "::", () => {
  console.log(`Server is running at ${JSON.stringify(server.address())}`);
});
