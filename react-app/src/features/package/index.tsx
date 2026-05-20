import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { PropsWithChildren, useMemo } from "react";
import { LoaderFunctionArgs, Navigate, redirect, useLoaderData } from "react-router";
import { Authority, opensearch, SEATOOL_STATUS } from "shared-types";
import { ItemResult } from "shared-types/opensearch/changelog";

import { getItem, itemExists, useGetItem } from "@/api";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  CardWithTopBorder,
  ErrorAlert,
  LoadingSpinner,
} from "@/components";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { detailsAndActionsCrumbs, sendGAEvent } from "@/utils";
import { DRAFT_ID_CONFLICT_BANNER_TITLE, DRAFT_ID_CONFLICT_MESSAGE } from "@/utils/drafts";

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
  const isSaveInProgressEnabled = useFeatureFlag("SAVE_IN_PROGRESS");
  const effectivePreferDraft = isSaveInProgressEnabled && preferDraft;
  const {
    data: record,
    isLoading,
    error,
  } = useGetItem(id, undefined, {
    includeDraft: isSaveInProgressEnabled,
    preferDraft: effectivePreferDraft,
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
  const { data: hasDraftIdConflict = false } = useQuery(
    ["draft-id-conflict", id],
    () => itemExists(id, { includeDrafts: true, allowDraftId: id }),
    {
      enabled: Boolean(isSaveInProgressEnabled && isDraft && id),
      retry: false,
      staleTime: 30_000,
    },
  );

  if (isLoading) return <LoadingSpinner />;
  if (
    effectivePreferDraft &&
    (error || !record || !updatedSubmission || submission?.deleted === true)
  ) {
    return <Navigate to="/dashboard" replace />;
  }
  if (error || !record || !updatedSubmission) return <ErrorAlert error={error} />;

  return (
    <div className="w-full py-1 px-4 lg:px-8 grid grid-cols-1 gap-y-6 sm:gap-y-6">
      {isSaveInProgressEnabled && isDraft && hasDraftIdConflict && (
        <Alert variant="warning" className="my-2 sm:my-3">
          <AlertTriangle aria-hidden="true" data-testid="draft-id-conflict-icon" />
          <AlertTitle>{DRAFT_ID_CONFLICT_BANNER_TITLE}</AlertTitle>
          <AlertDescription>{DRAFT_ID_CONFLICT_MESSAGE}</AlertDescription>
        </Alert>
      )}
      <section id="package_overview" className="sm:mb-0 two-cols gap-y-3 sm:gap-y-3">
        <DetailCardWrapper title="Status" ariaLabel="package-status-heading">
          <PackageStatusCard submission={updatedSubmission} />
        </DetailCardWrapper>
        <DetailCardWrapper title="Package Actions" ariaLabel="package-actions-heading">
          <PackageActionsCard id={id} submission={updatedSubmission} />
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
    <div id="package_details_page" className="max-w-screen-xl mx-auto flex flex-col lg:flex-row">
      <div className="px-4 lg:px-8">
        <BreadCrumbs options={detailsAndActionsCrumbs({ id, authority })} />
        <DetailsSidebar />
      </div>
      <DetailsContent id={id} preferDraft={preferDraft} />
    </div>
  );
};

const DetailsSidebar = () => {
  const links = useDetailsSidebarLinks();
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
