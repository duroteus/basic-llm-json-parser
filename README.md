# JSON Parser — Project 02: LLM-Powered Structured Data Extraction

> Second project in a series exploring AI Engineering practices.

## Motivation

This is the second in a series of study projects focused on **AI Engineering** — the discipline of building production-ready systems that consume Large Language Models as a service.

The central idea here is that LLMs can act as universal parsers. Instead of writing regex patterns, custom tokenizers, or brittle string-matching logic to extract data from free text, you can describe the desired output shape in a prompt and let the model do the heavy lifting. The result is a system that handles natural language input with zero parsing code.

The scope was kept intentionally tight: a single endpoint that receives an arbitrary text description of a purchase, sends it to an LLM with a carefully constrained prompt, and returns a validated JSON object. No custom NLP pipeline, no training data, no fine-tuning — just prompt engineering and schema validation.

## Tech Stack

| Concern      | Choice                  |
| ------------ | ----------------------- |
| Runtime      | Node.js (ESM)           |
| Framework    | Express 5               |
| LLM Provider | OpenAI (`gpt-4.1-nano`) |
| LLM Client   | `openai` SDK            |
| Validation   | Zod                     |
| Config       | `dotenv`                |

## Architecture

```
src/
├── server.js                      # App entrypoint — Express setup, route wiring
├── api/
│   └── routes/
│       └── purchase.route.js      # POST /purchase/parse
├── controllers/
│   └── purchase.controller.js     # Orchestrates prompt, LLM call, parsing, and validation
├── prompts/
│   └── purchase.prompt.js         # Builds the structured extraction prompt
├── services/
│   └── llm.service.js             # OpenAI client — sends prompt, returns raw text
├── validators/
│   └── purchase.schema.js         # Zod schema for the expected output shape
└── middlewares/
    └── logger.js                  # Structured request logging with timing
```

### Request Lifecycle

**`POST /purchase/parse`**

1. The request body `{ "text": "..." }` is received by the controller.
2. `buildPrompt()` wraps the raw text in a structured prompt that instructs the model to extract `product`, `quantity`, and `unit_price` and return **only valid JSON**.
3. The prompt is forwarded to OpenAI via the `openai` SDK with `temperature: 0` to maximize output determinism.
4. The raw string returned by the model is parsed with `JSON.parse()`.
5. The parsed object is validated against a Zod schema — if any field is missing or has the wrong type, validation throws immediately.
6. On success, the validated object is returned as JSON. On failure (parse error or schema mismatch), a `422` response is returned alongside the raw model output for debugging.

```
Request
  │
  ▼
buildPrompt(text)
  │
  ▼
callLLM(prompt)  ──── OpenAI gpt-4.1-nano (temperature: 0)
  │
  ▼
JSON.parse(raw)
  │
  ▼
purchaseSchema.parse(json)  ──── Zod validation
  │
  ├── valid   ──▶  200 { product, quantity, unit_price }
  └── invalid ──▶  422 { error, raw }
```

### Key Engineering Decisions

**`temperature: 0` for determinism.** Extraction tasks have a single correct answer given the input. A temperature of zero makes the model's sampling as greedy as possible, minimizing hallucinated values and format deviations.

**Prompt constrains format, not just content.** The prompt instructs the model to return _only_ valid JSON — no markdown code fences, no explanatory prose, no trailing text. This keeps `JSON.parse()` reliable without needing a post-processing step to strip formatting artifacts.

**Zod as a runtime guardrail.** The model output is treated as untrusted input, the same way you'd treat data from an external API. Zod validates the shape and types at runtime, ensuring the controller never hands a malformed object downstream. The schema is the single source of truth for what a valid extraction looks like.

**422 with raw output on failure.** When parsing or validation fails, the response exposes the exact string the model returned. This is intentional: debugging extraction failures requires seeing the raw output, not just a generic error message. In a production system this would be logged and monitored.

## Endpoint

### `POST /purchase/parse`

Extracts structured purchase data from a free-text description.

**Request**

```json
{ "text": "I bought 3 units of wireless headphones for 89.90 each" }
```

**Response — success**

```json
{
  "product": "wireless headphones",
  "quantity": 3,
  "unit_price": 89.9
}
```

**Response — failure** `422 Unprocessable Entity`

```json
{
  "error": "Invalid model output",
  "raw": "..."
}
```

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your OpenAI API key to .env:
# OPENAI_API_KEY=sk-...

# Start the development server
npm run dev
```

The server starts on port `3000`.

---

## Related Projects

This project is part of a series on AI Engineering. Each project explores a specific pattern or concern when building systems on top of LLMs.

| #   | Project                                                                | Description                                                                                  |
| --- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 01  | [LLM API](https://github.com/duroteus/basic-llm-api-example)           | Minimal LLM-powered REST API with in-memory cache, rate limiting, and cost tracking          |
| 02  | [JSON Parser](https://github.com/duroteus/basic-llm-json-parser)       | Structured data extraction from free text using prompt engineering and Zod validation        |
| 03  | [Semantic Search API](https://github.com/duroteus/semantic-search-api) | Full RAG pipeline with pgvector retrieval, context reconstruction, and LLM answer generation |
| 04  | [AI Data Agent](https://github.com/duroteus/ai-data-agent)             | Agentic loop with tool use, SQL execution, Redis memory, and chart generation                |
