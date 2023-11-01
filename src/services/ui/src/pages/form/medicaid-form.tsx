import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as I from "@/components/Inputs";
import { Link, useNavigate } from "react-router-dom";
import { API } from "aws-amplify";
import { OneMacTransform } from "shared-types";
import { useGetUser } from "@/api/useGetUser";
import { BREAD_CRUMB_CONFIG_NEW_SUBMISSION } from "@/components/BreadCrumb/bread-crumb-config";
import {
  SimplePageContainer,
  Alert,
  LoadingSpinner,
  Modal,
  BreadCrumbs,
} from "@/components";
import { ROUTES } from "@/routes";

const formSchema = z.object({
  id: z
    .string()
    .regex(
      /^[A-Z]{2}-\d{2}-\d{4}(-\d{4})?$/,
      "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-xxxx"
    ),
  additionalInformation: z.string().max(4000).optional(),
  attachments: z.object({
    cmsForm179: z.array(z.instanceof(File)).nonempty(),
    spaPages: z.array(z.instanceof(File)).nonempty(),
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
  { name: "cmsForm179", label: "CMS 179", required: true },
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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalChildren, setModalChildren] = useState(<div></div>);
  const form = useForm<MedicaidFormSchema>({
    resolver: zodResolver(formSchema),
  });
  const { data: user } = useGetUser();
  const navigate = useNavigate();

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
      submitterEmail: user?.user?.email ?? "N/A",
      submitterName:
        `${user?.user?.given_name} ${user?.user?.family_name}` ?? "N/A",
      proposedEffectiveDate: data.proposedEffectiveDate.getTime(),
      state: data.id.split("-")[0],
    };

    let submissionResponse;
    try {
      submissionResponse = await API.post("os", "/submit", {
        body: dataToSubmit,
      });
      console.log(submissionResponse);
      setModalChildren(
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="max-w-md p-4">
            <div className="font-bold">Submission Success!</div>
            <p>
              Your submission was accepted.
              <br />
              Please be aware that it may take up to a minute for your
              submission to show in the Dashboard.
            </p>
          </div>
          <I.Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            Go to Dashboard
          </I.Button>
        </div>
      );
    } catch (err) {
      console.log(err);
      setModalChildren(
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="max-w-md p-4">
            <div className="text-red-500 font-bold">Submission Error:</div>
            <p>
              An error occurred during submission.
              <br />
              You may close this window and try again, however, this likely
              requires support.
              <br />
              <br />
              Please request help at{" "}
              <a
                href="mailto:emailaddress@example.com"
                className="text-blue-500"
              >
                emailaddress@example.com
              </a>{" "}
              or visit our <a href="linktohelpdesk">help desk</a>, and include
              the following in your support request: <br />
              <br />
              <ul>
                <li>SPA ID: {data.id}</li>
                <li>Timestamp: {Date.now()}</li>
              </ul>
            </p>
          </div>
          <I.Button
            type="button"
            variant="outline"
            onClick={() => setModalIsOpen(false)}
          >
            Close
          </I.Button>
        </div>
      );
    } finally {
      setModalIsOpen(true);
    }
  };

  return (
    <SimplePageContainer>
      <BreadCrumbs options={BREAD_CRUMB_CONFIG_NEW_SUBMISSION} />
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
                    to="/faq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    What is my SPA ID?
                  </Link>
                </div>
                <p className="text-gray-500 font-light">
                  Must follow the format SS-YY-NNNN or SS-YY-NNNN-xxxx.
                </p>
                <p className="italic text-gray-500 font-light">
                  Reminder - CMS recommends that all SPA numbers start with the
                  year in which the package is submitted.
                </p>
                <I.FormControl className="max-w-sm">
                  <I.Input {...field} />
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
                <I.FormDescription className="text-gray-500 text-md ">
                  For example: 4/28/1986
                </I.FormDescription>
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
              Maximum file size of 80 MB per attachment. You can add multiple
              files per attachment type except for the CMS Form 179. Read the
              description for each of the attachment types on the{" "}
              {
                <Link
                  to="/faq"
                  target="_blank"
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
              <strong className="bold">
                .doc, .docx, .jpg, .odp, .ods, .odt, .png, .pdf, .ppt, .pptx,
                .rtf, .txt, .xls, .xlsx,
              </strong>{" "}
              and a few others. See the full list on the{" "}
              {
                <Link
                  to="/faq"
                  target="_blank"
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
          {attachmentList.map((attachment) => (
            <I.FormField
              key={attachment.name}
              control={form.control}
              name={`attachments.${attachment.name}`}
              render={({ field }) => (
                <I.FormItem>
                  <I.FormLabel>
                    {attachment.label}
                    {attachment?.required ? <I.RequiredIndicator /> : ""}
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
                  Add anything else you would like to share with CMS
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
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="px-12"
            >
              Cancel
            </I.Button>
            <Modal
              showModal={modalIsOpen}
              // eslint-disable-next-line react/no-children-prop
              children={modalChildren}
            />
          </div>
        </form>
      </I.Form>
    </SimplePageContainer>
  );
};
