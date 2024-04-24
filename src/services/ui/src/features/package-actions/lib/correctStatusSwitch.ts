import { type getItem } from "@/api";
import { Action } from "shared-types";

export const getStatusFor = (a: Action) => {
  const actionContentMap: Record<
    string,
    (data: Awaited<ReturnType<typeof getItem>>) => boolean
  > = {
    "issue-rai": (data) => false,
    "respond-to-rai": (data) => false,
    "enable-rai-withdraw": (data) => false,
    "disable-rai-withdraw": (data) => false,
    "withdraw-rai": (data) => false,
    "withdraw-package": (data) => false,
    "temporary-extension": (data) => false,
    "update-id": (data) => false,
    "complete-intake": (data) => false,
  };
  const group = actionContentMap?.[a];
  if (!group) throw new Error(`No content group for "${a}"`);
  return group;
};
