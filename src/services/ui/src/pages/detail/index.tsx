import {
  AdditionalInfo,
  Alert,
  Attachmentslist,
  CardWithTopBorder,
  SpaPackageDetails,
  DetailsSection,
  ErrorAlert,
  LoadingSpinner,
  RaiList,
  SubmissionInfo,
} from "@/components";
import { useGetUser } from "@/api/useGetUser";
import { ItemResult, UserRoles } from "shared-types";
import { useQuery } from "@/hooks";
import { useGetItem } from "@/api";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { mapActionLabel } from "@/utils";
import { Link, useLocation } from "react-router-dom";
import { useGetPackageActions } from "@/api/useGetPackageActions";
import { PropsWithChildren } from "react";
import { DETAILS_AND_ACTIONS_CRUMBS } from "@/pages/actions/actions-breadcrumbs";

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
const StatusCard = ({
  status,
  raiWithdrawEnabled,
}: {
  status: string;
  raiWithdrawEnabled: boolean;
}) => (
  <DetailCardWrapper title={"Status"}>
    <div>
      <h2 className="text-xl font-semibold">{status}</h2>
      {raiWithdrawEnabled && (
        <em className="text-xs">{"Withdraw Formal RAI Response - Enabled"}</em>
      )}
    </div>
  </DetailCardWrapper>
);
const PackageActionsCard = ({ id }: { id: string }) => {
  const { data, error } = useGetPackageActions(id);
  if (!data?.actions || error) return <LoadingSpinner />;
  return (
    <DetailCardWrapper title={"Actions"}>
      <div>
        {!data.actions.length ? (
          <em className="text-gray-400">
            No actions are currently available for this submission.
          </em>
        ) : (
          <ul>
            {data.actions.map((action, idx) => (
              <Link
                className="text-sky-500 underline"
                to={`/action/${id}/${action}`}
                key={`${idx}-${action}`}
              >
                <li>{mapActionLabel(action)}</li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </DetailCardWrapper>
  );
};

export const DetailsContent = ({ data }: { data?: ItemResult }) => {
  const { data: user } = useGetUser();
  const { state } = useLocation();
  if (!data?._source) return <LoadingSpinner />;
  const status =
    user?.isCms && !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
      ? data._source.cmsStatus
      : data._source.stateStatus;
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
        {state?.callout && (
          <Alert className="bg-green-100 border-green-400" variant="default">
            <h2 className="text-lg font-bold text-green-900">
              {state.callout.heading}
            </h2>
            <p className="text-green-900">{state.callout.body}</p>
          </Alert>
        )}
        <section
          id="package-overview"
          className="sm:flex lg:grid lg:grid-cols-2 gap-4 my-6"
        >
          <StatusCard
            status={status}
            raiWithdrawEnabled={data._source?.raiWithdrawEnabled || false}
          />
          <PackageActionsCard id={data._id} />
        </section>
        <DetailsSection id="package-details" title="Package Details">
          <SpaPackageDetails {...data?._source} />
        </DetailsSection>
        <SubmissionInfo {...data?._source} />
        {/* Below is used for spacing. Keep it simple */}
        <div className="mb-4" />
        <DetailsSection id="attachments" title="Attachments">
          <Attachmentslist {...data?._source} />
        </DetailsSection>
        <DetailsSection id="additional-info" title="Additional Information">
          <AdditionalInfo
            additionalInformation={data?._source.additionalInformation}
          />
        </DetailsSection>
        <RaiList {...data?._source} />
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
      {/* <DetailNav id={id} type={data?._source.planType} /> */}
      <div className="max-w-screen-xl mx-auto py-1 px-4 lg:px-8 flex flex-col gap-4">
        <BreadCrumbs options={DETAILS_AND_ACTIONS_CRUMBS({ id })} />
        <DetailsContent data={data} />
      </div>
    </>
  );
};
