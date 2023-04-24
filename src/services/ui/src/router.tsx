import { createBrowserRouter } from "react-router-dom";
import MainWrapper from "./components/MainWrapper";
import * as P from "./pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainWrapper />,
    children: [
      { path: "/issue/list", element: <P.IssueList /> },
      { path: "/issue/view/:id", element: <P.ViewIssue /> },
      { path: "/issue/new", element: <P.NewIssue /> },
    ],
  },
]);
