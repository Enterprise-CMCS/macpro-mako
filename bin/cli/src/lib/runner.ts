import { spawn, SpawnOptions } from "child_process";
import path from "path";

export async function runCommand(
  command: string,
  args: string[],
  cwd: string | null,
): Promise<void> {
  // Resolve the full path of the working directory
  const fullPath = cwd ? path.resolve(cwd) : null;

  // Print the command and arguments
  console.log(`Executing command: ${command} ${args.join(" ")}`);
  if (fullPath) {
    console.log(`Working directory: ${fullPath}`);
  }

  return new Promise((resolve, reject) => {
    const options: SpawnOptions = fullPath
      ? { cwd: fullPath, stdio: ["inherit", "inherit", "inherit"] }
      : { stdio: ["inherit", "inherit", "inherit"] };

    const proc = spawn(command, args, options);

    proc.on("error", (error) => {
      console.error(`Error: ${error.message}`);
      reject(error);
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
}
