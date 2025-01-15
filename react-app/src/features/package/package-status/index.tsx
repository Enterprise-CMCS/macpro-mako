import { useGetItem, useGetUser } from "@/api";
import { SEATOOL_STATUS, UserRoles } from "shared-types";
import { DetailCardWrapper } from "..";
import { FC } from "react";

export const PackageStatusCard: FC<{ id: string }> = ({ id }) => {
  const { data } = useGetItem(id);
  const { data: user } = useGetUser();

  if (!data) return null;

  // This really a check to determine if we should show the status of an RAI Withdraw being enabled
  // We have a flag that we monitor but there are certain things that can be done outside of onemac,
  // specifically in seatool that will invalidate the raiWithdrawEnabled flag such as the two statuses
  // below (Pending Approval, and Pending Concurrence). In the future we should build logic into the
  // seatool sink that allows us to simply clear these flags
  const isInRAIWithdrawEnabledSubStatus =
    data._source.raiWithdrawEnabled &&
    data._source.seatoolStatus !== SEATOOL_STATUS.PENDING_APPROVAL &&
    data._source.seatoolStatus !== SEATOOL_STATUS.PENDING_CONCURRENCE;

  // Similar to the above check their are certain things that occur in seatool that invalidate the secondClock
  // flag. Additionally second clock sub status only displays for CMS users
  const isInActiveSecondClockStatus =
    user?.isCms &&
    data._source.secondClock &&
    data._source.seatoolStatus !== SEATOOL_STATUS.PENDING_APPROVAL &&
    data._source.seatoolStatus !== SEATOOL_STATUS.PENDING_CONCURRENCE;

  return (
    <DetailCardWrapper title={"Status"}>
      <div className="my-3 max-w-2xl font-bold text-xl">
        <div>
          {user?.isCms && !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
            ? data?._source.cmsStatus
            : data?._source.stateStatus}
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
