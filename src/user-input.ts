import readline from "readline";
import type { ModelName } from "./types.js";
import { MODELS, DEFAULT_MODEL } from "./types.js";

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export async function askToContinue(): Promise<boolean> {
  const rl = createReadlineInterface();

  return new Promise((resolve) => {
    rl.question("\nDo you want to continue? (yes/no): ", (answer: string) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
}

export async function getCustomPattern(): Promise<string | null> {
  const rl = createReadlineInterface();

  return new Promise((resolve) => {
    const defaultPattern = "Files containing 'request.ts' OR 'dto.ts' in filename with @ApiProperty() decorator";
    console.log(`\nCurrent pattern: ${defaultPattern}`);
    rl.question(
      "Enter custom filename pattern (or press Enter for default): ",
      (answer: string) => {
        rl.close();
        resolve(answer.trim() || null);
      },
    );
  });
}

export async function selectModel(): Promise<ModelName> {
  const rl = createReadlineInterface();

  return new Promise((resolve) => {
    const modelOptions = Object.keys(MODELS)
      .map((model, index) => `${index + 1}. ${model}`)
      .join("\n");
    console.log(`\nAvailable models:\n${modelOptions}`);
    rl.question(
      `Select model (1-${Object.keys(MODELS).length}, or press Enter for default): `,
      (answer: string) => {
        rl.close();
        const choice = parseInt(answer.trim());

        // Guard: invalid choice or empty, use default
        if (!choice || choice < 1 || choice > Object.keys(MODELS).length) {
          resolve(DEFAULT_MODEL);
          return;
        }

        const selectedModel = Object.keys(MODELS)[choice - 1] as ModelName;
        resolve(selectedModel);
      },
    );
  });
}