import { useEffect, useState } from "react";
import { Link } from "react-router";
import { isStateUser } from "shared-utils";

import { useGetUser } from "@/api";
import {
  ActionForm,
  DatePicker,
  FormArg,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RequiredIndicator,
  SpaIdFormattingDesc,
  UserPrompt as UserPromptType,
} from "@/components";
import { AttachmentFileFormatInstructions } from "@/components/ActionForm/actionForm.components";
import { FAQ_TAB } from "@/consts";
import { formSchemas } from "@/formSchemas";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

type MedSpaFooterProps = {
  form: FormArg<(typeof formSchemas)["new-medicaid-submission"]>;
  onSubmit: () => void;
  onCancel: (promptOverride?: Partial<Omit<UserPromptType, "onAccept">>) => void;
};

const MedSpaFooter = ({ form, onSubmit, onCancel }: MedSpaFooterProps) => {
  const [isFooterFixed, setIsFooterFixed] = useState(false);
  const watchedId = form.watch("id");

  useEffect(() => {
    const target = document.getElementById("footer-trigger");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterFixed(!entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (isFooterFixed) {
    return (
      <section
        className="fixed bottom-0 left-0 w-full z-40 border-t border-gray-300 bg-white px-6"
        id="form-actions"
        data-testid="medicaid-form-footer"
      >
        <div className="flex justify-between items-center w-full py-3">
          <button
            onClick={() =>
              onCancel({
                header: "Leave this page?",
                body: `Unsaved changes${
                  watchedId.trim() ? ` to ${watchedId}` : ""
                } will be discarded. Go back to save your changes.`,
                acceptButtonText: "Yes, leave",
                cancelButtonText: "Go back",
                areButtonsReversed: true,
                cancelVariant: "link",
              })
            }
            data-testid="cancel-action-form-footer"
            className="w-24 py-3 px-5 text-blue-700 font-semibold underline"
            type="button"
          >
            Cancel
          </button>

          <div className="flex gap-2.5">
            <button
              type="button"
              className="w-[128.36px] py-3 px-5 gap-2.5 rounded border-2 border-blue-700 text-blue-700 bg-white font-semibold text-sm"
            >
              Save
            </button>
            <button
              onClick={onSubmit}
              disabled={!form.formState.isValid}
              aria-disabled={!form.formState.isValid}
              data-testid="submit-action-form"
              className={`w-[181.75px] py-3 px-5 gap-2.5 rounded font-semibold text-sm transition ${
                !form.formState.isValid
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              }`}
            >
              Save & Submit
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 w-full"
      data-testid="medicaid-form-footer"
    >
      <div className="flex justify-between items-center w-full py-3">
        <button
          onClick={() =>
            onCancel({
              header: "Leave this page?",
              body: `Unsaved changes${
                watchedId.trim() ? ` to ${watchedId}` : ""
              } will be discarded. Go back to save your changes.`,
              acceptButtonText: "Yes, leave",
              cancelButtonText: "Go back",
              areButtonsReversed: true,
              cancelVariant: "link",
            })
          }
          data-testid="cancel-action-form-footer"
          className="w-24 py-3 px-5 text-blue-700 font-semibold underline"
          type="button"
        >
          Cancel
        </button>

        <div className="flex gap-2.5">
          <button
            type="button"
            className="w-[128.36px] py-3 px-5 gap-2.5 rounded border-2 border-blue-700 text-blue-700 bg-white font-semibold text-sm"
          >
            Save
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.formState.isValid}
            aria-disabled={!form.formState.isValid}
            data-testid="submit-action-form"
            className={`w-[181.75px] py-3 px-5 gap-2.5 rounded font-semibold text-sm transition ${
              !form.formState.isValid
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
          >
            Save & Submit
          </button>
        </div>
      </div>
    </section>
  );
};

export const MedicaidForm = () => {
  const { data: user } = useGetUser();
  const isStateUserFlag = useFeatureFlag("MED_SPA_FOOTER");
  const isState = isStateUser(user?.user);
  const isMedSpaFooterShown = isState && isStateUserFlag;

  return (
    <ActionForm
      schema={formSchemas["new-medicaid-submission"]}
      title="Medicaid SPA Details"
      breadcrumbText="Submit new Medicaid SPA"
      fields={({ control }) => (
        <>
          <FormField
            control={control}
            name="id"
            render={({ field }) => {
              return (
                <FormItem>
                  <div className="flex gap-4">
                    <FormLabel htmlFor="spa-id" className="font-semibold" data-testid="spaid-label">
                      SPA ID <RequiredIndicator />
                    </FormLabel>
                    <Link
                      to="/faq/spa-id-format"
                      target={FAQ_TAB}
                      rel="noopener noreferrer"
                      className="text-blue-900 underline"
                    >
                      What is my SPA ID?
                    </Link>
                  </div>
                  <SpaIdFormattingDesc />
                  <FormControl>
                    <Input
                      id="spa-id"
                      className="max-w-sm"
                      ref={field.ref}
                      value={field.value}
                      aria-describedby="spa-id-formatting-desc"
                      onChange={(e) => field.onChange(e.currentTarget.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage announceOn={field.value} />
                </FormItem>
              );
            }}
          />
          <FormField
            control={control}
            name="proposedEffectiveDate"
            render={({ field }) => (
              <FormItem className="max-w-md">
                <FormLabel
                  className="text-lg font-semibold block"
                  data-testid="proposedEffectiveDate-label"
                >
                  Proposed Effective Date of Medicaid SPA <RequiredIndicator />
                </FormLabel>
                <FormControl>
                  <DatePicker
                    onChange={(date) => field.onChange(date.getTime())}
                    date={field.value ? new Date(field.value) : undefined}
                    dataTestId="proposedEffectiveDate"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      defaultValues={{ id: "" }}
      attachments={{
        instructions: [
          <p data-testid="attachments-instructions">
            Maximum file size of 80 MB per attachment.{" "}
            <span className="font-bold">
              You can add multiple files per attachment type except for the CMS-179 Form.
            </span>{" "}
            Read the description for each of the attachment types on the{" "}
            <Link
              to="/faq/medicaid-spa-attachments"
              target={FAQ_TAB}
              rel="noopener noreferrer"
              className="text-blue-900 underline"
            >
              FAQ Page
            </Link>
            .
          </p>,
          <AttachmentFileFormatInstructions />,
        ],
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      footer={
        isMedSpaFooterShown
          ? ({ form, onSubmit, onCancel }) => (
              <section>
                <div id="footer-trigger" />
                <MedSpaFooter form={form} onSubmit={onSubmit} onCancel={onCancel} />
              </section>
            )
          : undefined
      }
    />
  );
};
