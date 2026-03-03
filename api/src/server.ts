import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import products from "./routes/products";
import materials from "./routes/materials";
import relations from "./routes/relations";
import history from "./routes/history";
import production from "./routes/production";
import users from "./routes/users";
import purchase from "./routes/purchase";
import { getConnection } from "./db";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", products);
app.use("/materials", materials);
app.use("/relations", relations);
app.use("/history", history);
app.use("/production", production);
app.use("/users", users);
app.use("/raw-material-purchases", purchase);

// Initialize database connection
getConnection();

app.listen(process.env.PORT, () => {
  console.log(`API rodando na porta ${process.env.PORT}`);
});