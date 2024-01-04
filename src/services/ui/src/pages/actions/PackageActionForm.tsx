// @typescript-eslint/ban-ts-comment
import { Navigate, useParams } from "@/components/Routing";
import { useGetItem, useGetPackageActions } from "@/api";

import {
  Alert,
  BreadCrumbs,
  LoadingSpinner,
  SimplePageContainer,
} from "@/components";
import { detailsAndActionsCrumbs } from "@/pages/actions/actions-breadcrumbs";
import React, {
  JSXElementConstructor,
  Key,
  PropsWithChildren,
  ReactElement,
} from "react";
import { ItemResult, PlanType } from "shared-types";
import { ActionFormIntro, PackageInfo } from "@/pages/actions/common";
import * as I from "@/components/Inputs";
import { AttachmentsSizeTypesDesc } from "@/pages/form/content";
import { Button } from "@/components/Inputs";
import { useModalContext } from "@/pages/form/modals";
import { buildActionUrl } from "@/lib";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submit } from "@/api/submissionService";
import { useGetUser } from "@/api/useGetUser";
import { FormConfig } from "@/pages/actions/configs";
import { z } from "zod";
import { renderAdditionalInfo, renderFileUpload } from "@/pages/actions/fields";

type CloneableChild = ReactElement<any, string | JSXElementConstructor<any>>;
export const NewPackageActionForm = ({
  item,
  title,
  description,
  attachments,
  schema,
  submitRules,
}: FormConfig & { item: ItemResult }) => {
  const planType = item?._source.authority as PlanType;
  const { data: user } = useGetUser();
  const { setCancelModalOpen, setSuccessModalOpen, setErrorModalOpen } =
    useModalContext();
  const { id, type } = useParams("/action/:id/:type");
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      if (submitRules?.length) {
        // Run additional checks for complex conditions not met by schema
        submitRules.forEach((fn) => fn(data));
      }
      await submit<z.infer<typeof schema> & { id: string }>({
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
  });
  return (
    <>
      {form.formState.isSubmitting && <LoadingSpinner />}
      <div>
        <ActionFormIntro title={title}>{description}</ActionFormIntro>
        <PackageInfo item={item} />
        <I.Form {...form}>
          <form onSubmit={handleSubmit}>
            <h3 className="font-bold text-2xl font-sans">Attachments</h3>
            {/* Change faqLink once we know the anchor */}
            <AttachmentsSizeTypesDesc faqLink={"/faq"} />
            {attachments.map(({ name, label, required }) => (
              <I.FormField
                key={name as Key}
                control={form.control}
                name={`attachments.${String(name)}`}
                render={({ field }) => renderFileUpload(field, required, label)}
              />
            ))}
            <I.FormField
              control={form.control}
              name="additionalInformation"
              render={({ field }) =>
                renderAdditionalInfo(
                  field,
                  false,
                  "Explain your need for withdrawal."
                )
              }
            />
            {/*{errorMessage && (*/}
            {/*  <div className="text-red-500 mt-4">{errorMessage}</div>*/}
            {/*)}*/}
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
        options={detailsAndActionsCrumbs({ id: id, action: type })}
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
