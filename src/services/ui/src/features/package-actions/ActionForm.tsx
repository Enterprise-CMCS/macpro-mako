import {
  Alert,
  Form,
  FormField,
  LoadingSpinner,
  useAlertContext,
  useModalContext,
  useNavigate,
} from "@/components";
import { Info } from "lucide-react";
import { useGetUser } from "@/api/useGetUser";
import { useOriginPath } from "@/utils";
import { AdditionalInfoSection, FormSetup, PreSubmitNotice } from "./lib";
import { submitActionForm } from "@/features/package-actions/lib";
import { useGetItem } from "@/api";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@/components";
import { SlotAdditionalInfo } from "@/features";
import {
  SubmissionButtons,
  AttachmentsSection,
  ActionDescription,
  Heading,
  RequiredFieldDescription,
} from "@/features/package-actions/lib";
import {
  ErrorBanner,
  FormLoadingSpinner,
  PackageSection,
} from "@/features/package-actions/shared-components";

export const ActionForm = ({ setup }: { setup: FormSetup }) => {
  const { id, type, authority } = useParams("/action/:authority/:id/:type");
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
      }),
  );
  alert.setContent({
    header: "Test",
    body: "Test",
  });
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
        {form.formState.isSubmitting && <LoadingSpinner />}
        <Heading title={content.title} />
        <RequiredFieldDescription />
        <ActionDescription>{content.description}</ActionDescription>

        {/* BEGIN BESPOKE NEEDS */}
        <PackageSection />
        <form onSubmit={handler}>
          <AttachmentsSection
            instructions={content?.attachmentsInstruction || ""}
            attachments={setup.attachments}
            faqLink={""}
          />
          <AdditionalInfoSection
            instruction={content?.additionalInfoInstruction}
          />
          <PreSubmitNotice message={content.preSubmitNotice} />
          <FormLoadingSpinner />
          <ErrorBanner />
          {/* END BESPOKE NEEDS */}

          {content?.confirmationModal ? (
            <SubmissionButtons
              confirmWithdraw={() => {
                modal.setContent(content.confirmationModal!);
                modal.setOnAccept(() => confirmSubmitCallback);
                modal.setModalOpen(true);
              }}
            />
          ) : (
            <SubmissionButtons />
          )}
        </form>
      </Form>
    );
  }
};
