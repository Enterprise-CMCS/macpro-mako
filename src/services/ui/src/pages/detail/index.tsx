import {
  CardWithTopBorder,
  DetailItemsGrid,
  DetailsSection,
  ErrorAlert,
  LoadingSpinner,
} from "@/components";
import { useGetUser } from "@/api/useGetUser";
import { Authority, opensearch, UserRoles } from "shared-types";
import { useQuery } from "@/hooks";
import { useGetItem } from "@/api";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { mapActionLabel } from "@/utils";
import { useGetPackageActions } from "@/api/useGetPackageActions";
import { PropsWithChildren } from "react";
import { detailsAndActionsCrumbs } from "@/pages/actions/actions-breadcrumbs";
import { getStatus } from "shared-types/statusHelper";
import { spaDetails, submissionDetails } from "@/pages/detail/setup/spa";
import { Link } from "@/components/Routing";
import { PackageActivities } from "./package-activity";
import { AdminChanges } from "./admin-changes";
import { Route } from "@/components/Routing/types";
import { useLocation } from "react-router-dom";

const DetailCardWrapper = ({
  title,
  children,
}: PropsWithChildren<{
  title: string;
}>) => (
  <CardWithTopBorder className="max-w-[18rem]">
    <div className="p-4">
      <h2>{title}</h2>
      {children}
    </div>
  </CardWithTopBorder>
);

const StatusCard = (data: opensearch.main.Document) => {
  const transformedStatuses = getStatus(data.seatoolStatus);
  const { data: user } = useGetUser();

  return (
    <DetailCardWrapper title={"Status"}>
      <div>
        <h2 className="text-xl font-semibold">
          {user?.isCms &&
          !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
            ? transformedStatuses.cmsStatus
            : transformedStatuses.stateStatus}
        </h2>
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
    <DetailCardWrapper title={"Actions"}>
      <div>
        {!data || !data.actions.length ? (
          <em className="text-gray-400">
            No actions are currently available for this submission.
          </em>
        ) : (
          <ul>
            {data.actions.map((type, idx) => {
              if (authority === Authority["1915b"]) {
                return (
                  <Link
                    state={{ from: `${location.pathname}${location.search}` }}
                    path="/action/:authority/:id/:type"
                    key={`${idx}-${type}`}
                    params={{ id, type, authority }}
                    className="text-sky-700 underline"
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
                    className="text-sky-700 underline"
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

export const DetailsContent = ({
  data,
}: {
  data?: opensearch.main.ItemResult;
}) => {
  if (!data?._source) return <LoadingSpinner />;
  return (
    <div className="block md:flex">
      <aside className="flex-none font-bold hidden md:block pr-8">
        {[
          "Package Overview",
          "Package Details",
          "Attachments",
          "Additional Info",
        ].map((val) => (
          <a
            className="block mb-4 text-primary"
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
      <div className="flex-1">
        <section
          id="package-overview"
          className="sm:flex lg:grid lg:grid-cols-2 gap-4 my-6"
        >
          <StatusCard {...data._source} />
          <PackageActionsCard
            id={data._id}
            authority={data._source.authority!}
          />
        </section>
        <div className="flex flex-col gap-3">
          <DetailsSection
            id="package-details"
            title={`${data._source.authority} Package Details`}
          >
            <DetailItemsGrid displayItems={spaDetails(data._source)} />
            <DetailItemsGrid displayItems={submissionDetails(data._source)} />
          </DetailsSection>
          <PackageActivities {...data._source} />
          <AdminChanges {...data._source} />
        </div>
      </div>
    </div>
  );
};

export const Details = () => {
  const query = useQuery();
  const id = query.get("id") as string;
  const { data, isLoading, error } = useGetItem(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <>
      <div className="max-w-screen-xl mx-auto py-1 px-4 lg:px-8 flex flex-col gap-4">
        <BreadCrumbs options={detailsAndActionsCrumbs({ id })} />
        <DetailsContent data={data} />
      </div>
    </>
  );
};
