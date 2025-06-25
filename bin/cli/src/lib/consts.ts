if (!process.env.PROJECT) {
  throw new Error("PROJECT environment variable is required but not set");
}
export const project = process.env.PROJECT;

if (!process.env.REGION_A) {
  throw new Error("REGION_A environment variable is required but not set");
}
export const region = process.env.REGION_A;
