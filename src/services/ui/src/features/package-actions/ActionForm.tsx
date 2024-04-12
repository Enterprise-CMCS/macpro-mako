import {
  Alert,
  Form,
  FormField,
  LoadingSpinner,
  useAlertContext,
  useModalContext,
  useNavigate,
} from "@/components";
import * as SC from "@/features/package-actions/shared-components";
import { Info } from "lucide-react";
import { useGetUser } from "@/api/useGetUser";
import { useOriginPath } from "@/utils";
import { FormSetup } from "./lib";
import { submitActionForm } from "@/features/package-actions/lib";
import { useGetItem } from "@/api";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import { Action, Authority } from "shared-types";
import { SlotAdditionalInfo } from "@/features";

export const ActionForm = ({ setup }: { setup: FormSetup }) => {
  const { authority, id, type } = useParams<{
    authority: Authority;
    type: Action;
    id: string;
  }>();
  const navigate = useNavigate();
  const origin = useOriginPath();
  const alert = useAlertContext();
  const modal = useModalContext();
  const { data: user } = useGetUser();
  const { data: item } = useGetItem(id!);
  const content = useMemo(
    () => (item?._source ? setup.content(item._source) : null),
    [item],
  );
  const form = useForm({
    resolver: zodResolver(setup.schema),
  });
  // Submission Handler
  const handler = form.handleSubmit(
    async (data) =>
      await submitActionForm({
        data,
        id: id!,
        type: type!,
        authority: authority!,
        user: user!,
        alert,
        navigate,
        originRoute: origin,
        successBannerContent: content!.successBanner,
      }),
  );
  // Adapted handler for destructive confirmation modal use
  const confirmSubmitCallback = useCallback(() => {
    modal.setModalOpen(false);
    handler();
  }, [content]);

  if (content === null) {
    // Still loading item and no content hydrated
    return <LoadingSpinner />;
  } else {
    return (
      <Form {...form}>
        <SC.Heading title={content.title} />
        <SC.RequiredFieldDescription />
        <SC.ActionDescription>{content.description}</SC.ActionDescription>
        <SC.PackageSection />
        <form onSubmit={handler}>
          <SC.AttachmentsSection
            instructions={content?.attachmentsInstruction || ""}
            attachments={setup.attachments}
            faqLink={""}
          />
          <FormField
            control={form.control}
            name={"additionalInformation"}
            render={SlotAdditionalInfo({
              label: <p>{content?.additionalInfoInstruction || ""}</p>,
            })}
          />
          <Alert variant={"infoBlock"} className="space-x-2 mb-8">
            <Info />
            <p>{content.preSubmitNotice}</p>
          </Alert>
          <SC.FormLoadingSpinner />
          <SC.ErrorBanner />
          {content?.confirmationModal ? (
            <SC.SubmissionButtons
              confirmWithdraw={() => {
                modal.setContent(content.confirmationModal!);
                modal.setOnAccept(() => confirmSubmitCallback);
                modal.setModalOpen(true);
              }}
            />
          ) : (
            <SC.SubmissionButtons />
          )}
        </form>
      </Form>
    );
  }
};
