import readline from "readline";
import type { ModelName, PromptCreator } from "./types.js";
import { MODELS, DEFAULT_MODEL } from "./types.js";
import { createNestJSStandardPrompt } from "./prompts/nestjs-standard-enhance.prompt.js";
import { createExperimentalPrompt } from "./prompts/experimental.prompt.js";

const AVAILABLE_PROMPTS = {
  "NestJS Standard Enhancement": createNestJSStandardPrompt,
  "NestJS Experimental": createExperimentalPrompt,
};

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export async function selectPrompt(): Promise<{
  name: string;
  creator: PromptCreator;
}> {
  const rl = createReadlineInterface();
  const promptNames = Object.keys(AVAILABLE_PROMPTS);

  return new Promise((resolve) => {
    const promptOptions = promptNames
      .map((name, index) => `${index + 1}. ${name}`)
      .join("\n");

    console.log(`\nAvailable AI Prompts:\n${promptOptions}`);
    rl.question(
      `Select a prompt (1-${promptNames.length}, or press Enter for default): `,
      (answer: string) => {
        rl.close();
        const choice = parseInt(answer.trim());

        // Default to the first prompt if input is invalid
        const selectedName =
          !choice || choice < 1 || choice > promptNames.length
            ? promptNames[0]
            : promptNames[choice - 1];

        resolve({
          name: selectedName,
          creator: AVAILABLE_PROMPTS[selectedName],
        });
      }
    );
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
    const defaultPattern =
      "Files containing 'request.ts' OR 'dto.ts' in filename with @ApiProperty() decorator";
    console.log(`\nCurrent pattern: ${defaultPattern}`);
    rl.question(
      "Enter custom filename pattern (or press Enter for default): ",
      (answer: string) => {
        rl.close();
        resolve(answer.trim() || null);
      }
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
      `Select model (1-${
        Object.keys(MODELS).length
      }, or press Enter for default): `,
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
      }
    );
  });
}
