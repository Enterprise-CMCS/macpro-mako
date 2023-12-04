import {
  BreadCrumbs,
  ConfirmationModal,
  SimplePageContainer,
} from "@/components";
import * as I from "@/components/Inputs";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { DETAILS_AND_ACTIONS_CRUMBS } from "./actions-breadcrumbs";
import { useNavigate, useParams } from "react-router-dom";
import {
  Action,
  Authority,
  OneMacTransform,
  WithdrawRaiRecord,
} from "shared-types";
import { FormDescriptionText } from "@/components/FormDescriptionText";
import { useGetItem } from "@/api/useGetItem";
import { useGetUser } from "@/api/useGetUser";
import { API } from "aws-amplify";
import { PackageActionForm } from "./PackageActionForm";
import { submit } from "@/api/submissionService";
import { useState } from "react";

const formSchema = z
  .object({
    additionalInformation: z.string().max(4000).nullish(),
    attachments: z.object({
      supportingDocumentation: z.array(z.instanceof(File)).nullish(),
    }),
  })
  .refine(
    (data) => {
      return (
        !!data.additionalInformation ||
        !!data.attachments?.supportingDocumentation
      );
    },
    {
      path: ["additionalInformation"],
      message:
        "Either additional information or supporting documentation is required",
    }
  )
  .refine(
    (data) => {
      return (
        !!data.additionalInformation ||
        !!data.attachments?.supportingDocumentation
      );
    },
    {
      path: ["attachments", "supportingDocumentation"],
      message:
        "Either additional information or supporting documentation is required",
    }
  );

type FormSchema = z.infer<typeof formSchema>;

const attachmentList = [
  {
    name: "supportingDocumentation",
    label: "Supporting Documentation",
    required: false,
  },
] as const;

export const WithdrawRaiForm = () => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);

  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const { data: item } = useGetItem(id!);

  const user = useGetUser();

  const handleSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      console.log(data);
      await submit({
        data: { ...data, id },
        endpoint: "/action/withdraw-rai",
        user: user.data,
        authority: Authority.MED_SPA,
      });

      setSuccessModalIsOpen(true);
    } catch (err: unknown) {
      if (err) {
        console.log("There was an error", err);
        setErrorModalIsOpen(true);
      }
    }
  };

  return (
    <SimplePageContainer>
      <I.Form {...form}>
        <form
          className="my-6 space-y-8 mx-auto"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <section>
            <h1 className="font-bold text-2xl mb-2">
              Withdraw Formal RAI Response Details
            </h1>
            <p className="my-1">
              <I.RequiredIndicator /> Indicates a required field
            </p>
            <p className="font-light mb-6 max-w-4xl">
              Complete this form to withdraw the Formal RAI response. Once
              complete, you and CMS will receive an email confirmation.
            </p>
          </section>
          <section className="grid grid-cols-2">
            <h3 className="text-2xl font-bold font-sans col-span-2">
              Package Details
            </h3>
            <div className="flex flex-col my-8">
              <label>SPA ID</label>
              <span className="text-xl" aria-labelledby="package-id-label">
                {id}
              </span>
            </div>
            <div className="flex flex-col my-8">
              <label>Type</label>
              <span className="text-xl" aria-labelledby="package-id-label">
                {item?._source.planType}
              </span>
            </div>
          </section>
          <h3 className="font-bold text-2xl font-sans">Attachments</h3>
          <I.FormField
            name="attachments.supportingDocumentation"
            control={form.control}
            render={({ field }) => (
              <I.FormItem>
                <I.FormLabel>Supporting Documentation</I.FormLabel>
                <I.FormMessage />
                <I.Upload
                  files={field?.value ?? []}
                  setFiles={field.onChange}
                />
              </I.FormItem>
            )}
          />
          <I.FormField
            control={form.control}
            name="additionalInformation"
            render={({ field }) => {
              return (
                <I.FormItem>
                  <h3 className="font-bold text-2xl font-sans">
                    Additional Information <I.RequiredIndicator />
                  </h3>
                  <I.FormLabel className="font-normal">
                    Add anything else that you would like to share with CMS.
                  </I.FormLabel>
                  <I.FormMessage />
                  <I.Textarea
                    {...field}
                    value={field.value || ""}
                    className="h-[200px] resize-none"
                  />
                  <I.FormDescription>
                    {field.value && field.value.length >= 0
                      ? `${4000 - field.value.length} characters remaining`
                      : "4000 characters allowed"}
                  </I.FormDescription>
                </I.FormItem>
              );
            }}
          />
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
          </div>
        </form>
      </I.Form>
      <ConfirmationModal
        open={successModalIsOpen}
        onAccept={() => {
          setSuccessModalIsOpen(false);
          navigate(`/details?id=${id}`);
        }}
        onCancel={() => setSuccessModalIsOpen(false)}
        title="Submission Successful"
        body={
          <p>
            Please be aware that it may take up to a minute for your submission
            to show in the Dashboard.
          </p>
        }
        cancelButtonVisible={false}
        acceptButtonText="Exit to Package Details"
      />
      <ConfirmationModal
        open={errorModalIsOpen}
        onAccept={() => {
          setErrorModalIsOpen(false);
          navigate(`/details?id=${id}`);
        }}
        onCancel={() => setErrorModalIsOpen(false)}
        title="Submission Error"
        body={
          <p>
            An error occurred during issue.
            <br />
            You may close this window and try again, however, this likely
            requires support.
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
        }
        cancelButtonVisible={true}
        cancelButtonText="Return to Form"
        acceptButtonText="Exit to Package Details"
      />
      <ConfirmationModal
        open={cancelModalIsOpen}
        onAccept={() => {
          setCancelModalIsOpen(false);
          navigate(`/details?id=${id}`);
        }}
        onCancel={() => setCancelModalIsOpen(false)}
        cancelButtonText="Return to Form"
        acceptButtonText="Yes"
        title="Are you sure you want to cancel?"
        body={
          <p>If you leave this page you will lose your progress on this form</p>
        }
      />
    </SimplePageContainer>
  );
};

export const WithdrawRai = () => (
  <PackageActionForm>
    <WithdrawRaiForm />
  </PackageActionForm>
);
