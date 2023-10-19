import { MakoAttachment } from "shared-types";
import { SimplePageContainer } from "@/components";
import { SimplePageTitle } from "@/pages/submission-flow/renderers/OptionsPage";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, RequiredIndicator } from "@/components/Inputs";
import {
  Attachment,
  SpaSubmissionBody,
  useSubmissionMutation,
} from "@/api/submit";
import {
  UploadRecipe,
  grabAllPreSignedURLs,
  uploadAllAttachments,
} from "@/api/uploadAttachments";
import { useGetUser } from "@/api/useGetUser";
import { FormSection } from "@/pages/submission-flow/config/forms/common";
import { z, ZodIssue, ZodObject } from "zod";
import {AttachmentFieldOption} from "@/pages/submission-flow/renderers/FormFields";
import {SUBMISSION_FORM} from "@/consts/forms";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

type FormDescription = Pick<FormSection, "instructions"> & {
  // Limits the higher form header to just a string, no HeadingWithLink
  // is needed at this level.
  heading: string;
};
type FormMeta = {
  origin: string;
  authority: string;
  validator: ZodObject<any>;
};
export interface FormPageConfig {
  meta: FormMeta;
  pageTitle: string;
  description: FormDescription;
  fields: FormSection[];
  // For easy validation when using attachments field
  attachmentRequirements?: AttachmentFieldOption[];
}

export const FormPage = ({
  meta,
  pageTitle,
  description,
  fields,
  attachmentRequirements
}: FormPageConfig) => {
  const [fieldErrors, setFieldErrors] = useState<ZodIssue[]>([]);
  const { data: user } = useGetUser();
  // This shape will change with other authorities like Waivers.
  // One approach could be generics?
  const [data, setData] = useState<SpaSubmissionBody>({
    additionalInformation: "",
    attachments: [],
    id: "",
    raiResponses: [],
    state: "",
    proposedEffectiveDate: 0,
    // Values below are universal for all authorities (waiver & spa)
    origin: meta.origin,
    authority: meta.authority,
    submitterEmail: user?.user?.email || "",
    submitterName: `${user?.user?.given_name} ${user?.user?.family_name}`,
  });
  // Which API we send to may be something that changes with Waiver authorities
  // unless we hit a single endpoint that further routes based on the value(s)
  // given (it does not currently)
  const api = useSubmissionMutation();
  return (
    <SimplePageContainer>
      <SimplePageTitle title={pageTitle} />
      <section id="description" className="max-w-4xl">
        <h2 className="text-2xl font-bold">{description.heading}</h2>
        <p className="my-1">
          <RequiredIndicator /> indicates required field
        </p>
        {description.instructions}
      </section>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          // Re-initiate field errors
          setFieldErrors([]);
          // Check attachment requirements manually
          let attachmentsReady = true; // For the trigger on submit
          if (attachmentRequirements) {
            // Get given file labels
            const fileLabelsGiven = (data.attachments as Attachment[]).map(att => att.label);
            // Get required file labels
            const requiredFilesByLabel = attachmentRequirements?.filter(req => req.required);
            const reqsMet = requiredFilesByLabel.map(req => fileLabelsGiven.includes(req.label));
            if (reqsMet.includes(false)) {
              const missing = requiredFilesByLabel.filter(req => !fileLabelsGiven.includes(req.label));
              console.log("Missing required attachments: ", missing.map(req => req.label).join(", "));
              // Build the ZodError for each missing required file
              const errors = missing.map(req => ({
                path: [SUBMISSION_FORM.ATTACHMENTS],
                message: `${req.label} is missing from the required files upload`
              } as ZodIssue));
              setFieldErrors(prev => [...prev, ...errors]);
              attachmentsReady = false; // Sets the trigger to not fire
            }
          }
          // Build payload from data state
          const payload: SpaSubmissionBody = {
            ...data,
            state: data.id!.split("-")[0],
          };
          console.log(payload);
          const result = meta.validator.safeParse(payload);
          console.log(result);
          if (!(result.success) || !attachmentsReady) {
            // API flight won't take off
            setFieldErrors(prev => [...prev, ...(result as z.SafeParseError<any>).error.errors]);
            console.error("SCHEMA PARSE ERROR(S): ", fieldErrors);
          } else {
            // API flight begins here with file uploads first
            // Get pre signed urls for upload
            const preSignedURLs = await grabAllPreSignedURLs(data.attachments as Attachment[]);
            // Assign one preSignedURL to one Attachment
            const attachmentsToSend: UploadRecipe[] = (data.attachments as Attachment[]).map(
              (attachment: Attachment, idx) => ({
                attachment,
                s3Info: preSignedURLs[idx],
              })
            );
            // Upload attachments with pre signed urls
            await uploadAllAttachments(attachmentsToSend).then(res => {
              // Give attachments info to data state
              setData({
                ...data,
                attachments: attachmentsToSend.map(
                  ({ attachment, s3Info }) =>
                    // Transform Attachment to MakoAttachment
                    ({
                      key: s3Info.key,
                      bucket: s3Info.bucket,
                      date: Date.now(),
                      label: attachment.label,
                      title: attachment.source.name,
                      contentType: attachment.source.type,
                    } satisfies MakoAttachment)
                )
              });
              // API is sent the rest of the payload with attachments metadata
              api.mutate(payload);
            }).catch(err => {
              // Error uploading attachments
              // TODO: Handle file upload failure
              console.log(err);
            });
          }
          // TODO: route back to dashboard on success
        }}
      >
        {fields.map((section, idx) => (
          <section
            className="my-6 max-w-4xl"
            key={`${idx}-${section.id}`}
            id={section.id}
          >
            {typeof section.heading === "object" ? (
              /* Some headings require an additional link to the FAQ. Those
               * are provided in configs as HeadingWithLink objects. */
              <div className="flex justify-between">
                <label htmlFor={section.id} className="text-lg font-bold">
                  {section.heading.text}
                  {section.required && <RequiredIndicator />}
                </label>
                <Link
                  className="text-sky-600 hover:text-sky-800 underline"
                  to={section.heading.linkRoute}
                >
                  {section.heading.linkText}
                </Link>
              </div>
            ) : (
              <label htmlFor={section.id} className="text-lg font-bold">
                {section.heading}
                {section.required && <RequiredIndicator />}
              </label>
            )}
            {/* Render field instruction */}
            {section.instructions}
            {/* Render error messages pertaining to field */}
            {fieldErrors
              .filter((err) => {
                  return (err.path[0] === "state" && section.id === "id") ?
                      true :
                      err.path.includes(section.id);
              })
              .map((err) => (
                <>
                  <span
                    key={`${err.path[0]}-err-msg`}
                    className="text-red-600 text-sm"
                  >
                    {err.message}
                  </span>
                  <br />
                </>
              ))}
            {/* Render field inputs */}
            {section.field(setData)}
          </section>
        ))}
        <div className="flex gap-3">
          <Button className="md:px-12" type="submit">
            Submit
          </Button>
          <Button className="xs:w-full md:px-12" variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </SimplePageContainer>
  );
};
