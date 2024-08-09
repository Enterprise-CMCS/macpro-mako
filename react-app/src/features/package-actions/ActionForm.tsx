import {
  ErrorBanner,
  Form,
  LoadingSpinner,
  userPrompt,
  PreSubmitNotice,
  banner,
} from "@/components";
import { useGetUser } from "@/api/useGetUser";
import { getFormOrigin } from "@/utils";
import { FormSetup } from "./lib";
import { submitActionForm } from "@/features/package-actions/lib";
import { useGetItem } from "@/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFormHeaderCard } from "@/components";
import { SubmitAndCancelBtnSection } from "../submission/waiver/shared-components";
import { useNavigate } from "react-router-dom";
import { Action, Authority } from "shared-types";

type ActionFormProps = {
  setup: FormSetup;
  id: string;
  authority: Authority;
  actionType: Action;
};

export const ActionForm = ({
  setup,
  id,
  authority,
  actionType,
}: ActionFormProps) => {
  const navigate = useNavigate();
  const { data: user } = useGetUser();
  const { data: item } = useGetItem(id);

  const form = useForm<Record<string, string>>({
    resolver: setup.schema ? zodResolver(setup.schema) : undefined,
    mode: "onChange",
    defaultValues: { id },
  });

  if (!item || !user) {
    return <LoadingSpinner />;
  }

  if (actionType === "temporary-extension") {
    form.setValue("seaActionType", "Extend");
  }

  const content = setup.content(item._source);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await submitActionForm({
        data,
        id,
        actionType,
        authority,
        user,
      });

      const originPath = getFormOrigin({
        id: data?.newId ?? id,
        authority,
      });

      banner({
        ...content.successBanner,
        variant: "success",
        pathnameToDisplayOn: originPath.pathname,
      });

      navigate(originPath);
    } catch (error) {
      banner({
        header: "An unexpected error has occurred:",
        body: error instanceof Error ? error.message : String(error),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });

      window.scrollTo(0, 0);
    }
  });

  const onConfirmWithdraw = () => {
    if (content.confirmationModal) {
      userPrompt({
        ...content.confirmationModal,
        onAccept: onSubmit,
      });
    }
  };

  return (
    <Form {...form}>
      {form.formState.isSubmitting && <LoadingSpinner />}
      <form onSubmit={onSubmit}>
        {setup.fields.map((field, index) => {
          // only some forms will need to have the title in a card along with the description
          if (index === 0) {
            return (
              <ActionFormHeaderCard
                title={content.title}
                hasRequiredField={setup.schema !== null}
                isTE={field.key === "te-content-description"}
                key="content-description"
              >
                {field}
              </ActionFormHeaderCard>
            );
          }

          return field;
        })}
        <ErrorBanner />
        {content.preSubmitNotice && (
          <PreSubmitNotice
            message={content.preSubmitNotice}
            hasProgressLossReminder={setup.schema !== null}
          />
        )}
        {content.confirmationModal ? (
          <SubmitAndCancelBtnSection
            confirmWithdraw={onConfirmWithdraw}
            enableSubmit={content.enableSubmit}
          />
        ) : (
          <SubmitAndCancelBtnSection enableSubmit={content.enableSubmit} />
        )}
      </form>
    </Form>
  );
};
