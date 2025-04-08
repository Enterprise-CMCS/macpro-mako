import { opensearch, SEATOOL_STATUS } from "shared-types";
import { isCmsUser, isHelpDeskUser } from "shared-utils";

import { useGetUser } from "@/api";

import { DetailCardWrapper } from "../index";

type PackageStatusCardProps = {
  submission: opensearch.main.Document;
};

export const PackageStatusCard = ({ submission }: PackageStatusCardProps) => {
  const { data: user } = useGetUser();

  // This really a check to determine if we should show the status of an RAI Withdraw being enabled
  // We have a flag that we monitor but there are certain things that can be done outside of onemac,
  // specifically in seatool that will invalidate the raiWithdrawEnabled flag such as the two statuses
  // below (Pending Approval, and Pending Concurrence). In the future we should build logic into the
  // seatool sink that allows us to simply clear these flags
  const isInRAIWithdrawEnabledSubStatus =
    submission.raiWithdrawEnabled &&
    submission.seatoolStatus !== SEATOOL_STATUS.PENDING_APPROVAL &&
    submission.seatoolStatus !== SEATOOL_STATUS.PENDING_CONCURRENCE;

  // Similar to the above check their are certain things that occur in seatool that invalidate the secondClock
  // flag. Additionally second clock sub status only displays for CMS users
  const isInActiveSecondClockStatus =
    isCmsUser(user.user) &&
    submission.secondClock &&
    submission.seatoolStatus !== SEATOOL_STATUS.PENDING_APPROVAL &&
    submission.seatoolStatus !== SEATOOL_STATUS.PENDING_CONCURRENCE;

  return (
    <DetailCardWrapper title="Status">
      <div className="my-3 max-w-2xl font-bold text-xl">
        <div>
          {isCmsUser(user.user) && isHelpDeskUser(user.user) === false
            ? submission.cmsStatus
            : submission.stateStatus}
        </div>
        <div className="flex mt-1 flex-col gap-1 items-start">
          {isInRAIWithdrawEnabledSubStatus && (
            <div className="flex flex-row gap-1">
              <p className="text-xs font-bold opacity-80">·</p>
              <p className="text-xs opacity-80">Withdraw Formal RAI Response - Enabled</p>
            </div>
          )}

          {isInActiveSecondClockStatus && (
            <div className="flex flex-row gap-1">
              <p className="text-xs font-bold opacity-80">·</p>
              <p className="text-xs opacity-80">2nd Clock</p>
            </div>
          )}
        </div>
      </div>
    </DetailCardWrapper>
  );
};
