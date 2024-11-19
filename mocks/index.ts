export * from "./data";
export * from "./handlers";

export { HttpResponse, http } from "msw";

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
