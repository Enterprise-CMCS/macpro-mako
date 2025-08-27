import { PropsWithChildren, useMemo } from "react";
import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router";
import { Authority, opensearch } from "shared-types";
import { ItemResult } from "shared-types/opensearch/changelog";

import { getItem, useGetItem } from "@/api";
import { CardWithTopBorder, ErrorAlert, LoadingSpinner } from "@/components";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { detailsAndActionsCrumbs, sendGAEvent } from "@/utils";

import { AdminPackageActivities } from "./admin-changes";
import { useDetailsSidebarLinks } from "./hooks";
import { PackageActionsCard } from "./package-actions";
import { PackageActivities } from "./package-activity";
import { PackageDetails } from "./package-details";
import { PackageStatusCard } from "./package-status";

export const DetailCardWrapper = ({
  title,
  children,
}: PropsWithChildren<{
  title: string;
}>) => (
  <CardWithTopBorder className="text-wrap my-0 sm:mt-6">
    <div className="p-4 py-1 min-h-36">
      <h2>{title}</h2>
      {children}
    </div>
  </CardWithTopBorder>
);

type DetailsContentProps = {
  id: string;
};

const injectChipEligibilityAttachment = (
  submission: opensearch.main.Document,
  changelog: ItemResult[],
): opensearch.main.Document => {
  const alreadyHasChipEligibility = submission.attachments?.chipEligibility?.files?.length > 0;

  if (alreadyHasChipEligibility) return submission;

  const chipEligibilityAttachment = changelog.find((item) =>
    item._source.attachments?.some((att) => att.title.toLowerCase().includes("chip eligibility")),
  );

  if (!chipEligibilityAttachment) return submission;

  const chipAttachment = chipEligibilityAttachment._source.attachments.find((att) =>
    att.title.toLowerCase().includes("chip eligibility"),
  );

  if (!chipAttachment) return submission;

  return {
    ...submission,
    attachments: {
      ...submission.attachments,
      chipEligibility: {
        files: [chipAttachment],
        label: "CHIP Eligibility Template",
      },
    },
  };
};

export const DetailsContent = ({ id }: DetailsContentProps) => {
  const { data: record, isLoading, error } = useGetItem(id);

  const submission = record?._source;
  const updatedSubmission = useMemo(() => {
    return submission
      ? injectChipEligibilityAttachment(submission, submission.changelog)
      : undefined;
  }, [submission]);

  if (isLoading) return <LoadingSpinner />;
  if (error || !record || !updatedSubmission) return <ErrorAlert error={error} />;

  return (
    <div className="w-full py-1 px-4 lg:px-8 grid grid-cols-1 gap-y-6 sm:gap-y-6">
      <section id="package_overview" className="sm:mb-0 two-cols gap-y-3 sm:gap-y-3">
        <DetailCardWrapper title="Status">
          <PackageStatusCard submission={updatedSubmission} />
        </DetailCardWrapper>
        <DetailCardWrapper title="Package Actions">
          <PackageActionsCard id={id} submission={updatedSubmission} />
        </DetailCardWrapper>
      </section>
      <div className="grid grid-cols-1 gap-y-3">
        <PackageDetails submission={updatedSubmission} />
        <PackageActivities id={id} changelog={updatedSubmission.changelog} />
        <AdminPackageActivities changelog={updatedSubmission.changelog} />
      </div>
    </div>
  );
};

type LoaderData = {
  id: string;
  authority: Authority;
};

export const packageDetailsLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<LoaderData | Response> => {
  const { id, authority } = params;
  if (id === undefined || authority === undefined) {
    return redirect("/dashboard");
  }

  try {
    const packageResult = await getItem(id);
    if (!packageResult || packageResult._source.deleted === true || packageResult.found === false) {
      return redirect("/dashboard");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error fetching package: ", error.message);
    } else {
      console.log("Unknown error fetching package: ", error);
    }
    return redirect("/dashboard");
  }

  return { id, authority: authority as Authority };
};

export const Details = () => {
  const { id, authority } = useLoaderData<LoaderData>();
  return (
    <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row">
      <div className="px-4 lg:px-8">
        <BreadCrumbs options={detailsAndActionsCrumbs({ id, authority })} />
        <div className="hidden lg:block pr-8">
          <DetailsSidebar id={id} />
        </div>
      </div>
      <DetailsContent id={id} />
    </div>
  );
};

type DetailsSidebarProps = {
  id: string;
};

const DetailsSidebar = ({ id }: DetailsSidebarProps) => {
  const links = useDetailsSidebarLinks(id);
  const handleSidebarClick = (linkId: string) => {
    if (linkId === "package_activity" || linkId === "package_details") {
      sendGAEvent("package_detail_sidebar_link_click", {
        link: linkId,
      });
    }
  };

  return (
    <aside className="min-w-56 flex-none font-semibold mt-6">
      {links.map(({ id, href, displayName }) => (
        <a
          className="block mb-2 text-blue-900 hover:underline"
          key={id}
          href={href}
          onClick={() => handleSidebarClick(id)}
        >
          {displayName}
        </a>
      ))}
    </aside>
  );
};
