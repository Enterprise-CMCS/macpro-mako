import { useParams } from "react-router-dom";
import * as I from "@/components/Inputs";
import { API } from "aws-amplify";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// import { BREAD_CRUMB_CONFIG_PACKAGE_DETAILS } from "@/components/BreadCrumb/bread-crumb-config";
import {
  SimplePageContainer,
  Alert,
  LoadingSpinner,
  Modal,
  BreadCrumbs,
} from "@/components";
import { FAQ_TARGET, ROUTES } from "@/routes";
import { Link, useNavigate } from "react-router-dom";
import { RaiSchema } from "shared-types";
import { useGetUser } from "@/api/useGetUser";

const formSchema = z.object({
  additionalInformation: z.string().max(4000).optional(),
});
export type IssueRaiFormSchema = z.infer<typeof formSchema>;

export const IssueRai = () => {
  const { id, type } = useParams<{
    id: string;
    type: string;
  }>();
  const form = useForm<IssueRaiFormSchema>({
    resolver: zodResolver(formSchema),
  });
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const { data: user } = useGetUser();
  const handleSubmit: SubmitHandler<IssueRaiFormSchema> = async (data) => {
    const timestamp = Math.floor(new Date().getTime() / 1000) * 1000; // Truncating to match seatool
    const dataToSubmit: RaiSchema = {
      id: id!,
      additionalInformation: data?.additionalInformation ?? null,
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
      // setSuccessModalIsOpen(true);
      console.log("END OF TRY");
    } catch (err) {
      console.log(err);
      setErrorModalIsOpen(true);
      console.log("CATCH");
    }
  };

  return (
    <SimplePageContainer>
      {/* <BreadCrumbs options={BREAD_CRUMB_CONFIG_PACKAGE_DETAILS} /> */}
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
