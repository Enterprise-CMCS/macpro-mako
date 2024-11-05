import { useMemo } from "react";
import { opensearch } from "shared-types";
import { format } from "date-fns";
import {
  Accordion,
  DetailsSection,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components";
import * as Table from "@/components";
import { BLANK_VALUE } from "@/consts";
import { usePackageActivities, useAttachmentService } from "./hook";

const AttachmentDetails = ({
  id,
  attachments,
  hook,
}: {
  id: string;
  attachments: opensearch.changelog.Document["attachments"];
  hook: ReturnType<typeof useAttachmentService>;
}) => {
  return (
    <Table.TableBody>
      {attachments &&
        attachments.map((ATC) => {
          return (
            <Table.TableRow key={`${id}-${ATC.key}`}>
              <Table.TableCell>{ATC.title}</Table.TableCell>
              <Table.TableCell>
                <Table.Button
                  className="ml-[-15px]"
                  variant="link"
                  onClick={() => {
                    hook.onUrl(ATC).then(window.open);
                  }}
                >
                  {ATC.filename}
                </Table.Button>
              </Table.TableCell>
            </Table.TableRow>
          );
        })}
    </Table.TableBody>
  );
};

const Submission = (props: opensearch.changelog.Document) => {
  const attachmentService = useAttachmentService(props);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attachments</h2>
        {props.attachments.length ? (
          <Table.Table>
            <Table.TableHeader>
              <Table.TableRow>
                <Table.TableHead className="w-[300px]">
                  Document Type
                </Table.TableHead>
                <Table.TableHead>Attached File</Table.TableHead>
              </Table.TableRow>
            </Table.TableHeader>
            <AttachmentDetails
              attachments={props.attachments}
              id={props.id}
              hook={attachmentService}
            />
          </Table.Table>
        ) : (
          <p>No information submitted</p>
        )}
      </div>

      {props.attachments.length > 1 && (
        <Table.Button
          variant="outline"
          className="w-max"
          disabled={props.attachments.length === 0}
          loading={attachmentService.loading}
          onClick={() => {
            if (props.attachments.length !== 0) {
              attachmentService.onZip(props.attachments);
            }
          }}
        >
          Download documents
        </Table.Button>
      )}

      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p className="whitespace-pre-line">
          {props.additionalInformation || "No information submitted"}
        </p>
      </div>
    </div>
  );
};

const PackageActivity = (props: opensearch.changelog.Document) => {
  const label = useMemo(() => {
    switch (props.event) {
      case "capitated-amendment":
      case "capitated-initial":
      case "capitated-renewal":
      case "contracting-amendment":
      case "contracting-initial":
      case "contracting-renewal":
      case "new-chip-submission":
      case "new-medicaid-submission":
      case "temporary-extension":
        return "Initial package submitted";

      case "withdraw-package":
        return "Package withdrawn";
      case "withdraw-rai":
        return "RAI response withdrawn";

      case "respond-to-rai":
        return "RAI response submitted";

      case "upload-subsequent-documents":
        return "Subsequent documentation uploaded";

      default:
        return BLANK_VALUE;
    }
  }, [props.event]);

  if (label === BLANK_VALUE) {
    return null;
  }

  return (
    <AccordionItem value={props.id}>
      <AccordionTrigger className="bg-gray-100 px-3">
        <p className="flex flex-row gap-2 text-gray-600">
          <strong>{label}</strong>
          {" - "}
          {props.timestamp
            ? format(new Date(props.timestamp), "eee, MMM d, yyyy hh:mm:ss a")
            : "Unknown"}
        </p>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <Submission {...props} />
      </AccordionContent>
    </AccordionItem>
  );
};

export const PackageActivities = () => {
  const {
    data: packageActivity,
    loading,
    onDownloadAll,
    accordianDefault,
  } = usePackageActivities();

  const activitiesWithoutAdminChange = packageActivity.filter(
    (activity) =>
      activity._source.isAdminChange === undefined ||
      activity._source.isAdminChange === false,
  );

  return (
    <DetailsSection
      id="package_activity"
      title={
        <div className="flex justify-between">
          Package Activity {activitiesWithoutAdminChange.length}
          {activitiesWithoutAdminChange.length && (
            <Table.Button
              loading={loading}
              onClick={onDownloadAll}
              variant="outline"
            >
              Download all documents
            </Table.Button>
          )}
        </div>
      }
    >
      {activitiesWithoutAdminChange.length === 0 && (
        <p className="text-gray-500">No package activity recorded</p>
      )}

      <Accordion
        type="multiple"
        className="flex flex-col gap-2"
        defaultValue={accordianDefault}
      >
        {activitiesWithoutAdminChange.map((submission) => (
          <PackageActivity
            key={submission._source.id}
            {...submission._source}
          />
        ))}
      </Accordion>
    </DetailsSection>
  );
};
