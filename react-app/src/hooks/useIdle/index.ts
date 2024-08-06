// credit: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/hooks/src/use-idle/use-idle.ts

import { useEffect, useRef, useState } from "react";

const DEFAULT_EVENTS: (keyof DocumentEventMap)[] = [
  "keypress",
  "mousemove",
  "touchmove",
  "click",
  "scroll",
];
const DEFAULT_OPTIONS = {
  events: DEFAULT_EVENTS,
  initialState: true,
};

export function useIdle(
  timeout: number,
  options?: Partial<{
    events: (keyof DocumentEventMap)[];
    initialState: boolean;
  }>,
) {
  const { events, initialState } = { ...DEFAULT_OPTIONS, ...options };
  const [idle, setIdle] = useState<boolean>(initialState);
  const timer = useRef<number>();

  // start tracking idleness on useIdle mount
  useEffect(() => {
    timer.current = window.setTimeout(() => {
      setIdle(true);
    }, timeout);
  }, [timeout, events]);

  useEffect(() => {
    const handleEvents = () => {
      setIdle(false);

      if (timer.current) {
        window.clearTimeout(timer.current);
      }

      timer.current = window.setTimeout(() => {
        setIdle(true);
      }, timeout);
    };

    events.forEach((event) => document.addEventListener(event, handleEvents));

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleEvents),
      );
    };
  }, [timeout]);

  return idle;
}
