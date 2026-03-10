export function buildPrompt(text) {
  return `
 You are a purchase extraction system.
 
 Extract:
 
 - produto
 - quantity
 - unit_price
 
 Return only valid JSON.
 
 Schema:
 
 {
  "product": string,
  "quantity": number,
  "unit_price": number
 }
 
 Text:
 
 ${text}
 `;
}
