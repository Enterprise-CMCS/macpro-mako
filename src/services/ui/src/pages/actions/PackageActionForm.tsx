import { Navigate, useNavigate, useParams } from "@/components/Routing";
import { useGetItem, useGetPackageActions } from "@/api";
import { z } from "zod";
import {
  Alert,
  BreadCrumbs,
  ConfirmationModal,
  LoadingSpinner,
  SimplePageContainer,
} from "@/components";
import { DETAILS_AND_ACTIONS_CRUMBS } from "@/pages/actions/actions-breadcrumbs";
import React, {
  JSXElementConstructor,
  PropsWithChildren,
  ReactElement,
} from "react";
import { ItemResult, PlanType } from "shared-types";
import { ActionFormIntro, PackageInfo } from "@/pages/actions/common";
import * as I from "@/components/Inputs";
import { AttachmentsSizeTypesDesc } from "@/pages/form/content";
import { Button } from "@/components/Inputs";
import { useModalContext } from "@/pages/form/modals";
import { AttachmentRecipe, buildActionUrl } from "@/lib";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodObject } from "zod";
import { submit } from "@/api/submissionService";
import { useGetUser } from "@/api/useGetUser";
import {zAdditionalInfo} from "@/pages/form/zod";

type CloneableChild = ReactElement<any, string | JSXElementConstructor<any>>;

const actionFormBaseSchema = z.object({
  zAdditionalInfo,
  attachments: z.object({
    supportingDocumentation: z.array(z.instanceof(File)).optional(),
  }),
});

type ZodFormSchema = z.infer<typeof z.ZodObject({})>;
export const NewPackageActionForm = <T extends ZodFormSchema>({
  item,
  attachments,
  schema,
}: {
  item: ItemResult;
  attachments: AttachmentRecipe<T>[]; // TODO: Fix typing for typesafe `name`
  schema: T;
}) => {
  const planType = item?._source.authority as PlanType;
  const { data: user } = useGetUser();
  const { setCancelModalOpen, setSuccessModalOpen, setErrorModalOpen } =
    useModalContext();
  const { id, type } = useParams("/action/:id/:type");
  const form = useForm<T>({
    resolver: zodResolver(schema),
  });
  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      await submit<T & { id: string }>({
        data: {
          ...data,
          id: id!, // Declared here because it's not part of SPA action form data.
        },
        endpoint: buildActionUrl(type!),
        user,
        planType,
      });
      setSuccessModalOpen(true);
    } catch (err) {
      console.log(err);
      setErrorModalOpen(true);
    }
  };
  return (
    <>
      {form.formState.isSubmitting && <LoadingSpinner />}
      <div>
        <div className="px-14  py-5 ">
          <ActionFormIntro title="Withdraw Medicaid SPA Package">
            <p>
              Complete this form to withdraw a package. Once complete, you will
              not be able to resubmit this package. CMS will be notified and
              will use this content to review your request. If CMS needs any
              additional information, they will follow up by email.
            </p>
          </ActionFormIntro>
          <PackageInfo item={item} />
          <I.Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              {/* Change faqLink once we know the anchor */}
              <h3 className="font-bold text-2xl font-sans">Attachments</h3>
              <AttachmentsSizeTypesDesc faqLink={"/faq"} />
              {attachments.map(({ name, label, required }) => (
                <I.FormField
                  key={name}
                  control={form.control}
                  name={`attachments.${name}`}
                  render={({ field }) => (
                    <I.FormItem className="mt-8">
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
                  <I.FormItem className="mt-8">
                    <h3 className="font-bold text-2xl font-sans">
                      Additional Information
                    </h3>
                    <I.FormLabel className="font-normal">
                      Explain your need for withdrawal or upload supporting
                      documentation.
                      <br />
                      <p>
                        <em className="italic">
                          Once you submit this form, a confirmation email is
                          sent to you and to CMS. CMS will use this content to
                          review your package. If CMS needs any additional
                          information, they will follow up by email.
                        </em>{" "}
                      </p>
                      <br />
                    </I.FormLabel>
                    <I.Textarea {...field} className="h-[200px] resize-none" />
                    <I.FormDescription>
                      4,000 characters allowed
                    </I.FormDescription>
                  </I.FormItem>
                )}
              />
              {errorMessage && (
                <div className="text-red-500 mt-4">{errorMessage}</div>
              )}
              <div className="flex gap-2 my-8">
                <Button type="submit">Submit</Button>
                <Button
                  onClick={() => setCancelModalOpen(true)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </I.Form>
        </div>
      </div>
    </>
  );
};

export const PackageActionForm = ({ children }: PropsWithChildren) => {
  const { id, type } = useParams("/action/:id/:type");
  const {
    data: item,
    isLoading: itemIsLoading,
    error: itemError,
  } = useGetItem(id!);
  const {
    data: actions,
    isLoading: actionsAreLoading,
    error: actionsError,
  } = useGetPackageActions(id!);

  if (!id || !type) return <Navigate path="/" />;
  if (itemIsLoading || actionsAreLoading) return <LoadingSpinner />;
  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={DETAILS_AND_ACTIONS_CRUMBS({ id: id, action: type })}
      />
      {itemError && (
        <Alert className="my-2 max-w-2xl" variant="destructive">
          <strong>ERROR getting item: </strong>
          {itemError.response.data.message}
        </Alert>
      )}
      {actionsError && (
        <Alert className="my-2 max-w-2xl" variant="destructive">
          <strong>ERROR getting available actions: </strong>
          {actionsError.response.data.message}
        </Alert>
      )}
      {!actionsError && !actions?.actions.includes(type) && (
        <Alert className="my-2 max-w-2xl" variant="destructive">
          <strong>ERROR, invalid action: </strong>
          You cannot perform {type} on this package.
        </Alert>
      )}
      {!actionsError && !itemError && actions.actions.includes(type)
        ? React.Children.map(
            children as CloneableChild[],
            (child: CloneableChild) =>
              React.cloneElement(child, {
                // Child has to be configured to take these
                item,
              })
          )
        : null}
    </SimplePageContainer>
  );
};
