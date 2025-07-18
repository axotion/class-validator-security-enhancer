import type { CostCalculation, ModelName } from "./types.js";
import { MODELS, CHARS_PER_TOKEN } from "./types.js";

export function calculateCosts(totalChars: number, model: ModelName): CostCalculation {
  const inputTokens = Math.ceil(totalChars / CHARS_PER_TOKEN);
  const outputTokens = Math.ceil(inputTokens * 0.8); // 80% assumption

  const pricing = MODELS[model];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    inputCost,
    outputCost,
    totalCost,
  };
}