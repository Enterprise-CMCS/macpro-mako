// credit: https://usehooks-ts.com/react-hook/use-countdown

import { useCallback, useEffect, useState } from "react";

type CountdownControllers = {
  startCountdown: () => void;
  stopCountdown: () => void;
  resetCountdown: () => void;
};

export const useCountdown = (
  countStart: number,
): [number, CountdownControllers] => {
  const [count, setCount] = useState<number>(countStart);
  const [isCountdownRunning, setIsCountdownRunning] = useState<boolean>(false);

  const startCountdown = () => {
    setIsCountdownRunning(true);
  };

  const stopCountdown = () => {
    setIsCountdownRunning(false);
  };

  // Will set running false and reset the seconds to initial value
  const resetCountdown = useCallback(() => {
    stopCountdown();
    setCount(countStart);
  }, [stopCountdown]);

  const countdownCallback = useCallback(() => {
    if (count === 0) {
      stopCountdown();
      return;
    }

    setCount((oldCount) => oldCount - 1);
  }, [count, stopCountdown]);

  useEffect(() => {
    if (isCountdownRunning === false) {
      return;
    }

    const id = setInterval(() => {
      countdownCallback();
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [isCountdownRunning, countdownCallback]);

  return [count, { startCountdown, stopCountdown, resetCountdown }];
};
