// Types and models for the security enhancer

export interface FileInfo {
  path: string;
  content: string;
  size: number;
}

export interface ModelConfig {
  input: number;
  output: number;
}

export interface CostCalculation {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export type ModelName = "gemini-2.5-flash" | "gemini-2.5-pro";

export interface ProcessingResult {
  success: boolean;
  filePath: string;
  error?: string;
}

// Model configurations with pricing per 1M tokens
export const MODELS: Record<ModelName, ModelConfig> = {
  "gemini-2.5-flash": {
    input: 0.3,
    output: 2.5,
  },
  "gemini-2.5-pro": {
    input: 1.25,
    output: 5.0,
  },
};

// Default model selection
export const DEFAULT_MODEL: ModelName = "gemini-2.5-flash";

// Token estimation: ~1 token per 4 characters
export const CHARS_PER_TOKEN = 4;