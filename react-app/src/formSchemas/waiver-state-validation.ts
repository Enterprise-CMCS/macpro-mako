import { z } from "zod";

import { isAuthorizedState } from "@/utils";

export const unauthorizedStateMessage =
  "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.";

export const getStatePrefixFromId = (value: string) => value.trim().toUpperCase().slice(0, 2);

const hasStatePrefix = (value: string) => /^[A-Z]{2}/.test(value.trim().toUpperCase());

export const getStatePrefixMismatchMessage = ({
  sourceId,
  sourceLabel,
  targetLabel,
}: {
  sourceId: string;
  sourceLabel: string;
  targetLabel: string;
}) =>
  `${targetLabel} must start with ${getStatePrefixFromId(sourceId)} to match the ${sourceLabel}.`;

export const getRelatedWaiverIdStatePrefixMismatchMessage = async ({
  sourceId,
  sourceLabel,
  targetId,
  targetLabel,
}: {
  sourceId: string;
  sourceLabel: string;
  targetId: string;
  targetLabel: string;
}) => {
  if (!sourceId?.trim() || !targetId?.trim() || !(await isAuthorizedState(sourceId))) {
    return null;
  }

  if (
    hasStatePrefix(sourceId) &&
    hasStatePrefix(targetId) &&
    getStatePrefixFromId(sourceId) !== getStatePrefixFromId(targetId)
  ) {
    return getStatePrefixMismatchMessage({ sourceId, sourceLabel, targetLabel });
  }

  return null;
};

export const validateRelatedWaiverId = async ({
  ctx,
  targetPath,
  ...validation
}: {
  ctx: z.RefinementCtx;
  sourceId: string;
  sourceLabel: string;
  targetId: string;
  targetLabel: string;
  targetPath: (string | number)[];
}) => {
  const message = await getRelatedWaiverIdStatePrefixMismatchMessage(validation);

  if (message) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message,
      path: targetPath,
    });
  }
};
