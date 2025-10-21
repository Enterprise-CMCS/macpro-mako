import { opensearch, SEATOOL_STATUS } from "shared-types";
import { isCmsUser, isHelpDeskUser } from "shared-utils";

import { useGetUser } from "@/api";

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
  const isInActiveSecondClockStatus = isCmsUser(user.user) && submission.secondClock;

  return (
    <dl className="my-3 font-bold text-xl" aria-labelledby="package-status-heading">
      <dt>
        {isCmsUser(user.user) && isHelpDeskUser(user.user) === false
          ? submission.cmsStatus
          : submission.stateStatus}
      </dt>
      <dd className="text-xs opacity-80">
        <ul>
          {isInRAIWithdrawEnabledSubStatus && (
            <li>
              <p className="mt-1">
                <span className="font-bold mr-1">·</span>
                <span>Withdraw Formal RAI Response - Enabled</span>
              </p>
            </li>
          )}
          {isInActiveSecondClockStatus && (
            <li>
              <p className="mt-1">
                <span className="font-bold mr-1">·</span>
                <span>2nd Clock</span>
              </p>
            </li>
          )}
        </ul>
      </dd>
    </dl>
  );
};
