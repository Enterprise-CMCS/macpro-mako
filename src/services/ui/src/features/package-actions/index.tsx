import { Navigate, RouteObject } from "react-router-dom";
import {
  TemporaryExtension,
  onValidSubmission as temporaryExtensionSubmission,
} from "./TemporaryExtension";
import { ActionWrapper } from "./ActionWrapper";
import { UpdateId, onValidSubmission as updateIdSubmission } from "./UpdateId";

export const packageActionRoutes: RouteObject = {
  path: "/action/:authority/:id",
  element: <ActionWrapper />,
  children: [
    {
      path: "temporary-extension",
      element: <TemporaryExtension />,
      action: temporaryExtensionSubmission,
    },
    {
      path: "update-id",
      element: <UpdateId />,
      action: updateIdSubmission,
    },
    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ],
};

export * from "./ActionWrapper";
