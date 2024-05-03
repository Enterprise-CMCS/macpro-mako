import { FC, useMemo } from "react";
import { AttachmentKey, opensearch } from "shared-types";
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
import { Link } from "@/components/Routing";
import { attachmentTitleMap } from "shared-types";

// id, attachments, hook
const AttachmentDetails: FC<{
  id: string;
  attachments: opensearch.changelog.Document["attachments"];
  hook: ReturnType<typeof useAttachmentService>;
}> = ({ id, attachments, hook }) => {
  return (
    <Table.TableBody>
      {attachments &&
        attachments.map((ATC) => {
          // ATC.title *should* have type: AttachmentKey
          const attachmentLabel =
            attachmentTitleMap[ATC.title as AttachmentKey] || ATC.title;
          return (
            <Table.TableRow key={`${id}-${ATC.key}`}>
              <Table.TableCell>{attachmentLabel}</Table.TableCell>
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

export const PA_AppkParentRemovedChild: FC<opensearch.changelog.Document> = (
  props,
) => {
  return (
    <div className="flex gap-1">
      <Link
        path="/details"
        query={{ id: props.appkChildId }}
        className="hover:underline font-semibold text-blue-600"
      >
        {props.appkChildId}
      </Link>
      <p>was removed</p>
    </div>
  );
};

export const PA_AppkChildRemovedFromParent: FC<
  opensearch.changelog.Document
> = (props) => {
  return (
    <div className="flex gap-1">
      <p>Removed from:</p>
      <Link
        path="/details"
        query={{ id: props.appkParentId }}
        className="hover:underline font-semibold text-blue-600"
      >
        {props.appkParentId}
      </Link>
    </div>
  );
};

export const PA_InitialSubmission: FC<opensearch.changelog.Document> = (
  props,
) => {
  const hook = useAttachmentService(props);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attachments</h2>
        {!props.attachments?.length && <p>No information submitted</p>}
        {!!props.attachments?.length && (
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
              hook={hook}
            />
          </Table.Table>
        )}
      </div>

      {props.attachments && props.attachments?.length > 1 && (
        <Table.Button
          variant="outline"
          className="w-max"
          disabled={!props.attachments?.length}
          loading={hook.loading}
          onClick={() => {
            if (!props.attachments?.length) return;
            hook.onZip(props.attachments);
          }}
        >
          Download documents
        </Table.Button>
      )}

      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p>{props.additionalInformation || "No information submitted"}</p>
      </div>
    </div>
  );
};

export const PA_ResponseSubmitted: FC<opensearch.changelog.Document> = (
  props,
) => {
  const hook = useAttachmentService(props);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attachments</h2>
        {!props.attachments?.length && <p>No information submitted</p>}
        {!!props.attachments?.length && (
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
              hook={hook}
            />
          </Table.Table>
        )}
      </div>

      {props.attachments && props.attachments?.length > 1 && (
        <Table.Button
          variant="outline"
          className="w-max"
          disabled={!props.attachments?.length}
          loading={hook.loading}
          onClick={() => {
            if (!props.attachments?.length) return;
            hook.onZip(props.attachments);
          }}
        >
          Download documents
        </Table.Button>
      )}

      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p>{props.additionalInformation || "No information submitted"}</p>
      </div>
    </div>
  );
};

export const PA_ResponseWithdrawn: FC<opensearch.changelog.Document> = (
  props,
) => {
  const hook = useAttachmentService(props);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attachments</h2>
        {!props.attachments?.length && <p>No information submitted</p>}
        {!!props.attachments?.length && (
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
              hook={hook}
            />
          </Table.Table>
        )}
      </div>

      {props.attachments && props.attachments?.length > 1 && (
        <Table.Button
          variant="outline"
          className="w-max"
          disabled={!props.attachments?.length}
          loading={hook.loading}
          onClick={() => {
            if (!props.attachments?.length) return;
            hook.onZip(props.attachments);
          }}
        >
          Download documents
        </Table.Button>
      )}

      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p>{props.additionalInformation || "No information submitted"}</p>
      </div>
    </div>
  );
};

export const PA_RaiIssued: FC<opensearch.changelog.Document> = (props) => {
  const hook = useAttachmentService(props);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attachments</h2>
        {!props.attachments?.length && <p>No information submitted</p>}
        {!!props.attachments?.length && (
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
              hook={hook}
            />
          </Table.Table>
        )}
      </div>

      {props.attachments && props.attachments?.length > 1 && (
        <Table.Button
          variant="outline"
          className="w-max"
          disabled={!props.attachments?.length}
          loading={hook.loading}
          onClick={() => {
            if (!props.attachments?.length) return;
            hook.onZip(props.attachments);
          }}
        >
          Download documents
        </Table.Button>
      )}

      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p>{props.additionalInformation || "No information submitted"}</p>
      </div>
    </div>
  );
};

// Control Map
export const PackageActivity: FC<opensearch.changelog.Document> = (props) => {
  const [LABEL, CONTENT] = useMemo(() => {
    switch (props.actionType as string) {
      case "new-submission":
        return ["Initial package submitted", PA_InitialSubmission];
      case "withdraw-rai":
        return ["RAI response withdrawn", PA_ResponseWithdrawn];
      case "withdraw-package":
        return ["Package withdrawn", PA_ResponseWithdrawn];
      case "issue-rai":
        return ["RAI issued", PA_RaiIssued];
      case "respond-to-rai":
        return ["RAI response submitted", PA_ResponseSubmitted];
      case "remove-appk-child": {
        if (props.appkChildId) {
          return [
            `Package removed: ${props.appkChildId}`,
            PA_AppkParentRemovedChild,
          ];
        }

        return [
          `Removed from: ${props.appkParentId}`,
          PA_AppkChildRemovedFromParent,
        ];
      }
      case "legacy-withdraw-rai-request":
        return ["RAI response withdrawn requested", PA_ResponseWithdrawn];

      default:
        return [BLANK_VALUE, PA_ResponseSubmitted];
    }
  }, [props.actionType]);

  return (
    <AccordionItem key={props.id} value={props.id}>
      <AccordionTrigger className="bg-gray-100 px-3">
        <p className="flex flex-row gap-2 text-gray-600">
          <strong>{LABEL as string}</strong>
          {" - "}
          {props.timestamp
            ? format(new Date(props.timestamp), "eee, MMM d, yyyy hh:mm:ss a")
            : "Unknown"}
        </p>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <CONTENT {...props} />
      </AccordionContent>
    </AccordionItem>
  );
};

export const PackageActivities = () => {
  const hook = usePackageActivities();

  return (
    <DetailsSection
      id="package_activity"
      title={
        // needed to do this for the download all button
        <div className="flex justify-between">
          {`Package Activity (${hook.data?.length})`}
          {!!hook.data?.length && (
            <Table.Button
              loading={hook.loading}
              onClick={hook.onDownloadAll}
              variant="outline"
            >
              Download all documents
            </Table.Button>
          )}
        </div>
      }
    >
      {!hook.data?.length && (
        <p className="text-gray-500">No package activity recorded</p>
      )}
      <Accordion
        type="multiple"
        className="flex flex-col gap-2"
        defaultValue={hook.accordianDefault}
      >
        {hook.data?.map((CL) => (
          <PackageActivity {...CL._source} key={CL._source.id} />
        ))}
      </Accordion>
    </DetailsSection>
  );
};

export * from "./hook";
