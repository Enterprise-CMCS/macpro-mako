import { useGetUser } from "@/api";
import { opensearch, getStatus, UserRoles } from "shared-types";
import { DetailCardWrapper } from "..";

export const PackageStatusCard = (data: opensearch.main.Document) => {
  const transformedStatuses = getStatus(data.seatoolStatus);
  const { data: user } = useGetUser();
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
          {data.raiWithdrawEnabled && (
            <div className="flex flex-row gap-1">
              <p className="text-xs font-bold opacity-80">·</p>
              <p className="text-xs opacity-80">
                Withdraw Formal RAI Response - Enabled
              </p>
            </div>
          )}

          {user?.isCms && data.secondClock && (
            <div className="flex flex-row gap-1">
              <p className="text-xs font-bold opacity-80">·</p>
              <p className="text-xs opacity-80">2nd Clock</p>
            </div>
          )}

          {user?.isCms && data.initialIntakeNeeded && (
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
