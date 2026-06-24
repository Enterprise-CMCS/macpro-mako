import { useMemo } from "react";
import { opensearch, SEATOOL_STATUS } from "shared-types";
import { ItemResult } from "shared-types/opensearch/changelog";
import { formatDateToET, getDraftAttachments, getPackageActivityLabel } from "shared-utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  DetailsSection,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";
import { BLANK_VALUE } from "@/consts";
import { sendGAEvent } from "@/utils";

import { Attachments, useAttachmentService } from "./hook";

type PackageActivityRecord = {
  id: string;
  packageId: string;
  label: string;
  submitterName?: string;
  timestamp?: string | number;
  attachments: Attachments;
  additionalInformation?: string | null;
  detailMessage?: string;
  isAdminChange?: boolean;
  isSyntheticDraft?: boolean;
};

const getDraftPackageActivities = (
  submission?: opensearch.main.Document,
): PackageActivityRecord[] => {
  if (!submission || submission.seatoolStatus !== SEATOOL_STATUS.DRAFT) {
    return [];
  }

  const attachments = getDraftAttachments(submission);
  const draft = submission.draft;
  const createdByName = draft?.createdByName ?? draft?.draftOwnerName ?? submission.submitterName;
  const createdByEmail =
    draft?.createdByEmail ?? draft?.draftOwnerEmail ?? submission.submitterEmail;
  const createdAt = draft?.createdAt ?? draft?.savedAt ?? submission.makoChangedDate;
  const updatedByName = draft?.updatedByName ?? submission.submitterName;
  const updatedByEmail = draft?.updatedByEmail ?? submission.submitterEmail;
  const updatedAt = draft?.updatedAt ?? draft?.savedAt ?? submission.makoChangedDate;
  const updatedByDifferentUser = Boolean(
    updatedByName &&
      (updatedByEmail
        ? updatedByEmail.toLowerCase() !== createdByEmail?.toLowerCase()
        : updatedByName !== createdByName),
  );
  const additionalInformation = draft?.data?.additionalInformation as string | undefined;

  const createdActivity: PackageActivityRecord = {
    id: `${submission.id}-draft-activity`,
    packageId: submission.id,
    label: "Created",
    submitterName: createdByName,
    timestamp: createdAt,
    attachments: updatedByDifferentUser ? [] : attachments,
    additionalInformation: updatedByDifferentUser ? undefined : additionalInformation,
    detailMessage: updatedByDifferentUser
      ? "This draft creation record remains static. The latest saved documents and additional information are shown in the Updated By activity."
      : undefined,
    isSyntheticDraft: true,
  };

  if (!updatedByDifferentUser) {
    return [createdActivity];
  }

  return [
    {
      id: `${submission.id}-draft-updated-activity`,
      packageId: submission.id,
      label: "Updated",
      submitterName: updatedByName,
      timestamp: updatedAt,
      attachments,
      additionalInformation,
      isSyntheticDraft: true,
    },
    createdActivity,
  ];
};

const attachmentStatusMessageClassName = "text-sm font-normal text-red-700";

type AttachmentDetailsProps = {
  id: string;
  packageId: string;
  attachments: Attachments;
  onClick: (attachment: Attachments[number]) => Promise<string | undefined>;
};

const AttachmentDetails = ({ id, packageId, attachments, onClick }: AttachmentDetailsProps) => (
  <TableBody>
    {attachments.map((attachment) => {
      return (
        <TableRow key={`${id}-${attachment.key}`}>
          <TableCell className="w-[28%] min-w-0 [overflow-wrap:anywhere] [word-break:break-word]">
            {attachment.title}
          </TableCell>
          <TableCell className="min-w-0 [overflow-wrap:anywhere] [word-break:break-word]">
            <Button
              className="h-auto min-h-fit w-full max-w-full justify-start whitespace-normal px-0 py-0 text-left"
              variant="link"
              onClick={() => {
                onClick(attachment).then((url) => {
                  if (url) {
                    window.open(url);
                  }
                });
                sendGAEvent("attachment_download", {
                  document_type: attachment.title,
                  package_id: packageId,
                });
              }}
            >
              <span className="min-w-0 max-w-full [overflow-wrap:anywhere] [word-break:break-word]">
                {attachment.filename}
              </span>
            </Button>
          </TableCell>
        </TableRow>
      );
    })}
  </TableBody>
);

type SubmissionProps = {
  packageActivity: PackageActivityRecord;
};

