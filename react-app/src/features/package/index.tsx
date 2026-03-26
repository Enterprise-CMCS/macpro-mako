import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren, useMemo } from "react";
import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router";
import { Authority, opensearch, SEATOOL_STATUS } from "shared-types";
import { ItemResult } from "shared-types/opensearch/changelog";
import { isHelpDeskUser } from "shared-utils";

import { getItem, itemExists, useGetItem, useGetUserDetails } from "@/api";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  CardWithTopBorder,
  ErrorAlert,
  LoadingSpinner,
} from "@/components";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { detailsAndActionsCrumbs, sendGAEvent } from "@/utils";
import { DRAFT_LOCKED_ALERT_TITLE, getDraftLockedMessage } from "@/utils/drafts";

import { AdminPackageActivities } from "./admin-changes";
import { useDetailsSidebarLinks } from "./hooks";
import { PackageActionsCard } from "./package-actions";
import { PackageActivities } from "./package-activity";
import { PackageDetails } from "./package-details";
import { PackageStatusCard } from "./package-status";

export const DetailCardWrapper = ({
  title,
  children,
  ariaLabel,
}: PropsWithChildren<{
  title: string;
  ariaLabel?: string;
}>) => (
  <CardWithTopBorder className="text-wrap my-0 sm:mt-6">
    <div className="p-4 py-1 min-h-36">
      <h2 id={ariaLabel}>{title}</h2>
      {children}
    </div>
  </CardWithTopBorder>
);

type DetailsContentProps = {
  id: string;
  preferDraft?: boolean;
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

export const DetailsContent = ({ id, preferDraft = false }: DetailsContentProps) => {
  const {
    data: record,
    isLoading,
    error,
  } = useGetItem(id, undefined, {
    includeDraft: true,
    preferDraft,
  });

  const submission = record?._source;
  const normalizedSubmission = useMemo(
    () => (submission ? { ...submission, changelog: submission.changelog ?? [] } : undefined),
    [submission],
  );
  const updatedSubmission = useMemo(() => {
    return normalizedSubmission
      ? injectChipEligibilityAttachment(normalizedSubmission, normalizedSubmission.changelog)
      : undefined;
  }, [normalizedSubmission]);
  const isDraft = updatedSubmission?.seatoolStatus === SEATOOL_STATUS.DRAFT;
  const { data: hasConflictingMainPackage = false, isLoading: isDraftConflictLoading } = useQuery({
    queryKey: ["draft-main-conflict", id],
    queryFn: () => itemExists(id),
    enabled: isDraft,
  });
  const isLockedDraft = isDraft && hasConflictingMainPackage;
  const { data: userObj } = useGetUserDetails();

  if (isLoading || (isDraft && isDraftConflictLoading)) return <LoadingSpinner />;
  if (error || !record || !updatedSubmission) return <ErrorAlert error={error} />;

  return (
    <div className="w-full py-1 px-4 lg:px-8 grid grid-cols-1 gap-y-6 sm:gap-y-6">
      {isLockedDraft && !isHelpDeskUser(userObj) && (
        <Alert variant="destructive">
          <AlertTitle>{DRAFT_LOCKED_ALERT_TITLE}</AlertTitle>
          <AlertDescription>{getDraftLockedMessage(id)}</AlertDescription>
        </Alert>
      )}
      <section id="package_overview" className="sm:mb-0 two-cols gap-y-3 sm:gap-y-3">
        <DetailCardWrapper title="Status" ariaLabel="package-status-heading">
          <PackageStatusCard submission={updatedSubmission} />
        </DetailCardWrapper>
        <DetailCardWrapper title="Package Actions" ariaLabel="package-actions-heading">
          <PackageActionsCard
            id={id}
            submission={updatedSubmission}
            isLockedDraft={isLockedDraft}
          />
        </DetailCardWrapper>
      </section>
      <div className="grid grid-cols-1 gap-y-3">
        <PackageDetails submission={updatedSubmission} />
        <PackageActivities
          id={id}
          changelog={updatedSubmission.changelog}
          submission={updatedSubmission}
        />
        <AdminPackageActivities changelog={updatedSubmission.changelog} />
      </div>
    </div>
  );
};

type LoaderData = {
  id: string;
  authority: Authority;
  preferDraft: boolean;
};

export const packageDetailsLoader = async ({
  params,
  request,
}: LoaderFunctionArgs): Promise<LoaderData | Response> => {
  const { id, authority } = params;
  if (id === undefined || authority === undefined) {
    return redirect("/dashboard");
  }

  const preferDraft = new URL(request.url).searchParams.get("preferDraft") === "true";

  try {
    const packageResult = await getItem(id, { includeDraft: true, preferDraft });
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

  return { id, authority: authority as Authority, preferDraft };
};

export const Details = () => {
  const { id, authority, preferDraft } = useLoaderData<LoaderData>();
  return (
    <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row">
      <div className="px-4 lg:px-8">
        <BreadCrumbs options={detailsAndActionsCrumbs({ id, authority })} />
        <DetailsSidebar id={id} />
      </div>
      <DetailsContent id={id} preferDraft={preferDraft} />
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
    <nav className="min-w-56 flex-none font-semibold mt-6 hidden lg:block mr-8">
      <ul>
        {links.map(({ id, href, displayName }) => (
          <li key={id}>
            <a
              className="block mb-2 text-blue-900 hover:underline"
              href={href}
              onClick={() => handleSidebarClick(id)}
            >
              {displayName}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
