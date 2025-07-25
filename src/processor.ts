import { writeFile } from "fs/promises";
import { basename } from "path";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import type { FileInfo, ModelName, ProcessingResult } from "./types.js";
import { createSecurityPrompt } from "./ai-prompt.js";

export async function processFiles(
  files: FileInfo[],
  model: ModelName
): Promise<ProcessingResult[]> {
  // Validate API key
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("\n❌ Error: GOOGLE_GENERATIVE_AI_API_KEY environment variable not set");
    console.error('   Set it with: export GOOGLE_GENERATIVE_AI_API_KEY="your-api-key"');
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
      // Create security enhancement prompt
      const prompt = createSecurityPrompt(fileName, file.content);

      // Call selected Gemini model
      const { text } = await generateText({
        model: google(model),
        prompt: prompt,
      });

      // Modify the original file in place
      await writeFile(file.path, text);

      console.log(`   ✅ Modified: ${file.path}`);

      results.push({
        success: true,
        filePath: file.path,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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