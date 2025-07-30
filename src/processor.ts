import { writeFile } from "fs/promises";
import { basename } from "path";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import type {
  FileInfo,
  ModelName,
  ProcessingResult,
  PromptCreator,
} from "./types.js";

export async function processFiles(
  files: FileInfo[],
  model: ModelName,
  createPrompt: PromptCreator
): Promise<ProcessingResult[]> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error(
      "\n❌ Error: GOOGLE_GENERATIVE_AI_API_KEY environment variable not set"
    );
    console.error(
      '   Set it with: export GOOGLE_GENERATIVE_AI_API_KEY="your-api-key"'
    );
    process.exit(1);
  }

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  const results: ProcessingResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = basename(file.path);

    console.log(`Processing ${i + 1}/${files.length}: ${file.path}`);

    try {
      const prompt = createPrompt(fileName, file.content);

      const { text } = await generateText({
        model: google(model),
        system: prompt.system,
        prompt: prompt.user,
        temperature: 0.3,
      });

      await writeFile(file.path, text);
      console.log(`   ✅ Modified: ${file.path}`);
      results.push({ success: true, filePath: file.path });
    } catch (error) {
      console.log("error", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Error processing ${file.path}: ${errorMessage}`);
      results.push({
        success: false,
        filePath: file.path,
        error: errorMessage,
      });
    }
  }

  return results;
}
