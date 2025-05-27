import { useMemo } from "react";
import { opensearch } from "shared-types";
import { ItemResult } from "shared-types/opensearch/changelog";
import { formatDateToET } from "shared-utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  Button,
  DetailsSection,
  GridAccordionTrigger,
} from "@/components";
import { BLANK_VALUE } from "@/consts";

import { Attachments, useAttachmentService } from "./hook";

type AttachmentDetailsProps = {
  id: string;
  attachments: opensearch.changelog.Document["attachments"];
  onClick: (attachment: Attachments[number]) => Promise<string>;
};

const AttachmentDetails = ({ id, attachments, onClick }: AttachmentDetailsProps) => (
  <div className="two-cols-subgrid [&_div:last-child]:border-0">
    {attachments.map((attachment) => {
      return (
        <div
          className="two-cols-subgrid items-center text-left border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted text-sm"
          key={`${id}-${attachment.key}`}
        >
          <div className="col-left pl-2 py-3">{attachment.title}</div>
          <div className="col-right pr-2 py-3">
            <Button
              className="ml-[-15px] text-left min-h-fit"
              variant="link"
              onClick={() => onClick(attachment).then(window.open)}
            >
              {attachment.filename}
            </Button>
          </div>
        </div>
      );
    })}
  </div>
);

type SubmissionProps = {
  packageActivity: opensearch.changelog.Document;
};

const Submission = ({ packageActivity }: SubmissionProps) => {
  const { attachments = [], id, packageId, additionalInformation } = packageActivity;
  const { onUrl, loading, onZip } = useAttachmentService({ packageId });

  return (
    <div className="two-cols py-4 gap-y-6">
      <div className="two-cols-subgrid">
        <h2 className="col-span-full font-bold text-lg mb-2">Attachments</h2>
        {attachments && attachments?.length > 0 ? (
          <div className="two-cols-subgrid border-[1px]">
            <div className="border-b text-left font-semibold text-muted-foreground leading-5 two-cols-subgrid">
              <div className="col-left pl-2">Document Type</div>
              <div className="col-right pr-2">Attached File</div>
            </div>
            <AttachmentDetails attachments={attachments} id={id} onClick={onUrl} />
          </div>
        ) : (
          <p className="col-span-full">No information submitted</p>
        )}
      </div>

      {attachments && attachments.length > 1 && (
        <Button
          variant="outline"
          className="w-max col-span-full"
          loading={loading}
          onClick={() => onZip(attachments)}
        >
          Download section attachments
        </Button>
      )}

      <div className="col-span-full">
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
        return "Subsequent Document Uploaded";

      default:
        return BLANK_VALUE;
    }
  }, [packageActivity.event]);

  return (
    <AccordionItem value={packageActivity.id}>
      <GridAccordionTrigger
        className="bg-gray-100 px-3 text-gray-600"
        showPlusMinus
        col1={
          <strong>
            {label} {packageActivity.submitterName ? `By ${packageActivity.submitterName}` : ""}
          </strong>
        }
        col2=" - "
        col3={
          <span>
            {packageActivity.timestamp ? formatDateToET(packageActivity.timestamp) : "Unknown"}
          </span>
        }
      />
      <AccordionContent>
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
  };

  return (
    <Button
      loading={loading}
      onClick={onDownloadAll}
      variant="outline"
      className="max-w-fit justify-self-end"
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
  console.log("Changelog" + changelogWithoutAdminChanges);
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
          className="two-cols-subgrid gap-y-2"
          defaultValue={[changelogWithoutAdminChanges[0]._source.id]}
        >
          {changelogWithoutAdminChanges.map(({ _source: packageActivity }) => (
            <PackageActivity key={packageActivity.id} packageActivity={packageActivity} />
          ))}
        </Accordion>
      ) : (
        <p className="text-gray-500">No package activity recorded</p>
      )}
    </DetailsSection>
  );
};
