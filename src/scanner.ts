import { readdir, readFile } from "fs/promises";
import { join } from "path";
import type { FileInfo } from "./types.js";

export async function scanDirectory(
  dir: string,
  customPattern?: string | null
): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  const apiPropertyPattern = /@ApiProperty\s*\(/;

  async function scanRecursively(currentDir: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        // Guard: skip hidden dirs and node_modules
        if (entry.isDirectory() && (entry.name.startsWith(".") || entry.name === "node_modules")) {
          continue;
        }

        // Guard: process directories recursively
        if (entry.isDirectory()) {
          await scanRecursively(fullPath);
          continue;
        }

        // Guard: only process .ts and .js files
        if (!entry.isFile() || (!entry.name.endsWith(".ts") && !entry.name.endsWith(".js"))) {
          continue;
        }

        // Guard: check filename pattern
        const lowerName = entry.name.toLowerCase();
        if (customPattern) {
          if (!lowerName.includes(customPattern.toLowerCase())) {
            continue;
          }
        } else {
          if (!lowerName.includes("request.ts") && !lowerName.includes("dto.ts")) {
            continue;
          }
        }

        try {
          const content = await readFile(fullPath, "utf-8");

          // Guard: skip files without @ApiProperty
          if (!apiPropertyPattern.test(content)) {
            continue;
          }

          files.push({
            path: fullPath,
            content: content,
            size: content.length,
          });
        } catch (error) {
          // Skip unreadable files
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }

  await scanRecursively(dir);
  return files;
}