const Submission = ({ packageActivity }: SubmissionProps) => {
  const { attachments, id, packageId, additionalInformation, detailMessage } = packageActivity;
  const {
    archiveErrorMessage,
    archiveWarningMessage,
    attachmentErrorMessage,
    onArchive,
    onUrl,
    loading,
  } = useAttachmentService({
    packageId,
    preferDraft: packageActivity.isSyntheticDraft,
  });
  const archiveMessage = archiveErrorMessage || archiveWarningMessage;
  const hasAdditionalInformation = Boolean(additionalInformation?.trim());

  if (detailMessage && attachments.length === 0 && !hasAdditionalInformation) {
    return <p className="text-gray-700">{detailMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attachments</h2>

        {attachments && attachments.length > 0 ? (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Document Type</TableHead>
                <TableHead>Attached File</TableHead>
              </TableRow>
            </TableHeader>

            <AttachmentDetails
              attachments={attachments}
              id={id}
              packageId={packageId}
              onClick={onUrl}
            />
          </Table>
        ) : (
          <p>No information submitted</p>
        )}
        {attachmentErrorMessage && (
          <p role="alert" className={`mt-2 ${attachmentStatusMessageClassName}`}>
            {attachmentErrorMessage}
          </p>
        )}
      </div>
      {attachments.length > 1 && (
        <>
          <Button
            variant="outline"
            className="w-max"
            loading={loading}
            onClick={() => {
              onArchive({ scope: "section", sectionId: id }).then((url) => {
                if (url) {
                  window.open(url);
                }
              });
              sendGAEvent("section_attachments_download", {
                number_attachments: attachments.length,
                package_id: packageId,
              });
            }}
          >
            Download section attachments
          </Button>
          {archiveMessage && (
            <p role="alert" className={attachmentStatusMessageClassName}>
              {archiveMessage}
            </p>
          )}
        </>
      )}
      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p className="whitespace-pre-line">{additionalInformation || "No information submitted"}</p>
      </div>
    </div>
  );
};

type PackageActivityProps = {
  packageActivity: PackageActivityRecord;
};

const PackageActivity = ({ packageActivity }: PackageActivityProps) => {
  return (
    <AccordionItem value={packageActivity.id}>
      <AccordionTrigger className="min-w-0 bg-gray-100 px-3" showPlusMinus>
        <p className="flex min-w-0 flex-1 flex-row flex-wrap gap-x-2 gap-y-1 pr-3 text-left text-gray-600">
          <strong className="min-w-0 break-words text-left">
            {packageActivity.label}{" "}
            {packageActivity.submitterName ? `By ${packageActivity.submitterName}` : ""}
          </strong>
          {" - "}
          <span className="whitespace-nowrap text-right">
            {packageActivity.timestamp ? formatDateToET(packageActivity.timestamp) : "Unknown"}
          </span>
        </p>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <Submission packageActivity={packageActivity} />
      </AccordionContent>
    </AccordionItem>
  );
};

type DownloadAllButtonProps = {
  packageId: string;
  packageActivities: PackageActivityRecord[];
};

const DownloadAllButton = ({ packageId, packageActivities }: DownloadAllButtonProps) => {
  const attachmentsAggregate = packageActivities.reduce<Attachments>((acc, packageActivity) => {
    if (!packageActivity.attachments || packageActivity.attachments.length === 0) {
      return acc;
    }

    return acc.concat(packageActivity.attachments);
  }, []);
  const preferDraft = packageActivities.some((packageActivity) => packageActivity.isSyntheticDraft);
  const { archiveErrorMessage, archiveWarningMessage, loading, onArchive } = useAttachmentService({
    packageId,
    preferDraft,
  });
  const archiveMessage = archiveErrorMessage || archiveWarningMessage;

  if (attachmentsAggregate.length === 0) {
    return null;
  }

  const onDownloadAll = () => {
    if (attachmentsAggregate.length === 0) {
      return;
    }

    onArchive({ scope: "all" }).then((url) => {
      if (url) {
        window.open(url);
      }
    });
    sendGAEvent("all_attachments_download", {
      number_attachments: attachmentsAggregate.length,
      package_id: packageId,
    });
  };

  return (
    <>
      <Button
        loading={loading}
        onClick={onDownloadAll}
        variant="outline"
        className="max-w-fit min-h-fit justify-self-end"
      >
        Download all attachments
      </Button>
      {archiveMessage && (
        <p role="alert" className={`justify-self-end ${attachmentStatusMessageClassName}`}>
          {archiveMessage}
        </p>
      )}
    </>
  );
};

type PackageActivitiesProps = {
  id: string;
  changelog: ItemResult[];
  submission?: opensearch.main.Document;
};

const mapChangelogItemToPackageActivity = ({
  _source: packageActivity,
}: ItemResult): PackageActivityRecord => {
  const label = getPackageActivityLabel(packageActivity.event) || BLANK_VALUE;

  return {
    id: packageActivity.id,
    packageId: packageActivity.packageId,
    label,
    submitterName: packageActivity.submitterName,
    timestamp: packageActivity.timestamp,
    attachments: packageActivity.attachments ?? [],
    additionalInformation: packageActivity.additionalInformation,
    isAdminChange: packageActivity.isAdminChange,
  };
};

export const PackageActivities = ({ id, changelog, submission }: PackageActivitiesProps) => {
  const packageActivities = useMemo(() => {
    const changelogWithoutAdminChanges = changelog
      .filter((item) => !item._source.isAdminChange)
      .map(mapChangelogItemToPackageActivity);

    if (changelogWithoutAdminChanges.length > 0) {
      return changelogWithoutAdminChanges;
    }

    return getDraftPackageActivities(submission);
  }, [changelog, submission]);

  return (
    <DetailsSection
      id="package_activity"
      title={
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          Package Activity ({packageActivities.length || 0})
          <DownloadAllButton packageActivities={packageActivities} packageId={id} />
        </div>
      }
    >
      {packageActivities.length > 0 ? (
        <Accordion
          key={packageActivities[0].id}
          type="multiple"
          className="flex flex-col gap-2"
          defaultValue={[packageActivities[0].id]}
          asChild
        >
          <ol>
            {packageActivities.map((packageActivity) => (
              <li key={packageActivity.id}>
                <PackageActivity packageActivity={packageActivity} />
              </li>
            ))}
          </ol>
        </Accordion>
      ) : (
        <p className="text-gray-500">No package activity recorded</p>
      )}
    </DetailsSection>
  );
};
