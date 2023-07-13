import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
// order is important on these import statements
import "@enterprise-cmcs/macpro-ux-lib/build/assets/css/index.css"; // this one first
import "./index.css"; // this one second
// end of order being important
import { router } from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
