import { spawn, SpawnOptions } from "child_process";

export async function runCommand(
  command: string,
  args: string[],
  cwd: string | null,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const options: SpawnOptions = cwd
      ? { cwd, stdio: ["inherit", "inherit", "inherit"] }
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
