import { useEffect } from "react";
import { useBlocker } from "react-router";

import { UserPrompt, userPrompt } from "@/components";

export function useNavigationPrompt({
  shouldBlock,
  prompt,
}: {
  shouldBlock: boolean;
  prompt: Omit<UserPrompt, "onAccept">;
}) {
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state === "blocked") {
      userPrompt({
        ...prompt,
        onAccept: () => {
          blocker.proceed?.();
        },
      });
    }
  }, [blocker.state, blocker, prompt]);
}
