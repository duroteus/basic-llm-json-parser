import { buildPrompt } from "../prompts/purchase.prompt.js";
import { callLLM } from "../services/llm.service.js";
import { purchaseSchema } from "../validators/purchase.schema.js";

export async function parsePurchase(req, res) {
  const { text } = req.body;

  const prompt = buildPrompt(text);

  const raw = await callLLM(prompt);

  try {
    const json = JSON.parse(raw);

    const validated = purchaseSchema.parse(json);

    res.json(validated);
  } catch {
    res.status(422).json({
      error: "Invalid model output",
      raw,
    });
  }
}
