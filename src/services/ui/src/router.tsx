import { createBrowserRouter } from "react-router-dom";
import MainWrapper from "./components/MainWrapper";
import * as P from "./pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainWrapper />,
    children: [
      { path: "/issues", element: <P.IssueList /> },
      { path: "/issues/:id", element: <P.ViewIssue /> },
    ],
  },
]);
