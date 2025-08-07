import { useEffect } from "react";
import { useBlocker } from "react-router";

import { UserPrompt, userPrompt } from "@/components";

export function useNavigationPrompt({
  shouldBlock,
  prompt,
  shouldSkipBlockingRef,
}: {
  shouldBlock: boolean;
  prompt: Omit<UserPrompt, "onAccept">;
  shouldSkipBlockingRef?: React.MutableRefObject<boolean>;
}) {
  const blocker = useBlocker(shouldBlock);

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
      });
    }
  }, [blocker?.state, blocker, prompt, shouldSkipBlockingRef]);
}
