import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as I from "@/components/Inputs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API } from "aws-amplify";
import { OneMacTransform } from "shared-types";
import { useGetUser } from "@/api/useGetUser";
import { getItem } from "@/api";
import {
  SimplePageContainer,
  Alert,
  LoadingSpinner,
  BreadCrumbs,
} from "@/components";
import { ConfirmationModal } from "@/components/Modal/ConfirmationModal";
import { FAQ_TARGET, ROUTES } from "@/routes";
import { getUserStateCodes } from "@/utils";
import { NEW_SUBMISSION_CRUMBS } from "@/pages/create/create-breadcrumbs";
let stateCodes: string[] = [];
function startsWithValidPrefix(value: string) {
  for (const prefix of stateCodes) {
    if (value.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}

async function doesNotExist(value: string) {
  try {
    await getItem(value);
    return false;
  } catch (error) {
    return true;
  }
}

const formSchema = z.object({
  id: z
    .string()
    .regex(
      /^[A-Z]{2}-\d{2}-\d{4}(-[A-Z0-9]{1,4})?$/,
      "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-XXXX"
    )
    .refine((value) => startsWithValidPrefix(value), {
      message: "You do not have access to this state.",
    })
    .refine(async (value) => doesNotExist(value), {
      message: "SPA ID already exists.",
    }),
  additionalInformation: z.string().max(4000).optional(),
  attachments: z.object({
    cmsForm179: z
      .array(z.instanceof(File))
      .length(
        1,
        "Required: You must submit exactly one file for CMS Form 179."
      ),
    spaPages: z.array(z.instanceof(File)).refine((value) => value.length > 0, {
      message: "Required",
    }),
    coverLetter: z.array(z.instanceof(File)).optional(),
    tribalEngagement: z.array(z.instanceof(File)).optional(),
    existingStatePlanPages: z.array(z.instanceof(File)).optional(),
    publicNotice: z.array(z.instanceof(File)).optional(),
    sfq: z.array(z.instanceof(File)).optional(),
    tribalConsultation: z.array(z.instanceof(File)).optional(),
    other: z.array(z.instanceof(File)).optional(),
  }),
  proposedEffectiveDate: z.date(),
});

export type MedicaidFormSchema = z.infer<typeof formSchema>;
type UploadKeys = keyof MedicaidFormSchema["attachments"];
export type PreSignedURL = {
  url: string;
  key: string;
  bucket: string;
};

// first argument in the array is the name that will show up in the form submission
// second argument is used when mapping over for the label
const attachmentList = [
  { name: "cmsForm179", label: "CMS Form 179", required: true },
  { name: "spaPages", label: "SPA Pages", required: true },
  { name: "coverLetter", label: "Cover Letter", required: false },
  {
    name: "tribalEngagement",
    label: "Document Demonstrating Good-Faith Tribal Engagement",
    required: false,
  },
  {
    name: "existingStatePlanPages",
    label: "Existing State Plan Page(s)",
    required: false,
  },
  { name: "publicNotice", label: "Public Notice", required: false },
  { name: "sfq", label: "Standard Funding Questions (SFQs)", required: false },
  { name: "tribalConsultation", label: "Tribal Consultation", required: false },
  { name: "other", label: "Other", required: false },
] as const;

export const MedicaidForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);

  const form = useForm<MedicaidFormSchema>({
    resolver: zodResolver(formSchema),
  });
  const { data: user } = useGetUser();
  stateCodes = getUserStateCodes(user?.user);

  const handleSubmit: SubmitHandler<MedicaidFormSchema> = async (data) => {
    const uploadKeys = Object.keys(data.attachments) as UploadKeys[];
    const uploadedFiles: any[] = [];
    const fileMetaData: NonNullable<OneMacTransform["attachments"]> = [];

    const presignedUrls: Promise<PreSignedURL>[] = uploadKeys
      .filter((key) => data.attachments[key] !== undefined)
      .map(() =>
        API.post("os", "/getUploadUrl", {
          body: {},
        })
      );
    const loadPresignedUrls = await Promise.all(presignedUrls);

    uploadKeys
      .filter((key) => data.attachments[key] !== undefined)
      .forEach((uploadKey, index) => {
        const attachmenListObject = attachmentList?.find(
          (item) => item.name === uploadKey
        );
        const title = attachmenListObject ? attachmenListObject.label : "Other";
        const fileGroup = data.attachments[uploadKey] as File[];

        // upload all files in this group and track there name
        for (const file of fileGroup) {
          uploadedFiles.push(
            fetch(loadPresignedUrls[index].url, {
              body: file,
              method: "PUT",
            })
          );

          fileMetaData.push({
            key: loadPresignedUrls[index].key,
            filename: file.name,
            title: title,
            bucket: loadPresignedUrls[index].bucket,
            uploadDate: Date.now(),
          });
        }
      });

    await Promise.all(uploadedFiles);

    const dataToSubmit: OneMacTransform & {
      state: string;
      proposedEffectiveDate: number;
      authority: string;
    } = {
      id: data.id,
      additionalInformation: data?.additionalInformation ?? null,
      attachments: fileMetaData,
      origin: "micro",
      authority: "medicaid spa",
      raiResponses: [],
      raiWithdrawEnabled: false,
      submitterEmail: user?.user?.email ?? "N/A",
      submitterName:
        `${user?.user?.given_name} ${user?.user?.family_name}` ?? "N/A",
      proposedEffectiveDate: data.proposedEffectiveDate.getTime(),
      state: data.id.split("-")[0],
    };

    try {
      await API.post("os", "/submit", {
        body: dataToSubmit,
      });
      setSuccessModalIsOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SimplePageContainer>
      <BreadCrumbs options={NEW_SUBMISSION_CRUMBS(location.pathname)} />
      <I.Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="my-6 space-y-8 mx-auto"
        >
          <section>
            <h1 className="font-bold text-2xl mb-2">Medicaid SPA Details</h1>
            <p className="my-1">
              <I.RequiredIndicator /> Indicates a required field
            </p>
            <p className="font-light mb-6 max-w-4xl">
              Once you submit this form, a confirmation email is sent to you and
              to CMS. CMS will use this content to review your package, and you
              will not be able to edit this form. If CMS needs any additional
              information, they will follow up by email.{" "}
              <strong className="bold">
                If you leave this page, you will lose your progress on this
                form.
              </strong>
            </p>
          </section>
          <I.FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <I.FormItem>
                <div className="flex justify-between">
                  <I.FormLabel className="text-lg font-bold">
                    SPA ID
                    <I.RequiredIndicator />
                  </I.FormLabel>
                  <Link
                    to="/faq/#spa-id-format"
                    target={FAQ_TARGET}
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    What is my SPA ID?
                  </Link>
                </div>
                <p className="text-gray-500 font-light">
                  Must follow the format SS-YY-NNNN or SS-YY-NNNN-XXXX.
                </p>
                <p className="italic text-gray-500 font-light">
                  Reminder - CMS recommends that all SPA numbers start with the
                  year in which the package is submitted.
                </p>
                <I.FormControl className="max-w-sm">
                  <I.Input
                    {...field}
                    onInput={(e) => {
                      if (e.target instanceof HTMLInputElement) {
                        e.target.value = e.target.value.toUpperCase();
                      }
                    }}
                  />
                </I.FormControl>
                <I.FormMessage />
              </I.FormItem>
            )}
          />
          <I.FormField
            control={form.control}
            name="proposedEffectiveDate"
            render={({ field }) => (
              <I.FormItem className="max-w-sm">
                <I.FormLabel className="text-lg font-bold block">
                  Proposed Effective Date of Medicaid SPA
                  <I.RequiredIndicator />
                </I.FormLabel>
                <I.FormControl>
                  <I.DatePicker onChange={field.onChange} date={field.value} />
                </I.FormControl>
                <I.FormMessage />
              </I.FormItem>
            )}
          />
          <section>
            <h3 className="text-2xl font-bold font-sans">Attachments</h3>
            <p>
              Maximum file size of 80 MB per attachment.{" "}
              <strong>
                You can add multiple files per attachment type, except for the
                CMS Form 179.
              </strong>{" "}
              Read the description for each of the attachment types on the{" "}
              {
                <Link
                  to="/faq/#medicaid-spa-attachments"
                  target={FAQ_TARGET}
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  FAQ Page
                </Link>
              }
              .
            </p>
            <br />
            <p>
              We accept the following file formats:{" "}
              <strong className="bold">.docx, .jpg, .png, .pdf, .xlsx,</strong>{" "}
              and a few others. See the full list on the{" "}
              {
                <Link
                  to="/faq/#acceptable-file-formats"
                  target={FAQ_TARGET}
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  FAQ Page
                </Link>
              }
              .
            </p>
            <br />
            <p>
              <I.RequiredIndicator />
              At least one attachment is required.
            </p>
          </section>
          {attachmentList.map(({ name, label, required }) => (
            <I.FormField
              key={name}
              control={form.control}
              name={`attachments.${name}`}
              render={({ field }) => (
                <I.FormItem>
                  <I.FormLabel>
                    {label}
                    {required ? <I.RequiredIndicator /> : ""}
                  </I.FormLabel>
                  <I.Upload
                    files={field?.value ?? []}
                    setFiles={field.onChange}
                  />
                  <I.FormMessage />
                </I.FormItem>
              )}
            />
          ))}
          <I.FormField
            control={form.control}
            name="additionalInformation"
            render={({ field }) => (
              <I.FormItem>
                <h3 className="font-bold text-2xl font-sans">
                  Additional Information
                </h3>
                <I.FormLabel className="font-normal">
                  Add anything else you would like to share with CMS, limited to
                  4000 characters
                </I.FormLabel>
                <I.Textarea {...field} className="h-[200px] resize-none" />
                <I.FormDescription>4,000 characters allowed</I.FormDescription>
              </I.FormItem>
            )}
          />
          <div className="my-2">
            <i>
              Once you submit this form, a confirmation email is sent to you and
              to CMS. CMS will use this content to review your package, and you
              will not be able to edit this form. If CMS needs any additional
              information, they will follow up by email. If you leave this page,
              you will lose your progress on this form.
            </i>
          </div>
          {Object.keys(form.formState.errors).length !== 0 ? (
            <Alert className="mb-6" variant="destructive">
              Missing or malformed information. Please see errors above.
            </Alert>
          ) : null}
          {form.formState.isSubmitting ? (
            <div className="p-4">
              <LoadingSpinner />
            </div>
          ) : null}
          <div className="flex gap-2">
            <I.Button
              disabled={form.formState.isSubmitting}
              type="submit"
              className="px-12"
            >
              Submit
            </I.Button>
            <I.Button
              type="button"
              variant="outline"
              onClick={() => setCancelModalIsOpen(true)}
              className="px-12"
            >
              Cancel
            </I.Button>

            {/* Success Modal */}
            <ConfirmationModal
              open={successModalIsOpen}
              onAccept={() => {
                setSuccessModalIsOpen(false);
                navigate(ROUTES.DASHBOARD);
              }}
              onCancel={() => setSuccessModalIsOpen(false)}
              title="Submission Successful"
              body={
                <p>
                  Please be aware that it may take up to a minute for your
                  submission to show in the Dashboard.
                </p>
              }
              cancelButtonVisible={false}
              acceptButtonText="Go to Dashboard"
            />

            {/* Cancel Modal */}
            <ConfirmationModal
              open={cancelModalIsOpen}
              onAccept={() => {
                setCancelModalIsOpen(false);
                navigate(ROUTES.DASHBOARD);
              }}
              onCancel={() => setCancelModalIsOpen(false)}
              cancelButtonText="Return to Form"
              acceptButtonText="Yes"
              title="Are you sure you want to cancel?"
              body={
                <p>
                  If you leave this page you will lose your progress on this
                  form
                </p>
              }
            />
          </div>
        </form>
      </I.Form>
    </SimplePageContainer>
  );
};
