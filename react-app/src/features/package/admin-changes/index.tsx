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

import { Attachments, useAttachmentService } from "../package-activity/hook";

type AdminChangeProps = {
  adminActivity: opensearch.changelog.Document;
};

const attachmentStatusMessageClassName = "text-sm font-normal text-red-700";

const AC_WithdrawEnabled = ({ adminActivity }: AdminChangeProps) => (
  <div className="flex flex-col gap-2">
    <p className="font-bold">Change made</p>
    <p>
      {adminActivity.submitterName} has enabled State package action to withdraw formal RAI response
    </p>
  </div>
);

const AC_WithdrawDisabled = ({ adminActivity }: AdminChangeProps) => (
  <div className="flex flex-col gap-2">
    <p className="font-bold">Change made</p>
    <p>
      {adminActivity.submitterName} has disabled State package action to withdraw formal RAI
      response
    </p>
  </div>
);

type AdminAttachmentDetailsProps = {
  attachments: Attachments;
  id: string;
  onClick: (attachment: Attachments[number]) => Promise<string | undefined>;
};

const AdminAttachmentDetails = ({ attachments, id, onClick }: AdminAttachmentDetailsProps) => (
  <TableBody>
    {attachments.map((attachment) => (
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
            }}
          >
            {attachment.filename}
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

const AC_LegacyAdminChange = ({ adminActivity }: AdminChangeProps) => {
  const attachments = adminActivity.attachments || [];
  const {
    archiveErrorMessage,
    archiveWarningMessage,
    attachmentErrorMessage,
    loading,
    onArchive,
    onUrl,
  } = useAttachmentService({ packageId: adminActivity.packageId });
  const archiveMessage = archiveErrorMessage || archiveWarningMessage;
  const supportsArchiveDownload = adminActivity.event === "NOSO";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Change Made</h2>
        <p>{adminActivity.changeMade || "No information submitted"}</p>
      </div>
      {adminActivity.changeReason && (
        <div>
          <h2 className="font-bold text-lg mb-2">Change Reason</h2>
          <p>{adminActivity.changeReason}</p>
        </div>
      )}
      {attachments.length > 0 && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-bold text-lg mb-2">Attachments</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Document Type</TableHead>
                  <TableHead>Attached File</TableHead>
                </TableRow>
              </TableHeader>
              <AdminAttachmentDetails
                attachments={attachments}
                id={adminActivity.id}
                onClick={onUrl}
              />
            </Table>
            {attachmentErrorMessage && (
              <p role="alert" className={`mt-2 ${attachmentStatusMessageClassName}`}>
                {attachmentErrorMessage}
              </p>
            )}
          </div>
          {supportsArchiveDownload && attachments.length > 1 && (
            <>
              <Button
                variant="outline"
                className="w-max"
                loading={loading}
                onClick={() => {
                  onArchive({ scope: "section", sectionId: adminActivity.id }).then((url) => {
                    if (url) {
                      window.open(url);
                    }
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
        </div>
      )}
    </div>
  );
};

function checkRegexPatterns(input: string): string {
  // Check which pattern matches
  const enabledPattern = /enabled.*withdraw Formal RAI Response/;
  const disabledPattern = /disabled.*withdraw Formal RAI Response/;
  switch (true) {
    case enabledPattern.test(input):
      return "Enable Formal RAI Response Withdraw";

    case disabledPattern.test(input):
      return "Disable Formal RAI Response Withdraw";

    default:
      return "";
  }
}
const AC_Update = () => <p>Coming Soon</p>;

const AdminDownloadAllButton = ({ changelog }: { changelog: ItemResult[] }) => {
  const packageId = changelog[0]?._source.packageId;
  const adminHasNosoAttachments = changelog.some(
    (item) => item._source.event === "NOSO" && (item._source.attachments?.length || 0) > 0,
  );
  const nonAdminHasAttachments = changelog.some(
    (item) => !item._source.isAdminChange && (item._source.attachments?.length || 0) > 0,
  );

  const { archiveErrorMessage, archiveWarningMessage, loading, onArchive } = useAttachmentService({
    packageId: packageId || "",
  });
  const archiveMessage = archiveErrorMessage || archiveWarningMessage;

  if (!packageId || !adminHasNosoAttachments || nonAdminHasAttachments) {
    return null;
  }

  return (
    <>
      <Button
        loading={loading}
        onClick={() => {
          onArchive({ scope: "all" }).then((url) => {
            if (url) {
              window.open(url);
            }
          });
        }}
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

export const AdminChange = ({ adminActivity }: AdminChangeProps) => {
  const [label, Content] = useMemo(() => {
    switch (adminActivity.event) {
      case "toggle-withdraw-rai": {
        if (adminActivity.raiWithdrawEnabled) {
          return ["Enable Formal RAI Response Withdraw", AC_WithdrawEnabled];
        }
        return ["Disable Formal RAI Response Withdraw", AC_WithdrawDisabled];
      }
      case "NOSO":
        return [adminActivity.changeType || "Package Added", AC_LegacyAdminChange];
      case "legacy-admin-change":
        return [
          checkRegexPatterns(adminActivity.changeMade) || "Manual Update",
          AC_LegacyAdminChange,
        ];
      case "split-spa":
        return ["Package Added", AC_LegacyAdminChange];
      case "update-id":
        return ["Manual Update", AC_LegacyAdminChange];
      case "update-values":
        return ["Manual Update", AC_LegacyAdminChange];
      default:
        return [BLANK_VALUE, AC_Update];
    }
  }, [
    adminActivity.event,
    adminActivity.changeType,
    adminActivity.raiWithdrawEnabled,
    adminActivity.changeMade,
  ]);

  return (
    <AccordionItem value={adminActivity.id}>
      <AccordionTrigger className="bg-gray-100 px-3" showPlusMinus>
        <p className="flex flex-row gap-2 text-gray-600">
          <strong>{label as string}</strong>
          {" - "}
          {formatDateToET(adminActivity.timestamp)}
        </p>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <Content adminActivity={adminActivity} />
      </AccordionContent>
    </AccordionItem>
  );
};

type AdminChangesProps = {
  changelog: ItemResult[];
};

export const AdminPackageActivities = ({ changelog }: AdminChangesProps) => {
  const adminChangelog = changelog.filter((item) => item._source.isAdminChange);

  if (adminChangelog.length === 0) return null;

  return (
    <DetailsSection
      id="administrative_package_changes"
      title={
        <div className="flex justify-between">
          Administrative Package Changes ({adminChangelog.length})
          <AdminDownloadAllButton changelog={changelog} />
        </div>
      }
      description="Administrative changes reflect updates to specific data fields. If you have additional questions, please contact the assigned CPOC."
    >
      <Accordion
        // There is a cached value (defaultValue) below
        // If you ever want to get around the cached value so
        // that is re-renders simply use a unique key that will
        // change when you need it to re-render
        key={adminChangelog[0]._source.id}
        type="multiple"
        defaultValue={[adminChangelog[0]._source.id]}
        className="flex flex-col gap-2"
        asChild
      >
        <ol>
          {adminChangelog.map(({ _source: adminActivity }) => (
            <li key={adminActivity.id}>
              <AdminChange adminActivity={adminActivity} />
            </li>
          ))}
        </ol>
      </Accordion>
    </DetailsSection>
  );
};
