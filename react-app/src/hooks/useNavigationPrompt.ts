import { type MutableRefObject, useCallback, useEffect } from "react";
import { type BlockerFunction, useBlocker } from "react-router";

import { UserPrompt, userPrompt } from "@/components";

export function useNavigationPrompt({
  shouldBlock,
  prompt,
  shouldSkipBlockingRef,
}: {
  shouldBlock: boolean;
  prompt: Omit<UserPrompt, "onAccept">;
  shouldSkipBlockingRef?: MutableRefObject<boolean>;
}) {
  const shouldBlockNavigation = useCallback<BlockerFunction>(() => {
    if (shouldSkipBlockingRef?.current) {
      shouldSkipBlockingRef.current = false;
      return false;
    }

    return shouldBlock;
  }, [shouldBlock, shouldSkipBlockingRef]);
  const blocker = useBlocker(shouldBlockNavigation);

  useEffect(() => {
    if (blocker?.state === "blocked") {
      if (shouldSkipBlockingRef?.current) {
        shouldSkipBlockingRef.current = false;
        blocker.proceed?.();
        return;
      }

      userPrompt({
        ...prompt,
        onAccept: () => {
          blocker.proceed?.();
        },
        onCancel: () => {
          blocker.reset?.();
        },
      });
    }
  }, [blocker?.state, blocker, prompt, shouldSkipBlockingRef]);
}
