import { useParams } from "react-router-dom";
import * as I from "@/components/Inputs";
import { API } from "aws-amplify";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DETAILS_AND_ACTIONS_CRUMBS } from "@/pages/actions/actions-breadcrumbs";
import {
  SimplePageContainer,
  Alert,
  LoadingSpinner,
  Modal,
  BreadCrumbs,
} from "@/components";
import { FAQ_TARGET, ROUTES } from "@/routes";
import { Link, useNavigate } from "react-router-dom";
import { Action, RaiIssueTransform } from "shared-types";
import { useGetUser } from "@/api/useGetUser";

const formSchema = z.object({
  additionalInformation: z.string().max(4000).optional(),
  attachments: z.object({
    raiSupportingDocs: z
      .array(z.instanceof(File))
      .refine((value) => value.length > 0, {
        message: "Required",
      }),
  }),
});
export type IssueRaiFormSchema = z.infer<typeof formSchema>;
type UploadKeys = keyof IssueRaiFormSchema["attachments"];
export type PreSignedURL = {
  url: string;
  key: string;
  bucket: string;
};

const attachmentList = [
  {
    name: "raiSupportingDocs",
    label: "RAI Supplemental Documentation",
    required: true,
  },
] as const;

export const IssueRai = () => {
  const { id, type } = useParams<{
    id: string;
    type: string;
  }>();
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const form = useForm<IssueRaiFormSchema>({
    resolver: zodResolver(formSchema),
  });
  const { data: user } = useGetUser();
  const handleSubmit: SubmitHandler<IssueRaiFormSchema> = async (data) => {
    // Set the timestamp that will uniquely identify this RAI
    const timestamp = Math.floor(new Date().getTime() / 1000) * 1000; // Truncating to match seatool

    const uploadKeys = Object.keys(data.attachments) as UploadKeys[];
    const uploadedFiles: any[] = [];
    const fileMetaData: NonNullable<
      RaiIssueTransform["rais"][number]["request"]["attachments"]
    > = [];

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

    const dataToSubmit = {
      id: id!,
      additionalInformation: data?.additionalInformation ?? null,
      attachments: fileMetaData,
      requestedDate: timestamp,
      submitterEmail: user?.user?.email ?? "N/A",
      submitterName:
        `${user?.user?.given_name} ${user?.user?.family_name}` ?? "N/A",
    };

    let actionResponse;
    try {
      console.log(dataToSubmit);
      actionResponse = await API.post("os", "/action/issue-rai", {
        body: dataToSubmit,
      });
      console.log(actionResponse);
      setSuccessModalIsOpen(true);
      console.log("END OF TRY");
    } catch (err) {
      console.log(err);
      setErrorModalIsOpen(true);
      console.log("CATCH");
    }
  };

  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={DETAILS_AND_ACTIONS_CRUMBS({
          id: id || "",
          action: "issue-rai" as Action,
        })}
      />
      <I.Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="my-6 space-y-8 mx-auto"
        >
          <section>
            <h1 className="font-bold text-2xl mb-2">Issue RAI</h1>
            <p className="my-1">
              <I.RequiredIndicator /> Indicates a required field
            </p>
            <p className="font-light mb-6 max-w-4xl">
              Once you submit this form, a confirmation email is sent to you and
              to the original submitter.{" "}
              <strong className="bold">
                If you leave this page, you will lose your progress on this
                form.
              </strong>
            </p>
          </section>
          {/*-------------------------------------------------------- */}
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
          {/*-------------------------------------------------------- */}
          <I.FormField
            control={form.control}
            name="additionalInformation"
            render={({ field }) => (
              <I.FormItem>
                <h3 className="font-bold text-2xl font-sans">
                  Additional Information
                </h3>
                <I.FormLabel className="font-normal">
                  Add anything else you would like to share with the state
                  regarding this RAI.
                </I.FormLabel>
                <I.Textarea {...field} className="h-[200px] resize-none" />
                <I.FormDescription>4,000 characters allowed</I.FormDescription>
              </I.FormItem>
            )}
          />
          {/*-------------------------------------------------------- */}
          <div className="my-2">
            <i>
              Once you submit this form, a confirmation email is sent to you and
              to the original submitter.
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
            <Modal
              showModal={successModalIsOpen}
              // eslint-disable-next-line react/no-children-prop
              children={<SuccessModalContent id={id || ""} />}
            />
            <Modal
              showModal={errorModalIsOpen}
              // eslint-disable-next-line react/no-children-prop
              children={
                <ErrorModalContent
                  id={id || ""}
                  setModalIsOpen={setErrorModalIsOpen}
                />
              }
            />
            <Modal
              showModal={cancelModalIsOpen}
              // eslint-disable-next-line react/no-children-prop
              children={
                <CancelModalContent
                  setCancelModalIsOpen={setCancelModalIsOpen}
                />
              }
            />
          </div>
        </form>
      </I.Form>
    </SimplePageContainer>
  );
};

type SuccessModalProps = {
  id: string;
};
const SuccessModalContent = ({ id }: SuccessModalProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-2 items-center text-center">
      <div className="max-w-md p-4">
        <div className="font-bold">Submission Success!</div>
        <p>
          RAI for {id} was successfully issued.
          <br />
          Please be aware that it may take up to a minute for this action to be
          reflected in the dashboard.
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
};

type ErrorModalProps = { id: string; setModalIsOpen: (open: boolean) => void };
const ErrorModalContent = ({ id, setModalIsOpen }: ErrorModalProps) => {
  return (
    <div className="flex flex-col gap-2 items-center text-center">
      <div className="max-w-md p-4">
        <div className="text-red-500 font-bold">Submission Error:</div>
        <p>
          An error occurred during issue.
          <br />
          You may close this window and try again, however, this likely requires
          support.
          <br />
          <br />
          Please contact the{" "}
          <a
            href="mailto:OneMAC_Helpdesk@cms.hhs.gov"
            className="text-blue-500"
          >
            helpdesk
          </a>{" "}
          . You may include the following in your support request: <br />
          <br />
          <ul>
            <li>SPA ID: {id}</li>
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
};

type CancelModalProps = { setCancelModalIsOpen: (open: boolean) => void };
const CancelModalContent = ({ setCancelModalIsOpen }: CancelModalProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-2 items-center text-center">
      <div className="max-w-md p-4">
        <div className="font-bold">Are you sure you want to cancel?</div>
        <p>If you leave this page, you will lose your progress on this form.</p>
      </div>
      <div className="flex">
        <I.Button
          type="button"
          variant="outline"
          onClick={() => navigate(ROUTES.DASHBOARD)}
        >
          Yes
        </I.Button>
        <div className="ml-8">
          <I.Button
            type="button"
            variant="outline"
            onClick={() => setCancelModalIsOpen(false)}
          >
            No, Return to Form
          </I.Button>
        </div>
      </div>
    </div>
  );
};
