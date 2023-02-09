import { Outlet, ReactLocation, Router } from "@tanstack/react-location";
import { ReactLocationDevtools } from "@tanstack/react-location-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

const location = new ReactLocation();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router location={location} routes={[{ path: "/", element: <App /> }]}>
      <ReactLocationDevtools initialIsOpen={false} />
      <Outlet />
    </Router>
  </React.StrictMode>
);
