import {
  Alert,
  CardWithTopBorder,
  ConfirmationModal,
  ErrorAlert,
  LoadingSpinner,
} from "@/components";
import { useGetUser } from "@/api/useGetUser";
import { Action, opensearch, UserRoles } from "shared-types";
import { useQuery } from "@/hooks";
import { useGetItem } from "@/api";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { mapActionLabel } from "@/utils";
import { Outlet, useLocation } from "react-router-dom";
import { useGetPackageActions } from "@/api/useGetPackageActions";
import { PropsWithChildren, useState } from "react";
import { detailsAndActionsCrumbs } from "@/pages/actions/actions-breadcrumbs";
import { API } from "aws-amplify";
import { getStatus } from "shared-types/statusHelper";
import { Link } from "@/components/Routing";
import { PackageActivities } from "./package-activity";
import { AdminChanges } from "./admin-changes";

import { PackageDetails } from "./package-details";

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
const PackageActionsCard = ({ id }: { id: string }) => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useGetPackageActions(id, { retry: false });
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
            })}
          </ul>
        )}
      </div>

      {/* Withdraw Modal */}
      <ConfirmationModal
        open={isWithdrawModalOpen}
        onAccept={async () => {
          setIsWithdrawModalOpen(false);
          const dataToSubmit = {
            id,
          };
          try {
            setIsLoading(true);
            await API.post("os", `/action/${Action.WITHDRAW_RAI}`, {
              body: dataToSubmit,
            });
            setIsLoading(false);
            setIsWithdrawModalOpen(false); // probably want a success modal?
            setIsSuccessModalOpen(true);
          } catch (err) {
            setIsLoading(false);
            setIsErrorModalOpen(true);
            console.log(err); // probably want an error modal?
          }
        }}
        onCancel={() => setIsWithdrawModalOpen(false)}
        title="Withdraw RAI"
        body={
          <p>
            Are you sure you would like to withdraw the RAI response for{" "}
            <em>{id}</em>?
          </p>
        }
      />

      {/* Withdraw Success Modal */}
      <ConfirmationModal
        open={isSuccessModalOpen}
        onAccept={async () => {
          setIsSuccessModalOpen(false);
        }}
        onCancel={() => setIsSuccessModalOpen(false)}
        title="Withdraw RAI Successful"
      />

      {/* Withdraw Error Modal */}
      <ConfirmationModal
        open={isErrorModalOpen}
        onAccept={async () => {
          setIsErrorModalOpen(false);
        }}
        onCancel={() => setIsErrorModalOpen(false)}
        title="Failed to Withdraw"
        body="RAI withdraw failed"
      />
    </DetailCardWrapper>
  );
};

export const DetailsContent = ({
  data,
}: {
  data?: opensearch.main.ItemResult;
}) => {
  const { state } = useLocation();
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
        {/* TODO: What is callout */}
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
          <StatusCard {...data._source} />
          <PackageActionsCard id={data._id} />
        </section>
        <div className="flex flex-col gap-3">
          <PackageDetails {...data._source} />
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

  if (isLoading) return <LoadingSpinner />;
  if (!data?._source) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <>
      <div className="max-w-screen-xl mx-auto py-1 px-4 lg:px-8 flex flex-col gap-4">
        <BreadCrumbs options={detailsAndActionsCrumbs({ id })} />
        <DetailsContent data={data} />
      </div>
    </>
  );
};

export const PackageDetailsWrapper = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};
