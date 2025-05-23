import fs from "fs";
import path from "path";

import { TestMetadata } from "@/fixtures/metadata/TestMetadata";

const __dirname = new URL("..", import.meta.url).pathname;
const metadataDir = path.resolve(__dirname, "../test/fixtures/metadata");

export function loadAllMetadata(): TestMetadata[] {
  const files = fs.readdirSync(metadataDir).filter((f) => f.endsWith(".json"));

  return files.flatMap((file) => {
    const filePath = path.join(metadataDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as TestMetadata[];
  });
}

const allMetadata = loadAllMetadata();

export function getMetadataByFile(file: string): TestMetadata | undefined {
  return allMetadata.find((meta) => file.endsWith(meta.file));
}
