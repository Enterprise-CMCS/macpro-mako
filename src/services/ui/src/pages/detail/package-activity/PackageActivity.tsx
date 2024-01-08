import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components";
import { opensearch } from "shared-types";
import { getAttachmentUrl } from "@/api";
import { FC, useMemo } from "react";
import { Button } from "@/components/Inputs";
import * as Table from "@/components/Table";
import { BLANK_VALUE } from "@/consts";

export const PA_InitialSubmission: FC<opensearch.changelog.Document> = (
  props
) => {
  return (
    <Table.Table>
      <Table.TableHeader>
        <Table.TableRow>
          <Table.TableHead className="w-[300px]">Document Type</Table.TableHead>
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
                    getAttachmentUrl(
                      props.packageId,
                      ATC.bucket,
                      ATC.key,
                      ATC.filename
                    ).then(window.open);
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
  );
};

export const PA_ResponseSubmitted: FC<opensearch.changelog.Document> = (
  props
) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attached File</h2>
        {props.attachments?.map((ATC) => (
          <button
            key={`${props.id}-${ATC.key}`}
            className="text-blue-600 my-1"
            onClick={() => {
              getAttachmentUrl(
                props.packageId,
                ATC.bucket,
                ATC.key,
                ATC.filename
              ).then(window.open);
            }}
          >
            {ATC.filename}
          </button>
        ))}
      </div>
      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p>{props.additionalInformation || "-- --"}</p>
      </div>
    </div>
  );
};

export const PA_ResponseWithdrawn: FC<opensearch.changelog.Document> = (
  props
) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attached File</h2>
        {props.attachments?.map((ATC) => (
          <button
            key={`${props.id}-${ATC.key}`}
            className="text-blue-600 my-1"
            onClick={() => {
              getAttachmentUrl(
                props.packageId,
                ATC.bucket,
                ATC.key,
                ATC.filename
              ).then(window.open);
            }}
          >
            {ATC.filename}
          </button>
        ))}
      </div>
      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p>{props.additionalInformation || "-- --"}</p>
      </div>
    </div>
  );
};

export const PA_RaiIssued: FC<opensearch.changelog.Document> = (props) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Attached File</h2>
        {props.attachments?.map((ATC) => (
          <button
            key={`${props.id}-${ATC.key}`}
            className="text-blue-600 my-1"
            onClick={() => {
              getAttachmentUrl(
                props.packageId,
                ATC.bucket,
                ATC.key,
                ATC.filename
              ).then(window.open);
            }}
          >
            {ATC.filename}
          </button>
        ))}
      </div>
      <div>
        <h2 className="font-bold text-lg mb-2">Additional Information</h2>
        <p>{props.additionalInformation || "-- --"}</p>
      </div>
    </div>
  );
};

const usePackageActivity = (doc: opensearch.changelog.Document) => {
  return useMemo(() => {
    switch (doc.actionType) {
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
  }, [doc.actionType]);
};

export const PackageActivity: FC<opensearch.changelog.Document> = (props) => {
  const [label, Content] = usePackageActivity(props);

  return (
    <AccordionItem key={props.id} value={props.id}>
      <AccordionTrigger className="bg-gray-100 px-3">
        <p className="flex flex-row gap-2">
          <strong>{label as string}</strong>
          {" - "}
          {/* WHAT Date */}
          {new Date(props.timestamp).toDateString()}
        </p>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <Content {...props} />
      </AccordionContent>
    </AccordionItem>
  );
};
