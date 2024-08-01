export function validateEnvVariable(variableName: string): string {
  const value = process.env[variableName];
  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `ERROR: Environment variable ${variableName} must be set and be a non-empty string.`,
    );
  }
  return value;
}
