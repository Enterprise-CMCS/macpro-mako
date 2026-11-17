import { Link } from "react-router";
import {
  CE_ATTACHMENT_LABELS,
  CE_EVENT,
  CE_HARDSHIP_EXCEPTION_AUTHORITY,
  CE_HARDSHIP_KIND_LABELS,
  CE_OPERATION_TYPE,
  type CeHardshipKindCode,
  isKnownStateCode,
  type StateCode,
} from "shared-types";

import { useGetUserDetails } from "@/api";
import {
  ActionForm,
  ActionFormFieldsArg,
  DatePicker,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RequiredIndicator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { AttachmentFileFormatInstructions } from "@/components/ActionForm/actionForm.components";
import { FAQ_TAB } from "@/consts";
import { formSchemas } from "@/formSchemas";
import { convertStateAbbrToFullName } from "@/utils";

import { getFAQLinkForAttachments } from "../faqLinks";
import {
  CENTRA_FORM_DESCRIPTION,
  CENTRA_FORM_TITLE,
  CENTRA_ID_EXAMPLE,
  CENTRA_ID_FAQ_PATH,
  CENTRA_ID_FORMAT_HINT,
  CENTRA_SUCCESS_BODY,
  CENTRA_SUCCESS_HEADER,
  NEW_SUBMISSION_PROGRESS_LOSS_REMINDER,
} from "./content";

const CENTRA_REQUEST_TYPES = [
  "CE_SADE",
  "CE_UNEMPLOYMENT",
  "CE_NEA",
] as const satisfies readonly CeHardshipKindCode[];

const emptyAttachments = {
  ceTemplate: { label: CE_ATTACHMENT_LABELS.ceTemplate, files: [] },
  other: { label: CE_ATTACHMENT_LABELS.other, files: [] },
};

/** Rewrite a CE id prefix when the user changes State. Leave other values unchanged. */
export const syncCeIdPrefix = (state: string, currentId: string): string => {
  const normalized = currentId.toUpperCase();
  if (!/^[A-Z]{2}-CE-/.test(normalized)) return normalized;
  return `${state}${normalized.slice(2)}`;
};

export const authorizedStateFromCeId = (
  id: string,
  states: readonly string[],
): StateCode | null => {
  const match = /^([A-Z]{2})-CE-/.exec(id.toUpperCase());
  if (!match || !isKnownStateCode(match[1]) || !states.includes(match[1])) return null;
  return match[1];
};

const CentraFields = ({
  control,
  setValue,
  getValues,
}: ActionFormFieldsArg<(typeof formSchemas)["ce-record-submitted"]>) => {
  const { data: userDetails } = useGetUserDetails();
  const states = (userDetails?.states ?? [])
    .filter(isKnownStateCode)
    .sort((left, right) =>
      convertStateAbbrToFullName(left).localeCompare(convertStateAbbrToFullName(right)),
    );

  return (
    <>
      <FormField
        control={control}
        name="hardshipKind"
        render={({ field }) => (
          <FormItem className="max-w-xl">
            <FormLabel className="font-semibold" data-testid="request-type-label">
              Request Type <RequiredIndicator />
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger id="ce-request-type" aria-label="Request Type">
                  <SelectValue placeholder="Select a request type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CENTRA_REQUEST_TYPES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {CE_HARDSHIP_KIND_LABELS[code]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="state"
        render={({ field }) => (
          <FormItem className="max-w-sm">
            <FormLabel className="font-semibold" data-testid="state-label">
              State <RequiredIndicator />
            </FormLabel>
            <Select
              onValueChange={(nextState) => {
                if (!isKnownStateCode(nextState)) return;
                field.onChange(nextState);
                const nextId = syncCeIdPrefix(nextState, String(getValues("id") ?? ""));
                const currentId = String(getValues("id") ?? "").toUpperCase();
                if (nextId !== currentId) {
                  setValue("id", nextId, { shouldDirty: true, shouldValidate: true });
                }
              }}
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger id="ce-state" aria-label="State">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {states.map((code) => (
                  <SelectItem key={code} value={code}>
                    {convertStateAbbrToFullName(code)} ({code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="id"
        render={({ field }) => (
          <FormItem>
            <div className="flex gap-4">
              <FormLabel
                htmlFor="ce-submission-id"
                className="font-semibold"
                data-testid="submission-id-label"
              >
                Submission ID <RequiredIndicator />
              </FormLabel>
              <Link
                to={CENTRA_ID_FAQ_PATH}
                target={FAQ_TAB}
                rel="noopener noreferrer"
                className="text-blue-900 underline"
              >
                What is my Submission ID?
              </Link>
            </div>
            <FormDescription id="ce-id-formatting-desc">
              <p>{CENTRA_ID_FORMAT_HINT}</p>
              <p className="text-neutral-500">{CENTRA_ID_EXAMPLE}</p>
            </FormDescription>
            <FormControl>
              <Input
                id="ce-submission-id"
                className="max-w-sm"
                ref={field.ref}
                value={field.value}
                aria-describedby="ce-id-formatting-desc"
                onChange={(event) => {
                  const nextId = event.currentTarget.value.toUpperCase();
                  field.onChange(nextId);
                  const matchedState = authorizedStateFromCeId(nextId, states);
                  if (matchedState && getValues("state") !== matchedState) {
                    setValue("state", matchedState, { shouldDirty: true, shouldValidate: true });
                  }
                }}
              />
            </FormControl>
            <FormMessage announceOn={field.value} />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="proposedEffectiveDate"
        render={({ field }) => (
          <FormItem className="max-w-md">
            <FormLabel className="text-lg font-semibold block" data-testid="submission-date-label">
              Submission Date <RequiredIndicator />
            </FormLabel>
            <FormControl>
              <DatePicker
                onChange={(date) => {
                  if (!date) return;
                  field.onChange(date.getTime());
                }}
                date={field.value ? new Date(field.value) : undefined}
                dataTestId="submissionDate"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export const CentraForm = () => (
  <ActionForm
    schema={formSchemas["ce-record-submitted"]}
    title={CENTRA_FORM_TITLE}
    breadcrumbText="Community Engagement Short-Term Hardship Exception"
    formDescription={CENTRA_FORM_DESCRIPTION}
    formDescriptionProgressLossReminder={NEW_SUBMISSION_PROGRESS_LOSS_REMINDER}
    preSubmissionMessage={CENTRA_FORM_DESCRIPTION}
    fields={CentraFields}
    defaultValues={{
      id: "",
      additionalInformation: "",
      authority: CE_HARDSHIP_EXCEPTION_AUTHORITY,
      event: CE_EVENT.RECORD_SUBMITTED,
      operationType: CE_OPERATION_TYPE.RECORD_SUBMITTED,
      attachments: emptyAttachments,
    }}
    additionalInformation={{
      required: true,
      title: "Additional Information",
      label: "Add anything else you would like to share with CMS.",
    }}
    attachments={{
      title: "Attachments",
      requiredIndicatorForTitle: true,
      instructions: [
        <p data-testid="attachments-instructions" key="centra-attachment-instructions">
          Maximum file size of 80 MB per attachment.{" "}
          <span className="font-bold">You can add multiple files per attachment type.</span> At
          least one file is required across Template and Other Supporting Documentation. Read the
          description for each of the attachment types on the{" "}
          <Link
            to={getFAQLinkForAttachments("ce-record-submitted")}
            target={FAQ_TAB}
            rel="noopener noreferrer"
            className="text-blue-900 underline"
          >
            FAQ Page
          </Link>
          .
        </p>,
        <AttachmentFileFormatInstructions key="centra-file-formats" />,
      ],
    }}
    documentPollerArgs={{
      property: "id",
      documentChecker: (check) => check.recordExists,
    }}
    bannerPostSubmission={{
      header: CENTRA_SUCCESS_HEADER,
      body: CENTRA_SUCCESS_BODY,
      variant: "success",
    }}
    draftOptions={{
      enabled: true,
      event: CE_EVENT.RECORD_SUBMITTED,
      idLabel: "Submission ID",
    }}
  />
);
