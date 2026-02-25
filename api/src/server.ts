import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRoutes from "./routes/products";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", productsRoutes);

app.listen(process.env.PORT, () => {
  console.log(`API rodando na porta ${process.env.PORT}`);
});