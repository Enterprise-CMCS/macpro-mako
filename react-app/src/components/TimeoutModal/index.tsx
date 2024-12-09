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
import { useIdle, useCountdown } from "@/hooks";
import { useGetUser } from "@/api";
import { intervalToDuration } from "date-fns";
import pluralize from "pluralize";
import { DialogDescription } from "@radix-ui/react-dialog";

const TWENTY_MINS_IN_MILS = 1000 * 60 * 20;
const TEN_MINS_IN_MILS = 60 * 10;

export const TimeoutModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isIdleForTwentyMins = useIdle(TWENTY_MINS_IN_MILS, {
    initialState: false,
  });

  const [timeoutModalCountdown, { startCountdown, resetCountdown }] =
    useCountdown(TEN_MINS_IN_MILS);
  const { data: user, isLoading: isUserLoading } = useGetUser();

  const onLogOut = () => {
    setIsModalOpen(false);
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
  }, [isIdleForTwentyMins, user, isUserLoading, startCountdown]);

  const duration = intervalToDuration({
    start: 0,
    end: timeoutModalCountdown * 1000,
  });

  return (
    <Dialog open={isModalOpen} onOpenChange={onExtendSession}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogDescription>Session expiring soon</DialogDescription>
        <DialogHeader>
          <DialogTitle>Session expiring soon</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <span>
            Your session will expire in <strong>{duration.minutes}</strong>{" "}
            {pluralize("minute", duration.minutes)} and <strong>{duration.seconds}</strong>{" "}
            {pluralize("second", duration.seconds)}.
          </span>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onExtendSession}>
            Yes, extend session
          </Button>
          <Button type="button" variant="outline" onClick={onLogOut}>
            No, sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
