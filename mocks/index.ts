async function initMocks() {
  if (process.env.NODE_ENV !== "production") {
    if (typeof window === "undefined") {
      const { mockedServer } = await import("./server");
      console.log("Starting mock for server...");
      mockedServer.listen();
    } else {
      const { mockedWorker } = await import("./browser");
      console.log("Starting mock for browser...");
      mockedWorker.start();
    }
  }
}

initMocks();

export {};
