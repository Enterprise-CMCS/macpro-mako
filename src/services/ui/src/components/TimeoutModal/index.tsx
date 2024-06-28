import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components";
import { Auth } from "aws-amplify";
import { useIdle } from "@/hooks/useIdle";
import { useGetUser } from "@/api";
import { useCountdown } from "@/hooks/useCountdown";
import { intervalToDuration } from "date-fns";
import pluralize from "pluralize";

const TWENTY_MINS_IN_MILS = 1000 * 60 * 20;
const TEMP_5_SEC_IN_MILS = 5000;
const TEN_MINS_IN_MILS = 60 * 10;

export const TimeoutModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isIdleForTwentyMins = useIdle(TEMP_5_SEC_IN_MILS, {
    initialState: false,
  });

  const [timeoutModalCountdown, { startCountdown, resetCountdown }] =
    useCountdown(TEN_MINS_IN_MILS);
  const { data: user } = useGetUser();

  const onLogOut = () => {
    Auth.signOut();
  };

  const onExtendSession = () => {
    setIsModalOpen(false);

    // artificial delay hiding the countdown reset after modal dismissal
    setTimeout(() => {
      resetCountdown();
    }, 500);
  };

  useEffect(() => {
    if (timeoutModalCountdown === 0) {
      onLogOut();
    }
  }, [timeoutModalCountdown]);

  useEffect(() => {
    if (user?.user && isIdleForTwentyMins) {
      startCountdown();
      setIsModalOpen(true);
    }
  }, [isIdleForTwentyMins]);

  const duration = intervalToDuration({
    start: 0,
    end: timeoutModalCountdown * 1000,
  });

  return (
    <Dialog open={isModalOpen} onOpenChange={onExtendSession}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Session expiring soon</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <span>
            Due to inactivity, you&#39;ll be automatically logged out in{" "}
            <strong>{duration.minutes}</strong>{" "}
            {pluralize("minute", duration.minutes)} and{" "}
            <strong>{duration.seconds}</strong>{" "}
            {pluralize("second", duration.seconds)}.
          </span>
          <br />
          <span className="inline-block pt-4">
            Do you want to stay logged in?
          </span>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onLogOut}>
            No, log out
          </Button>

          <Button type="submit" onClick={onExtendSession}>
            Yes, extend session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
