import { useMemo } from "react";
import { opensearch } from "shared-types";
import { ItemResult } from "shared-types/opensearch/changelog";
import { formatDateToET, getPackageActivityLabel } from "shared-utils";

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
  attachments: opensearch.changelog.Document["attachments"];
  additionalInformation?: string | null;
  isAdminChange?: boolean;
  isSyntheticDraft?: boolean;
};

const DRAFT_ATTACHMENT_LABELS: Record<string, string> = {
  amendedStatePlanLanguage: "Amended State Plan Language",
  b4IndependentAssessment: "B4 Independent Assessment",
  b4WaiverApplication: "B4 Waiver Application",
  chipEligibility: "CHIP Eligibility Template",
  cmsForm179: "CMS-179 Form",
  coverLetter: "Cover Letter",
  currentStatePlan: "Current State Plan",
  existingStatePlanPages: "Existing State Plan Pages",
  other: "Other",
  publicNotice: "Public Notice",
  revisedAmendedStatePlanLanguage: "Revised Amended State Plan Language",
  sfq: "SFQ",
  spaPages: "SPA Pages",
  tribalConsultation: "Tribal Consultation",
  tribalEngagement: "Tribal Engagement",
  waiverExtensionRequest: "Waiver Extension Request",
};

const humanizeDraftAttachmentKey = (key: string) =>
  DRAFT_ATTACHMENT_LABELS[key] ??
  key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase());

const getDraftAttachments = (
  submission?: opensearch.main.Document,
): NonNullable<opensearch.changelog.Document["attachments"]> => {
  const attachmentSections = (submission?.draft?.data as Record<string, unknown> | undefined)
    ?.attachments;

  if (!attachmentSections || typeof attachmentSections !== "object") {
    return [];
  }

  return Object.entries(attachmentSections).flatMap(([attachmentKey, attachmentSection]) => {
    if (!attachmentSection || typeof attachmentSection !== "object") {
      return [];
    }

    const files = (attachmentSection as { files?: unknown }).files;
    if (!Array.isArray(files) || files.length === 0) {
      return [];
    }

    return files.flatMap((file) => {
      if (!file || typeof file !== "object") {
        return [];
      }

      const maybeAttachment = file as Record<string, unknown>;
      const filename =
        typeof maybeAttachment.filename === "string" ? maybeAttachment.filename : undefined;
      const bucket =
        typeof maybeAttachment.bucket === "string" ? maybeAttachment.bucket : undefined;
      const key = typeof maybeAttachment.key === "string" ? maybeAttachment.key : undefined;
      const uploadDate =
        typeof maybeAttachment.uploadDate === "number" ? maybeAttachment.uploadDate : undefined;

      if (!filename || !bucket || !key || typeof uploadDate !== "number") {
        return [];
      }

      return [
        {
          filename,
          bucket,
          key,
          uploadDate,
          title: humanizeDraftAttachmentKey(attachmentKey),
        },
      ];
    });
  });
};

const getDraftPackageActivity = (
  submission?: opensearch.main.Document,
): PackageActivityRecord | null => {
  if (!submission || submission.seatoolStatus !== "Draft") {
    return null;
  }

  const attachments = getDraftAttachments(submission);
  if (attachments.length === 0) {
    return null;
  }

  return {
    id: `${submission.id}-draft-activity`,
    packageId: submission.id,
    label: "Draft Saved",
    submitterName: submission.submitterName,
    timestamp: submission.draft?.savedAt ?? submission.makoChangedDate,
    attachments,
    additionalInformation: null,
    isSyntheticDraft: true,
  };
};

type AttachmentDetailsProps = {
  id: string;
  packageId: string;
  attachments: opensearch.changelog.Document["attachments"];
  onClick: (attachment: Attachments[number]) => Promise<string | undefined>;
};

const AttachmentDetails = ({ id, packageId, attachments, onClick }: AttachmentDetailsProps) => (
  <TableBody>
    {attachments.map((attachment) => {
      return (
        <TableRow key={`${id}-${attachment.key}`}>
          <TableCell>{attachment.title}</TableCell>
          <TableCell>
            <Button
              className="ml-[-15px] align-left text-left min-h-fit"
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
              {attachment.filename}
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
  const { attachments = [], id, packageId, additionalInformation } = packageActivity;
  const { archiveErrorMessage, attachmentErrorMessage, onArchive, onUrl, loading } =
    useAttachmentService({ packageId });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attachments</h2>

        {attachments && attachments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Document Type</TableHead>
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
          <p role="alert" className="mt-2 text-red-700">
            {attachmentErrorMessage}
          </p>
        )}
      </div>
      {!packageActivity.isSyntheticDraft && attachments.length > 1 && (
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
          {archiveErrorMessage && (
            <p role="alert" className="text-red-700">
              {archiveErrorMessage}
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
      <AccordionTrigger className="bg-gray-100 px-3" showPlusMinus>
        <p className="flex flex-row gap-2 text-gray-600">
          <strong className="text-left">
            {packageActivity.label}{" "}
            {packageActivity.submitterName ? `By ${packageActivity.submitterName}` : ""}
          </strong>
          {" - "}
          <span className="text-right">
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
  const { archiveErrorMessage, loading, onArchive } = useAttachmentService({ packageId });

  if (packageActivities.length === 0) {
    return null;
  }

  if (packageActivities.some((packageActivity) => packageActivity.isSyntheticDraft)) {
    return null;
  }

  const attachmentsAggregate = packageActivities.reduce<Attachments>((acc, packageActivity) => {
    if (!packageActivity.attachments || packageActivity.attachments.length === 0) {
      return acc;
    }

    return acc.concat(packageActivity.attachments);
  }, []);

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
      {archiveErrorMessage && (
        <p role="alert" className="justify-self-end text-red-700">
          {archiveErrorMessage}
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
    attachments: packageActivity.attachments,
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

    const draftPackageActivity = getDraftPackageActivity(submission);
    return draftPackageActivity ? [draftPackageActivity] : [];
  }, [changelog, submission]);

  return (
    <DetailsSection
      id="package_activity"
      title={
        <div className="flex justify-between">
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
