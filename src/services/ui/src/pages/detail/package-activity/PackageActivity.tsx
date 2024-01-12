import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components";
import { opensearch } from "shared-types";
import { FC, useMemo } from "react";
import { Button } from "@/components/Inputs";
import * as Table from "@/components/Table";
import { BLANK_VALUE } from "@/consts";
import { format } from "date-fns";
import { useAttachmentService } from "./hook";
import { Loader2 } from "lucide-react";

export const PA_InitialSubmission: FC<opensearch.changelog.Document> = (
  props
) => {
  const hook = useAttachmentService(props);

  return (
    <div className="flex flex-col gap-6">
      <>
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
          onClick={() => {
            if (!props.attachments?.length) return;
            hook.onZip(props.attachments);
          }}
        >
          {hook.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Download documents
        </Button>
      </>
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
        <p className="flex flex-row gap-2 text-gray-600">
          <strong>{label as string}</strong>
          {" - "}
          {format(new Date(props.timestamp), "eee, MMM d, yyyy hh:mm:ss a")}
        </p>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <Content {...props} />
      </AccordionContent>
    </AccordionItem>
  );
};
