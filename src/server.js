import "dotenv/config";

import express from "express";
import purchaseRoutes from "./api/routes/purchase.route.js";

const app = express();

app.use(express.json());

app.use("/purchase", purchaseRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
