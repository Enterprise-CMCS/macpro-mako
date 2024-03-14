import { useGetItem, useGetUser } from "@/api";
import { getStatus, UserRoles } from "shared-types";
import { DetailCardWrapper } from "..";
import { FC } from "react";

export const PackageStatusCard: FC<{ id: string }> = ({ id }) => {
  const { data } = useGetItem(id);
  const transformedStatuses = getStatus(data?._source.seatoolStatus);
  const { data: user } = useGetUser();

  if (!data) return null;

  return (
    <DetailCardWrapper title={"Status"}>
      <div className="my-3 max-w-2xl font-bold text-xl">
        <div>
          {user?.isCms &&
          !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
            ? transformedStatuses.cmsStatus
            : transformedStatuses.stateStatus}
        </div>
        <div className="flex mt-1 flex-col gap-1 items-start">
          {data._source.raiWithdrawEnabled && (
            <div className="flex flex-row gap-1">
              <p className="text-xs font-bold opacity-80">·</p>
              <p className="text-xs opacity-80">
                Withdraw Formal RAI Response - Enabled
              </p>
            </div>
          )}

          {user?.isCms && data._source.secondClock && (
            <div className="flex flex-row gap-1">
              <p className="text-xs font-bold opacity-80">·</p>
              <p className="text-xs opacity-80">2nd Clock</p>
            </div>
          )}

          {user?.isCms && data._source.initialIntakeNeeded && (
            <div className="flex flex-row gap-1">
              <p className="text-xs font-bold opacity-80">·</p>
              <p className="text-xs opacity-80">Initial Intake Needed</p>
            </div>
          )}
        </div>
      </div>
    </DetailCardWrapper>
  );
};
