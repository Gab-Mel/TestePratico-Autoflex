import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import products from "./routes/products";
import materials from "./routes/materials";
import relations from "./routes/relations";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", products);
app.use("/materials", materials);
app.use("/relations", relations);

app.listen(process.env.PORT, () => {
  console.log(`API rodando na porta ${process.env.PORT}`);
});