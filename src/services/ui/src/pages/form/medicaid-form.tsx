import { type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as I from "@/components/Inputs";
import { Link, useNavigate } from "react-router-dom";
import { API } from "aws-amplify";
import { OneMacTransform } from "shared-types";
import { useGetUser } from "@/api/useGetUser";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { BREAD_CRUMB_CONFIG_NEW_SUBMISSION } from "@/components/BreadCrumb/bread-crumb-config";
import { SimplePageContainer } from "@/components";
import { ROUTES } from "@/routes";
import { getUserStateCodes } from "@/utils";
import { Alert } from "@/components/Alert";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useState } from "react";
import { Modal } from "@/components/Modal";

const formSchema = z.object({
  state: z.string(),
  id: z
    .string()
    .regex(
      /^\d{2}-\d{4}(-\d{4})?$/,
      "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-xxxx"
    ),
  additionalInformation: z.string().max(4000).optional(),
  attachments: z.object({
    cmsForm179: z.array(z.instanceof(File)).nonempty(),
    spaPages: z.array(z.instanceof(File)).optional(),
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
const attachmentList: Array<[UploadKeys, string]> = [
  ["cmsForm179", "CMS Form 179"],
  ["spaPages", "SPA Pages"],
  ["coverLetter", "Cover Letter"],
  ["tribalEngagement", "Document Demonstrating Good-Faith Tribal Engagement"],
  ["existingStatePlanPages", "Existing State Plan Page(s)"],
  ["publicNotice", "Public Notice"],
  ["sfq", "Standard Funding Questions (SFQs)"],
  ["tribalConsultation", "Tribal Consultation"],
  ["other", "Other"],
];

export const MedicaidForm = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalChildren, setModalChildren] = useState(<div></div>);
  const form = useForm<MedicaidFormSchema>({
    resolver: zodResolver(formSchema),
  });
  const { data: user } = useGetUser();
  const stateCodes = getUserStateCodes(user?.user);
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
          (item) => item[0] === uploadKey
        );
        const title = attachmenListObject ? attachmenListObject[1] : "Other";
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
      id: `${data.state}-${data.id}`,
      additionalInformation: data?.additionalInformation ?? null,
      attachments: fileMetaData,
      origin: "micro",
      authority: "medicaid spa",
      raiResponses: [],
      submitterEmail: user?.user?.email ?? "N/A",
      submitterName:
        `${user?.user?.given_name} ${user?.user?.family_name}` ?? "N/A",
      proposedEffectiveDate: data.proposedEffectiveDate.getTime(),
      state: data.state,
    };

    let submissionResponse;
    try {
      submissionResponse = await API.post("os", "/submit", {
        body: dataToSubmit,
      });
      console.log(submissionResponse);
      setModalChildren(
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="max-w-md p-4 rounded-lg shadow-lg">
            <div className="font-bold">Submission Success!</div>
            <p>
              Your submission was accepted.
              <br />
              Please keep in mind it may take up to a minute for your submission
              to show in the Dashboard.
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
          <div className="max-w-md p-4 rounded-lg shadow-lg">
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
          className="my-6 space-y-8 max-w-3xl mx-auto"
        >
          <section>
            <h1 className="font-bold text-2xl mb-2">Medicaid SPA Details</h1>
            <p>
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
            name="state"
            render={({ field }) => (
              <I.FormItem>
                <div className="flex justify-between">
                  <I.FormLabel>State</I.FormLabel>
                </div>
                <p>
                  Select a state for submission. This will prepopulate the state
                  code portion of the SPA ID.
                </p>
                <I.FormControl className="max-w-sm">
                  <I.Select
                    onValueChange={(selection) => field.onChange(selection)}
                  >
                    <I.SelectTrigger>
                      {field.value || "Select a State or Territory"}
                    </I.SelectTrigger>
                    <I.SelectContent>
                      {stateCodes.map((option, index) => (
                        <I.SelectItem key={index} value={option}>
                          {option}
                        </I.SelectItem>
                      ))}
                    </I.SelectContent>
                  </I.Select>
                </I.FormControl>
                <I.FormMessage />
              </I.FormItem>
            )}
          />

          <I.FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <I.FormItem>
                <div className="flex justify-between">
                  <I.FormLabel>SPA ID</I.FormLabel>
                  <Link to="/faq" className="text-blue-700 hover:underline">
                    What is my SPA ID?
                  </Link>
                </div>
                <p>Must follow the format SS-YY-NNNN or SS-YY-NNNN-xxxx.</p>
                <p className="italic">
                  Reminder - CMS recommends that all SPA numbers start with the
                  year in which the package is submitted.
                </p>
                <I.FormControl className="max-w-sm">
                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      readOnly
                      value={useWatch({
                        name: "state",
                        defaultValue: "",
                      })}
                      className="w-12 h-9 text-center font-normal placeholder-gray-300 border rounded-sm focus:ring focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                    />
                    <input
                      type="text"
                      readOnly
                      value="-"
                      className="w-4 h-9 text-center font-normal"
                    />
                    <I.Input {...field} />
                  </div>
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
                <I.FormLabel className="block">
                  Proposed Effective Date of Medicaid SPA
                </I.FormLabel>
                <I.FormDescription>For example: 4/28/1986</I.FormDescription>
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
              files per attachment type.Read the description for each of the
              attachment types on the FAQ Page. We accept the following file
              formats:{" "}
              <strong className="bold">
                .doc, .docx, .jpg, .odp, .ods, .odt, .png, .pdf, .ppt, .pptx,
                .rtf, .txt, .xls, .xlsx,
              </strong>{" "}
              and a few others. See the full list on the FAQ Page. *At least one
              attachment is required.
            </p>
          </section>

          {attachmentList.map((attachment) => (
            <I.FormField
              key={attachment[0]}
              control={form.control}
              name={`attachments.${attachment[0]}`}
              render={({ field }) => (
                <I.FormItem>
                  <I.FormLabel>{attachment[1]}</I.FormLabel>
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
            <I.Button disabled={form.formState.isSubmitting} type="submit">
              Submit
            </I.Button>
            <I.Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.DASHBOARD)}
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
