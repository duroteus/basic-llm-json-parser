import express from "express";
import { parsePurchase } from "../../controllers/purchase.controller.js";

const router = express.Router();

router.post("/parse", parsePurchase);

export default router;
