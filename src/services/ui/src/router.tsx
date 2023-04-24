import { createBrowserRouter } from "react-router-dom";
import MainWrapper from "./components/MainWrapper";
import * as P from "./pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainWrapper />,
    children: [
      { path: "/posts", element: <P.Posts /> },
      { path: "/posts/:id", element: <P.Post /> },
    ],
  },
]);
