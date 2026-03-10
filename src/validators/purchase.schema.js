import { z } from "zod";

export const purchaseSchema = z.object({
  product: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
});
