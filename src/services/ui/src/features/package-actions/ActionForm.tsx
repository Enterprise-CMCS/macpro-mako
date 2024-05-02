import {
  ErrorBanner,
  Form,
  ActionFormHeading,
  LoadingSpinner,
  PreSubmitNotice,
  RequiredFieldDescription,
  SubmissionButtons,
  useAlertContext,
  useModalContext,
  useNavigate,
} from "@/components";
import { useGetUser } from "@/api/useGetUser";
import { useOriginPath } from "@/utils";
import { FormSetup } from "./lib";
import { submitActionForm } from "@/features/package-actions/lib";
import { useGetItem } from "@/api";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@/components";
import { successCheckSwitch } from "./lib/correctStatusSwitch";
import { useLocation } from "react-router-dom";

export const ActionForm = ({ setup }: { setup: FormSetup }) => {
  const { id, type, authority } = useParams("/action/:authority/:id/:type");
  const navigate = useNavigate();
  const origin = useOriginPath();
  const location = useLocation();
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
    mode: "onChange",
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
        statusToCheck: successCheckSwitch(type),
        locationState: location.state,
      }),
  );
  useEffect(() => {
    content?.successBanner && alert.setContent(content.successBanner);
  }, [content]);
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
        <ActionFormHeading title={content.title} />
        <RequiredFieldDescription />
        <form onSubmit={handler}>
          {setup?.fields && setup.fields.map((field) => field)}
          <ErrorBanner />
          {content?.preSubmitNotice && (
            <PreSubmitNotice message={content.preSubmitNotice} />
          )}
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
