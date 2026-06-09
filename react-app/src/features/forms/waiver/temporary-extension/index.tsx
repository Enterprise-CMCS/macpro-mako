import { useState } from "react";
import { Link, useParams } from "react-router";

import { useGetItem } from "@/api";
import {
  ActionForm,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  LoadingSpinner,
  RequiredIndicator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { FAQ_TAB } from "@/consts";
import { formSchemas } from "@/formSchemas";

import { getFAQLinkForAttachments } from "../../faqLinks";
import { NEW_SUBMISSION_PROGRESS_LOSS_REMINDER } from "../../new-submission/content";

const actionTypeMap = {
  New: "Initial Waiver",
  Renew: "Waiver Renewal",
};

export const TemporaryExtensionForm = () => {
  const { id: waiverId } = useParams<{ id: string }>();
  const { data: submission, isLoading: isSubmissionLoading } = useGetItem(waiverId, {
    enabled: waiverId !== undefined,
  });

  const [temporaryExtensionType, setTemporaryExtensionType] = useState<string>("");

  if (waiverId && isSubmissionLoading) {
    return <LoadingSpinner />;
  }

  const actionType = submission?._source?.actionType;
  const actionTypeLabel =
    actionType && actionType in actionTypeMap
      ? actionTypeMap[actionType as keyof typeof actionTypeMap]
      : undefined;
  const type =
    submission?._source && actionTypeLabel
      ? `${submission._source.authority} ${actionTypeLabel}`
      : null;
  const attachmentAuthority = submission?._source?.authority ?? temporaryExtensionType;

  return (
    <ActionForm
      schema={formSchemas["temporary-extension"]}
      title="Temporary Extension Request Details"
      breadcrumbText={`Request ${
        submission ? submission._source.authority : "1915(b) or 1915(c)"
      } Temporary Extension`}
      formDescriptionProgressLossReminder={NEW_SUBMISSION_PROGRESS_LOSS_REMINDER}
      fields={(form) => {
        const triggerTemporaryExtensionTypeValidation = () => {
          void form.trigger("ids.validAuthority.authority");
        };

        return (
          <>
            {waiverId && submission ? (
              <div>
                <p>Temporary Extension Type</p>
                <p className="text-xl">{submission._source.authority}</p>
              </div>
            ) : (
              <FormField
                name="ids.validAuthority.authority"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>
                      <strong className="font-bold">Temporary Extension Type</strong>{" "}
                      <RequiredIndicator />
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setTemporaryExtensionType(value);
                        triggerTemporaryExtensionTypeValidation();
                      }}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="-- select a temporary extension type --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1915(b)">1915(b)</SelectItem>
                        <SelectItem value="1915(c)">1915(c)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {submission ? (
              <div>
                <p>Approved Initial or Renewal Waiver Number</p>
                <p className="text-xl">{waiverId}</p>
              </div>
            ) : (
              <FormField
                name="ids.validAuthority.waiverNumber"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem className="max-w-md">
                      <FormLabel data-testid="waiverNumber-label">
                        <strong className="font-bold">
                          Approved Initial or Renewal Waiver Number
                        </strong>{" "}
                        <RequiredIndicator />
                      </FormLabel>
                      <FormDescription>
                        Enter the existing waiver number in the format it was approved, using a dash
                        after the two character state abbreviation.
                      </FormDescription>
                      <FormControl>
                        <Input
                          className="max-w-sm"
                          ref={field.ref}
                          value={field.value}
                          onChange={(e) => field.onChange(e.currentTarget.value.toUpperCase())}
                          onBlur={() => {
                            field.onBlur();
                            triggerTemporaryExtensionTypeValidation();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
            <FormField
              control={form.control}
              name="ids.id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="requestNumber-label">
                    <strong className="font-bold">
                      Temporary Extension Request Number
                      <RequiredIndicator />
                    </strong>
                    <Link
                      className="text-blue-600 cursor-pointer hover:underline px-4"
                      to={"/faq/waiver-extension-id-format"}
                      target={FAQ_TAB}
                      rel="noopener noreferrer"
                    >
                      What is my Temporary Extension Request Number?
                    </Link>
                  </FormLabel>
                  <FormDescription className="max-w-md">
                    Must use a waiver extension request number with the format SS-####.R##.TE## or
                    SS-#####.R##.TE##
                  </FormDescription>
                  <FormControl>
                    <Input
                      className="max-w-sm"
                      ref={field.ref}
                      value={field.value}
                      onChange={(e) => field.onChange(e.currentTarget.value.toUpperCase())}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            {type && (
              <div>
                <p>Type</p>
                <p className="text-xl">{type}</p>
              </div>
            )}
          </>
        );
      }}
      defaultValues={{
        ids: {
          validAuthority: {
            authority: submission?._source?.authority ?? "",
            waiverNumber: waiverId ?? "",
          },
        },
      }}
      attachments={{
        faqLink: getFAQLinkForAttachments(`temporary-extension-${attachmentAuthority}`),
      }}
      documentPollerArgs={{
        property: (data) => data.id,
        documentChecker: (check) => check.recordExists,
      }}
      bannerPostSubmission={{
        header: "Temporary extension request submitted",
        body: "Your submission has been received.",
        variant: "success",
      }}
      draftOptions={{
        enabled: true,
        event: "temporary-extension",
        idPath: "ids.id",
        authorityPath: "ids.validAuthority.authority",
        requiredSaveFields: [
          {
            path: "ids.validAuthority.authority",
            message: "Please select a Temporary Extension Type before saving.",
          },
        ],
        validationPaths: ["ids.validAuthority.authority"],
        relatedIdValidations: [
          {
            sourcePath: "ids.validAuthority.waiverNumber",
            sourceLabel: "Approved Initial or Renewal Waiver Number",
            targetPath: "ids.id",
            targetLabel: "The Temporary Extension Request Number",
          },
        ],
      }}
    />
  );
};
