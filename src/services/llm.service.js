import OpenAI from "openai";

const client = new OpenAI();

export async function callLLM(prompt) {
  const response = await client.responses.create({
    model: "gpt-4.1-nano",
    input: prompt,
    temperature: 0,
  });

  return response.output_text;
}
