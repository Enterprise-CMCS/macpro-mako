import { Accordion, DetailsSection } from "@/components";
import { opensearch } from "shared-types";
import { FC, useMemo } from "react";
import { Button } from "@/components/Inputs";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components";
import * as Table from "@/components/Table";
import { BLANK_VALUE } from "@/consts";
import { format } from "date-fns";
import { usePackageActivities, useAttachmentService } from "./hook";

export const PA_InitialSubmission: FC<opensearch.changelog.Document> = (
  props
) => {
  const hook = useAttachmentService(props);

  return (
    <div className="flex flex-col gap-6">
      <Table.Table>
        <Table.TableHeader>
          <Table.TableRow>
            <Table.TableHead className="w-[300px]">
              Document Type
            </Table.TableHead>
            <Table.TableHead>Attached File</Table.TableHead>
          </Table.TableRow>
        </Table.TableHeader>
        <Table.TableBody>
          {props.attachments?.map((ATC) => {
            return (
              <Table.TableRow key={`${props.id}-${ATC.key}`}>
                <Table.TableCell>{ATC.title}</Table.TableCell>
                <Table.TableCell>
                  <Button
                    className="ml-[-15px]"
                    variant="link"
                    onClick={() => {
                      hook.onUrl(ATC).then(window.open);
                    }}
                  >
                    {ATC.filename}
                  </Button>
                </Table.TableCell>
              </Table.TableRow>
            );
          })}
        </Table.TableBody>
      </Table.Table>

      <Button
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
      </Button>

      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p>{props.additionalInformation || "No information submitted"}</p>
      </div>
    </div>
  );
};

export const PA_ResponseSubmitted: FC<opensearch.changelog.Document> = (
  props
) => {
  const hook = useAttachmentService(props);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attached File</h2>
        {!props.attachments?.length && <p>No information submitted</p>}
        {props.attachments?.map((ATC) => (
          <Button
            key={`${props.id}-${ATC.key}`}
            className="my-1 p-0"
            variant="link"
            onClick={() => {
              hook.onUrl(ATC).then(window.open);
            }}
          >
            {ATC.filename}
          </Button>
        ))}
      </div>
      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p>{props.additionalInformation || "No information submitted"}</p>
      </div>
    </div>
  );
};

export const PA_ResponseWithdrawn: FC<opensearch.changelog.Document> = (
  props
) => {
  const hook = useAttachmentService(props);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attached File</h2>
        {!props.attachments?.length && <p>No information submitted</p>}
        {props.attachments?.map((ATC) => (
          <Button
            variant="link"
            key={`${props.id}-${ATC.key}`}
            className="my-1 p-0"
            onClick={() => {
              hook.onUrl(ATC).then(window.open);
            }}
          >
            {ATC.filename}
          </Button>
        ))}
      </div>
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
        <h2 className="font-bold text-lg mb-2">Attached File</h2>
        {!props.attachments?.length && <p>No information submitted</p>}
        {props.attachments?.map((ATC) => (
          <Button
            variant="link"
            key={`${props.id}-${ATC.key}`}
            className="my-1 p-0"
            onClick={() => {
              hook.onUrl(ATC).then(window.open);
            }}
          >
            {ATC.filename}
          </Button>
        ))}
      </div>
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
    switch (props.actionType) {
      case "new-submission":
        return ["Initial package submitted", PA_InitialSubmission];
      case "withdraw-rai":
        return ["RAI response withdrawn", PA_ResponseWithdrawn];
      case "withdraw-package":
        return ["RAI package withdrawn", PA_ResponseWithdrawn];
      case "issue-rai":
        return ["RAI issued", PA_RaiIssued];
      case "respond-to-rai":
        return ["RAI response submitted", PA_ResponseSubmitted];
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
          {format(new Date(props.timestamp), "eee, MMM d, yyyy hh:mm:ss a")}
        </p>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <CONTENT {...props} />
      </AccordionContent>
    </AccordionItem>
  );
};

export const PackageActivities = (props: opensearch.main.Document) => {
  const hook = usePackageActivities(props);

  return (
    <DetailsSection
      id="package-activities"
      title={
        // needed to do this for the download all button
        <div className="flex justify-between">
          {`Package Activity (${hook.data?.length})`}
          {!!hook.data?.length && (
            <Button
              loading={hook.loading}
              onClick={hook.onDownloadAll}
              variant="outline"
            >
              Download all documents
            </Button>
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
