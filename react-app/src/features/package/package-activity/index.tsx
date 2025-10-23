import { useMemo } from "react";
import { opensearch } from "shared-types";
import { ItemResult } from "shared-types/opensearch/changelog";
import { formatDateToET } from "shared-utils";

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

type AttachmentDetailsProps = {
  id: string;
  packageId: string;
  attachments: opensearch.changelog.Document["attachments"];
  onClick: (attachment: Attachments[number]) => Promise<string>;
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
                onClick(attachment).then(window.open);
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
  packageActivity: opensearch.changelog.Document;
};

const Submission = ({ packageActivity }: SubmissionProps) => {
  const { attachments = [], id, packageId, additionalInformation } = packageActivity;
  const { onUrl, loading, onZip } = useAttachmentService({ packageId });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attachments</h2>

        {attachments && attachments?.length > 0 ? (
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
      </div>
      {attachments && attachments.length > 1 && (
        <Button
          variant="outline"
          className="w-max"
          loading={loading}
          onClick={() => {
            onZip(attachments);
            sendGAEvent("section_attachments_download", {
              number_attachments: attachments.length,
              package_id: packageId,
            });
          }}
        >
          Download section attachments
        </Button>
      )}
      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p className="whitespace-pre-line">{additionalInformation || "No information submitted"}</p>
      </div>
    </div>
  );
};

type PackageActivityProps = {
  packageActivity: opensearch.changelog.Document;
};

const PackageActivity = ({ packageActivity }: PackageActivityProps) => {
  const label = useMemo(() => {
    switch (packageActivity.event) {
      case "capitated-amendment":
      case "capitated-initial":
      case "capitated-renewal":
      case "contracting-amendment":
      case "contracting-initial":
      case "contracting-renewal":
      case "new-chip-submission":
      case "new-chip-details-submission":
      case "new-medicaid-submission":
      case "temporary-extension":
      case "app-k":
        return "Initial Package Submitted";

      case "withdraw-package":
        return "Package - Withdrawal Requested";
      case "legacy-withdraw-rai-request":
      case "withdraw-rai":
        return "Formal RAI Response - Withdrawal Requested";

      case "respond-to-rai":
        return "RAI Response Submitted";

      case "upload-subsequent-documents":
        return "Subsequent Document(s) Uploaded";

      default:
        return BLANK_VALUE;
    }
  }, [packageActivity.event]);

  return (
    <AccordionItem value={packageActivity.id}>
      <AccordionTrigger className="bg-gray-100 px-3" showPlusMinus>
        <p className="flex flex-row gap-2 text-gray-600">
          <strong className="text-left">
            {label} {packageActivity.submitterName ? `By ${packageActivity.submitterName}` : ""}
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
  submissionChangelog: ItemResult[];
};

const DownloadAllButton = ({ packageId, submissionChangelog }: DownloadAllButtonProps) => {
  const { onZip, loading } = useAttachmentService({ packageId });

  if (submissionChangelog?.length === 0) {
    return null;
  }

  const onDownloadAll = () => {
    const attachmentsAggregate = submissionChangelog.reduce<Attachments>((acc, changelogItem) => {
      if (!changelogItem._source.attachments) {
        return acc;
      }

      return acc.concat(changelogItem._source.attachments);
    }, []);

    if (attachmentsAggregate.length === 0) {
      return;
    }

    onZip(attachmentsAggregate);
    sendGAEvent("all_attachments_download", {
      number_attachments: attachmentsAggregate.length,
      package_id: packageId,
    });
  };

  return (
    <Button
      loading={loading}
      onClick={onDownloadAll}
      variant="outline"
      className="max-w-fit min-h-fit justify-self-end"
    >
      Download all attachments
    </Button>
  );
};

type PackageActivitiesProps = {
  id: string;
  changelog: ItemResult[];
};

export const PackageActivities = ({ id, changelog }: PackageActivitiesProps) => {
  const changelogWithoutAdminChanges = changelog.filter((item) => !item._source.isAdminChange);

  return (
    <DetailsSection
      id="package_activity"
      title={
        <div className="flex justify-between">
          Package Activity ({changelogWithoutAdminChanges.length || 0})
          <DownloadAllButton submissionChangelog={changelogWithoutAdminChanges} packageId={id} />
        </div>
      }
    >
      {changelogWithoutAdminChanges.length > 0 ? (
        <Accordion
          // `changelogWithoutAdminChanges[0]._source.id` to re-render the `defaultValue` whenever `keyAndDefaultValue` changes
          key={changelogWithoutAdminChanges[0]._source.id}
          type="multiple"
          className="flex flex-col gap-2"
          defaultValue={[changelogWithoutAdminChanges[0]._source.id]}
          asChild
        >
          <ol>
            {changelogWithoutAdminChanges.map(({ _source: packageActivity }) => (
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
