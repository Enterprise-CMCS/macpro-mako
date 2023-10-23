import {MakoAttachment, ReactQueryApiError} from "shared-types";
import { SimplePageContainer } from "@/components";
import { SimplePageTitle } from "@/pages/submission-flow/renderers/OptionsPage";
import {Dispatch, SetStateAction, useMemo, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, RequiredIndicator } from "@/components/Inputs";
import {
  Attachment,
  SpaSubmissionBody, spaSubmissionId,
  useSubmissionMutation,
} from "@/api/submit";
import {
  UploadRecipe,
  grabAllPreSignedURLs,
  uploadAllAttachments,
} from "@/api/uploadAttachments";
import { useGetUser } from "@/api/useGetUser";
import { FormSection } from "@/pages/submission-flow/config/forms/common";
import { ZodIssue, ZodObject } from "zod";
import {AttachmentFieldOption} from "@/pages/submission-flow/renderers/FormFields";
import {SUBMISSION_FORM} from "@/consts/forms";
import {FAQ_TARGET, ROUTES} from "@/routes";
import {Alert} from "@/components/Alert";

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
type FileCheckStatus = {
  status: boolean[];
  invalidFiles: string[];
}

const SubmissionInstruction = () => (
  <p className="font-light mb-6 max-w-4xl">
    <i>
      Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email. If you leave this page, you will lose your progress on
      this form.
    </i>
  </p>
);

const FAQCallout = () => (
  <div className="flex justify-between bg-[#f0fafe] py-10 px-20 my-10">
    <span className="text-2xl font-light">Do you have questions or need support?</span>
    <a
      target={FAQ_TARGET}
      href={ROUTES.FAQ}
      className=""
    >
      <Button>
        View FAQ
      </Button>
    </a>
  </div>
);

/** Takes the requirements and the labels for each file given to check for
 * invalid multiples for a single-file field (i.e. CMS 179) */
const checkMultipleFiles = (
  requirements: AttachmentFieldOption[],
  givenFiles: string[]
): FileCheckStatus => {
  const singleFileOnly = requirements.filter(req => !req.multiple).map(req => req.label);
  return {
    status: singleFileOnly.map(reqLabel =>
      givenFiles.filter(label => label === reqLabel).length <= 1
    ),
    invalidFiles: singleFileOnly.filter(reqLabel =>
      givenFiles.filter(givenLabel => givenLabel === reqLabel)
    )
  };
};

/** Takes the requirements and the labels for each file given to check that
 * all required files have been given */
const checkRequiredFiles = (
  requirements: AttachmentFieldOption[],
  givenFiles: string[]
): FileCheckStatus => {
  // Get required file labels
  const requiredFiles = requirements?.filter(req => req.required);
  return {
    status: requiredFiles.map(req => givenFiles.includes(req.label)),
    invalidFiles: requiredFiles.map(req => req.label).filter(label => !givenFiles.includes(label))
  };
};

/** Takes the requirements and the attachments given to run all file checks.
 * Sets errors using the `setError` function passed in */
const validateAttachments = (
  attachmentsData: Attachment[],
  requirements: AttachmentFieldOption[],
  setErrors: Dispatch<SetStateAction<ZodIssue[]>>
) => {
  let attachmentsReady = true; // For the trigger on submit
  // Get just the label for each attachment (simplifies checks)
  const fileLabelsGiven = attachmentsData.map(att => att.label);
  // Check for invalid multiples or missing required files
  const invalidMultiples = checkMultipleFiles(requirements, fileLabelsGiven);
  const missingRequiredFiles = checkRequiredFiles(requirements, fileLabelsGiven);
  // Add errors in from file checks
  if (missingRequiredFiles.status.includes(false)) {
    const errors = missingRequiredFiles.invalidFiles.map(label => ({
      path: [SUBMISSION_FORM.ATTACHMENTS],
      message: `${label} is missing from the required files upload`
    } as ZodIssue));
    setErrors(prev => [...prev, ...errors]);
    attachmentsReady = false; // Sets the trigger to not fire
  }
  if (invalidMultiples.status.includes(false)) {
    const errors = invalidMultiples.invalidFiles.map(label => ({
      path: [SUBMISSION_FORM.ATTACHMENTS],
      message: `${label} was given multiple files but only requires one`
    } as ZodIssue));
    setErrors(prev => [...prev, ...errors]);
    attachmentsReady = false; // Sets the trigger to not fire
  }
  return attachmentsReady;
};

