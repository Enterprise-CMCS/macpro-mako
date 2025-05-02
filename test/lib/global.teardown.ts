import { promises as fs } from "fs";
import * as path from "path";

const __dirname = new URL("..", import.meta.url).pathname;

const authDir: string = path.join(__dirname, "playwright", ".auth");

async function deleteAuthFiles(): Promise<void> {
  console.log("\n[Teardown]");
  try {
    const files: string[] = await fs.readdir(authDir);

    for (const file of files) {
      const filePath: string = path.join(authDir, file);
      await fs.unlink(filePath);
      console.log(`File ${file} has been deleted successfully.`);
    }
  } catch (err) {
    console.error("Error delete files:", err);
  }
}

export default deleteAuthFiles;
