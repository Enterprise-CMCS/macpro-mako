import { Navigate, RouteObject } from "react-router-dom";
import { ActionForm } from "./ActionForm";
import { ToggleRaiResponseWithdraw } from "./ToggleRaiResponseWithdraw";
import { TemporaryExtension } from "./TemporaryExtension";
import { ActionPage } from "./ActionPage";
import { UpdateId } from "./UpdateId";
import { CompleteIntake } from "./CompleteIntake";

// export const packageActionRoutes: RouteObject = {
//   path: "/action/:authority/:id",
//   element: <ActionWrapper />,
//   children: [
//     {
//       path: "issue-rai",
//       element: <ActionForm />,
//     },
//     {
//       path: "withdraw-rai",
//       element: <ActionForm />,
//     },
//     {
//       path: "enable-rai-withdraw",
//       element: <ToggleRaiResponseWithdraw isEnabled />,
//     },
//     {
//       path: "disable-rai-withdraw",
//       element: <ToggleRaiResponseWithdraw isEnabled={false} />,
//     },
//     {
//       path: "withdraw-package",
//       element: <ActionForm />,
//     },
//     {
//       path: "respond-to-rai",
//       element: <ActionForm />,
//     },
//     {
//       path: "temporary-extension",
//       element: <TemporaryExtension />,
//     },
//     {
//       path: "update-id",
//       element: <UpdateId />,
//     },
//     {
//       path: "complete-intake",
//       element: <CompleteIntake />,
//     },
//     {
//       path: "*",
//       element: <Navigate to="/" />,
//     },
//   ],
// };
//
export * from "./ActionPage";
