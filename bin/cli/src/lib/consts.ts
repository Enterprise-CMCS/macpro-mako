import { execSync } from "child_process";

export let branchName;

try {
  const branchOutput = execSync("git rev-parse --abbrev-ref HEAD", {
    encoding: "utf-8",
  });
  branchName = branchOutput.trim();
} catch (error) {
  console.error("Error getting current branch:", error);
  throw error;
}

if (!process.env.PROJECT) {
  throw new Error("PROJECT environment variable is required but not set");
}
export const project = process.env.PROJECT;

if (!process.env.REGION_A) {
  throw new Error("REGION_A environment variable is required but not set");
}
export const region = process.env.REGION_A;
