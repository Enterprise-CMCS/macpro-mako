export * from "./data";
export * from "./handlers";

export { HttpResponse, http } from "msw";

export const MOCK_API_URL = "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked";

// if (process.env.NODE_ENV !== "production") {
//   if (typeof window === "undefined") {
//     const { mockedServer } = await import("./server");
//     export { mockedServer };
//     console.log("Starting mock for server...");
//   } else {
//     const { worker } = await import("./browser");
//     console.log("Starting mock for browser...");
//     worker.start();
//   }
// }
