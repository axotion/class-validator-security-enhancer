#!/usr/bin/env bun

import { scanDirectory } from "./src/scanner.js";
import { getCustomPattern, selectModel, askToContinue } from "./src/user-input.js";
import { processFiles } from "./src/processor.js";
import { calculateCosts } from "./src/cost-calculator.js";
import type { FileInfo } from "./src/types.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Guard: require directory argument
  if (args.length === 0) {
    console.error("Usage: bun main.ts <directory-path>");
    process.exit(1);
  }

  const targetDir = args[0];

  try {
    // Get user preferences
    const customPattern = await getCustomPattern();
    const selectedModel = await selectModel();

    console.log(`\nScanning for @ApiProperty() decorators in: ${targetDir}`);
    console.log(`Using model: ${selectedModel}`);

    // Guard: show pattern message
    if (customPattern) {
      console.log(`Filtering: Files containing '${customPattern}' in filename`);
    } else {
      console.log(`Filtering: Files must contain 'request.ts' or 'dto.ts' in filename`);
    }

    console.log("═".repeat(60));

    // Scan for files
    const files = await scanDirectory(targetDir, customPattern);

    // Guard: no files found
    if (files.length === 0) {
      console.log("\n❌ No files with @ApiProperty() decorator found.");
      process.exit(0);
    }

    // Calculate costs
    const totalChars = files.reduce((sum, file) => sum + file.size, 0);
    const costs = calculateCosts(totalChars, selectedModel);

    // Display results
    console.log(`\n✅ Found ${files.length} files with @ApiProperty() decorator`);
    console.log("\n📊 Token Estimation:");
    console.log(`   • Total characters: ${totalChars.toLocaleString()}`);
    console.log(`   • Input tokens: ${costs.inputTokens.toLocaleString()}`);
    console.log(`   • Output tokens (80%): ${costs.outputTokens.toLocaleString()}`);
    console.log(`   • Total tokens: ${costs.totalTokens.toLocaleString()}`);

    console.log(`\n💰 ${selectedModel} Pricing:`);
    console.log(`   • Input cost:  $${costs.inputCost.toFixed(4)}`);
    console.log(`   • Output cost: $${costs.outputCost.toFixed(4)}`);
    console.log(`   • TOTAL COST:  $${costs.totalCost.toFixed(4)}`);

    console.log("\n📁 Sample Files:");
    files.slice(0, 5).forEach((file, index) => {
      const preview = file.content.substring(0, 20).replace(/\n/g, "\\n");
      console.log(`   ${index + 1}. ${file.path}`);
      console.log(`      First 20 chars: "${preview}"`);
    });

    console.log("\n" + "═".repeat(60));
    console.log(`Files loaded in memory: ${files.length}`);

    // Ask for confirmation
    const shouldContinue = await askToContinue();

    if (!shouldContinue) {
      console.log("\n❌ Operation cancelled by user.");
      process.exit(0);
    }

    // Show processing start
    console.log("\n✅ Continuing with next step...");
    console.log("\n🔄 Will modify original files in place for pull request compatibility");
    console.log(`\n🤖 Processing files with ${selectedModel}...\n`);

    // Process all files
    const results = await processFiles(files, selectedModel);

    // Show final results
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n✅ Processing complete! ${successful} files enhanced successfully.`);

    if (failed > 0) {
      console.log(`❌ ${failed} files failed to process.`);
    }

  } catch (error) {
    console.error(
      "\n❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    "\n❌ Fatal error:",
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
});