/** Gets ample pre-signed urls for upload, and matches 1:1 with the given Attachments[] */
const attachmentsWithS3Location = async (attachments: Attachment[]): Promise<UploadRecipe[]> => {
  // Get pre signed urls for upload
  const preSignedURLs = await grabAllPreSignedURLs(attachments);
  // Assign one preSignedURL to one Attachment
  return attachments.map(
    (attachment: Attachment, idx) => ({
      attachment,
      s3Info: preSignedURLs[idx],
    })
  );
};

/** Uses the s3Info of each UploadRecipe to upload the file to its designated
 * bucket and transforms the recipes into MakoAttachments */
const sendAttachments = async (recipes: UploadRecipe[]): Promise<MakoAttachment[]> => {
  // Upload attachments with pre signed urls
  return await uploadAllAttachments(recipes).then(res => {
    console.log(res);
    return recipes.map(
      ({attachment, s3Info}) =>
        // Transform Attachment to MakoAttachment
        ({
          key: s3Info.key,
          bucket: s3Info.bucket,
          uploadDate: Date.now(),
          title: attachment.label,
          filename: attachment.source.name,
          contentType: attachment.source.type,
        } satisfies MakoAttachment)
    ) as MakoAttachment[];
  }).catch(err => {
    console.error(err);
    // TODO: Handle errors from upload service
    return [];
  });
};

const FormSubmissionError = ({ response }: ReactQueryApiError) => {
  return <Alert className="my-8" variant="destructive">Error submitting: {response.data.message}</Alert>;
};

export const FormPage = ({
  meta,
  pageTitle,
  description,
  fields,
  attachmentRequirements
}: FormPageConfig) => {
  const [fieldErrors, setFieldErrors] = useState<ZodIssue[]>([]);
  const { data: user } = useGetUser();
  const userStates = useMemo(() => user?.user?.["custom:state"]?.split(","), [user]);
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
    <SimplePageContainer width="lg">
      <SimplePageTitle title={pageTitle} />
      {api.error && <FormSubmissionError {...api.error} />}
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
          const attachmentsReady =
            !attachmentRequirements ?
              // No requirements, always true
              true :
              // otherwise we check
              validateAttachments(
                (data.attachments as Attachment[]),
                attachmentRequirements,
                setFieldErrors
              );
          // Failed to meet requirements
          if (!attachmentsReady) {
            console.log("Attachments failed to meet the requirement. Check errors in UI.");
          }
          // Derive state code from ID
          const stateCode = data.id!.split("-")[0];
          // Check user access to state
          if (!userStates || !userStates.includes(stateCode)) {
            setFieldErrors((errs) => [...errs, {
              path: [SUBMISSION_FORM.SPA_ID],
              message: `User does not have access to the given state: ${stateCode}`
            } as ZodIssue]);
            return;
          }
          let uploadedAttachments: MakoAttachment[] = [];
          // API flight begins here with file uploads first IF there are attachments
          if (data.attachments && attachmentsReady) {
            const uploadRecipes = await attachmentsWithS3Location(data.attachments as Attachment[]);
            uploadedAttachments = await sendAttachments(uploadRecipes);
          }
          // Build payload from data state
          const payload: SpaSubmissionBody = {
            ...data,
            state: stateCode, // Derive state from ID
            attachments: uploadedAttachments // Empty array if no attachments/requirements
          };
          console.log(payload);
          const result = meta.validator.safeParse(payload);
          if (!result.success) {
            // API flight won't take off
            setFieldErrors(prev => [...prev, ...result.error.errors]);
            return;
          } else if (result.success && attachmentsReady) {
            // API is sent the rest of the payload with attachments metadata
            api.mutate(payload);
          }
          // TODO: route back to dashboard on success
        }}
      >
        {fields.map((section, idx) => (
          <section
            className="my-6"
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
              .map((err, idx) => (
                <>
                  <span
                    key={`${err.path[0]}-err-msg-${idx}`}
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
        <SubmissionInstruction />
        <div className="flex gap-3">
          <Button className="md:px-12" type="submit">
            Submit
          </Button>
          <Button className="xs:w-full md:px-12" variant="outline">
            Cancel
          </Button>
        </div>
        <FAQCallout />
      </form>
    </SimplePageContainer>
  );
};
