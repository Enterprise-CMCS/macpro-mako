export function validateEnvVariable(variableName: string): string {
  const value = process.env[variableName];
  if (!value) {
    throw new Error(
      `Environment variable ${variableName} is required but not set`,
    );
  }
  return value;
}
