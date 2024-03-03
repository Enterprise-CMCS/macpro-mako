import { CardWithTopBorder, ErrorAlert, LoadingSpinner } from "@/components";
import { useGetUser } from "@/api/useGetUser";
import { Authority, opensearch, UserRoles } from "shared-types";
import { useQuery } from "@/hooks";
import { useGetItem } from "@/api";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { mapActionLabel } from "@/utils";
import { Outlet } from "react-router-dom";
import { useGetPackageActions } from "@/api/useGetPackageActions";
import { PropsWithChildren } from "react";

import { getStatus } from "shared-types/statusHelper";
import { Link } from "@/components/Routing";
import { PackageActivities } from "./package-activity";
import { AdminChanges } from "./admin-changes";
import { useLocation } from "react-router-dom";

import { PackageDetails } from "./package-details";
import { detailsAndActionsCrumbs } from "../actions";

const DetailCardWrapper = ({
  title,
  children,
}: PropsWithChildren<{
  title: string;
}>) => (
  <CardWithTopBorder>
    <div className="p-4 min-w-80 min-h-36">
      <h2>{title}</h2>
      {children}
    </div>
  </CardWithTopBorder>
);

const PackageActionsCard = ({
  id,
  authority,
}: {
  id: string;
  authority: Authority;
}) => {
  const location = useLocation();
  const { data, isLoading } = useGetPackageActions(id, { retry: false });
  if (isLoading) return <LoadingSpinner />;

  return (
    <DetailCardWrapper title={"Package Actions"}>
      <div>
        {!data || !data.actions.length ? (
          <em className="text-gray-400 my-4">
            No actions are currently available for this submission.
          </em>
        ) : (
          <ul className="my-4">
            {data.actions.map((type, idx) => {
              if (authority === Authority["1915b"]) {
                return (
                  <Link
                    state={{ from: `${location.pathname}${location.search}` }}
                    path="/action/:authority/:id/:type"
                    key={`${idx}-${type}`}
                    params={{ id, type, authority }}
                    className="text-sky-700 font-semibold"
                  >
                    <li>{mapActionLabel(type)}</li>
                  </Link>
                );
              } else {
                return (
                  <Link
                    key={`${idx}-${type}`}
                    path="/action/:id/:type"
                    params={{ id, type }}
                    className="text-sky-700 font-semibold"
                  >
                    <li>{mapActionLabel(type)}</li>
                  </Link>
                );
              }
            })}
          </ul>
        )}
      </div>
    </DetailCardWrapper>
  );
};

const PackageStatusCard = (data: opensearch.main.Document) => {
  const transformedStatuses = getStatus(data.seatoolStatus);
  const { data: user } = useGetUser();
  return (
    <DetailCardWrapper title={"Package Status"}>
      <div className="block md:flex my-3 max-w-2xl font-bold text-xl">
        {user?.isCms &&
        !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
          ? transformedStatuses.cmsStatus
          : transformedStatuses.stateStatus}
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

export const DetailsContent = ({
  data,
}: {
  data?: opensearch.main.ItemResult;
}) => {
  if (!data?._source) return <LoadingSpinner />;
  return (
    <div className="w-full py-1 px-4 lg:px-8">
      <section
        id="package-overview"
        className="block md:flex space-x-0 md:space-x-8"
      >
        <PackageStatusCard {...data._source} />
        <PackageActionsCard id={data._id} authority={data._source.authority!} />
      </section>
      <div className="flex flex-col gap-3 ">
        <PackageDetails {...data._source} />
        <PackageActivities {...data._source} />
        <AdminChanges {...data._source} />
      </div>
    </div>
  );
};

const DetailsSidebar = ({ data }: { data: opensearch.main.ItemResult }) => {
  return (
    <aside className="min-w-56 flex-none font-semibold m-4 mt-6 pr-8">
      {[
        "Package Overview",
        "Package Details",
        "Package Activity",
        "Change History",
      ].map((val) => (
        <a
          className="block mb-2 text-blue-900"
          key={val}
          href={`?id=${encodeURIComponent(data._id)}#${val
            .toLowerCase()
            .split(" ")
            .join("-")}`}
        >
          {val}
        </a>
      ))}
    </aside>
  );
};

export const Details = () => {
  const query = useQuery();
  const id = query.get("id") as string;
  const { data, isLoading, error } = useGetItem(id);

  if (isLoading) return <LoadingSpinner />;
  if (!data?._source) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <div className="max-w-screen-xl mx-auto flex px-4 lg:px-8">
      <div className="hidden lg:block">
        <BreadCrumbs options={detailsAndActionsCrumbs({ id })} />
        <DetailsSidebar data={data} />
      </div>
      <DetailsContent data={data} />
    </div>
  );
};

export const PackageDetailsWrapper = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};
