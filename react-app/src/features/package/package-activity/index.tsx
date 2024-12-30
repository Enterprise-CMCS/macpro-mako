import { useMemo } from "react";
import { opensearch } from "shared-types";
import { format } from "date-fns";
import {
  Accordion,
  DetailsSection,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  LoadingSpinner,
} from "@/components";
import * as Table from "@/components";
import { BLANK_VALUE } from "@/consts";
import { useAttachmentService, Attachments } from "./hook";
import { useParams } from "react-router";
import { useGetItem } from "@/api";
import { ItemResult } from "shared-types/opensearch/changelog";

type AttachmentDetailsProps = {
  id: string;
  attachments: opensearch.changelog.Document["attachments"];
  onClick: (attachment: Attachments[number]) => Promise<string>;
};

const AttachmentDetails = ({ id, attachments, onClick }: AttachmentDetailsProps) => (
  <Table.TableBody>
    {attachments.map((attachment) => {
      return (
        <Table.TableRow key={`${id}-${attachment.key}`}>
          <Table.TableCell>{attachment.title}</Table.TableCell>
          <Table.TableCell>
            <Table.Button
              className="ml-[-15px]"
              variant="link"
              onClick={() => onClick(attachment).then(window.open)}
            >
              {attachment.filename}
            </Table.Button>
          </Table.TableCell>
        </Table.TableRow>
      );
    })}
  </Table.TableBody>
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
        {attachments.length > 0 ? (
          <Table.Table>
            <Table.TableHeader>
              <Table.TableRow>
                <Table.TableHead className="w-[300px]">Document Type</Table.TableHead>
                <Table.TableHead>Attached File</Table.TableHead>
              </Table.TableRow>
            </Table.TableHeader>
            <AttachmentDetails attachments={attachments} id={id} onClick={onUrl} />
          </Table.Table>
        ) : (
          <p>No information submitted</p>
        )}
      </div>

      {attachments.length > 0 && (
        <Table.Button
          variant="outline"
          className="w-max"
          loading={loading}
          onClick={() => onZip(attachments)}
        >
          Download documents
        </Table.Button>
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
      case "new-medicaid-submission":
      case "temporary-extension":
      case "app-k":
        return "Initial Package Submitted";

      case "withdraw-package":
        return "Package - Withdrawal Requested";
      case "withdraw-rai":
        return "Formal RAI Response - Withdrawal Requested";

      case "respond-to-rai":
        return "RAI Response Submitted";

      case "upload-subsequent-documents":
        return "Subsequent Documentation Uploaded";

      default:
        return BLANK_VALUE;
    }
  }, [packageActivity.event]);

  return (
    <AccordionItem value={packageActivity.id}>
      <AccordionTrigger className="bg-gray-100 px-3">
        <p className="flex flex-row gap-2 text-gray-600">
          <strong>{label}</strong>
          {" - "}
          {packageActivity.timestamp
            ? format(new Date(packageActivity.timestamp), "eee, MMM d, yyyy hh:mm:ss a")
            : "Unknown"}
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
  };

  return (
    <Table.Button loading={loading} onClick={onDownloadAll} variant="outline">
      Download all documents
    </Table.Button>
  );
};

export const PackageActivities = () => {
  const { id: packageId } = useParams<{ id: string }>();
  const { data: submission, isLoading: isSubmissionLoading } = useGetItem(packageId);

  if (isSubmissionLoading === true) {
    return <LoadingSpinner />;
  }

  if (submission === undefined || submission === null || submission?.found === false) {
    return null;
  }

  const submissionChangelogWithoutAdminChanges = submission?._source?.changelog?.filter(
    (activity) =>
      // isAdminChange can be `undefined` or `boolean`
      !activity?._source?.isAdminChange,
  );

  const keyAndDefaultValue = submissionChangelogWithoutAdminChanges?.[0]?._source?.id;

  return (
    <DetailsSection
      id="package_activity"
      title={
        <div className="flex justify-between">
          Package Activity ({submissionChangelogWithoutAdminChanges?.length || 0})
          <DownloadAllButton
            submissionChangelog={submissionChangelogWithoutAdminChanges}
            packageId={packageId}
          />
        </div>
      }
    >
      {submissionChangelogWithoutAdminChanges?.length > 0 ? (
        <Accordion
          // `key` to re-render the `defaultValue` whenever `keyAndDefaultValue` changes
          key={keyAndDefaultValue}
          type="multiple"
          className="flex flex-col gap-2"
          defaultValue={[keyAndDefaultValue]}
        >
          {submissionChangelogWithoutAdminChanges.map(({ _source: packageActivity }) => (
            <PackageActivity key={packageActivity.id} packageActivity={packageActivity} />
          ))}
        </Accordion>
      ) : (
        <p className="text-gray-500">No package activity recorded</p>
      )}
    </DetailsSection>
  );
};
