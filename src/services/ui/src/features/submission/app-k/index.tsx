/* eslint-disable react/prop-types */

import {
  BreadCrumbs,
  LoadingSpinner,
  SectionCard,
  SimplePageContainer,
  useLocationCrumbs,
  FAQ_TAB,
} from "@/components";
import { SlotAttachments } from "@/features/actions";
import * as I from "@/components/Inputs";
import * as C from "@/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FORM, SchemaForm } from "./consts";
import { SlotStateSelect, SlotWaiverId, WaiverIdFieldArray } from "./slots";
import { SubmissionServiceParameters, submit } from "@/api/submissionService";
import { useGetUser } from "@/api/useGetUser";
import { Authority } from "shared-types";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@/components/Routing";
import { useEffect } from "react";
import * as Content from "@/components";
import { useOriginPath, zAppkWaiverNumberSchema } from "@/utils";
import { Link } from "react-router-dom";

export const AppKSubmissionForm = () => {
  const nav = useNavigate();
  const crumbs = useLocationCrumbs();
  const { data: user } = useGetUser();
  const modal = C.useModalContext();
  const originPath = useOriginPath();
  const form = useForm<SchemaForm>({
    resolver: zodResolver(FORM),
  });
  const alert = C.useAlertContext();

  const submission = useMutation({
    mutationFn: (config: SubmissionServiceParameters<any>) => submit(config),
  });

  const onSubmit = form.handleSubmit(async (draft) => {
    await submission.mutateAsync(
      {
        data: draft,
        authority: Authority["1915c"],
        endpoint: "/appk",
        user,
      },
      {
        onSuccess: () => {
          alert.setContent({
            header: "Package submitted",
            body: "Your submission has been received.",
          });
          alert.setBannerShow(true);
          alert.setBannerDisplayOn("/dashboard");
          nav(originPath ? { path: originPath } : { path: "/dashboard" });
        },
        onError: (err) => console.error(err),
      },
    );
  });

  const state = form.watch("state");
  const parentWaiver = {
    value: zAppkWaiverNumberSchema.safeParse(form.watch("parentWaiver"))
      .success,
    state: form.getFieldState("parentWaiver"),
  };

  useEffect(() => {
    if (!state) return;
    form.setValue("childWaivers", []);
    form.setValue("parentWaiver", "");
  }, [state]);

  return (
    <SimplePageContainer>
      {submission.isLoading && <LoadingSpinner />}
      <BreadCrumbs options={crumbs} />
      <I.Form {...form}>
        <form onSubmit={onSubmit} className="my-6 space-y-8 flex flex-col">
          <SectionCard title="1915(c) APPENDIX K Amendment Request Details">
            <Content.FormIntroText />
            <I.FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <I.FormItem className="w-[280px]">
                  <I.FormLabel className="font-bold">
                    Amendment Title <I.RequiredIndicator />
                  </I.FormLabel>
                  <I.Textarea {...field} className="h-[80px]" />
                </I.FormItem>
              )}
            />
            <div className="flex flex-col">
              <I.FormLabel className="font-semibold">
                Waiver Authority
              </I.FormLabel>
              <span className="text-lg font-thin">1915(c)</span>
            </div>

            <I.FormField
              control={form.control}
              name="state"
              render={SlotStateSelect({ label: "State" })}
            />
            {state && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-4">
                  <I.FormLabel className="font-bold">
                    Appendix K ID <I.RequiredIndicator />
                  </I.FormLabel>
                  <Link
                    to="/faq/waiver-c-id"
                    target={FAQ_TAB}
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    What is my Appendix K ID?
                  </Link>
                </div>
                <I.FormField
                  control={form.control}
                  name="parentWaiver"
                  render={SlotWaiverId({ state })}
                />
              </div>
            )}

            {!parentWaiver.state.error && parentWaiver.value && (
              <WaiverIdFieldArray state={state} {...form} name="childWaivers" />
            )}

            <I.FormField
              control={form.control}
              name="proposedEffectiveDate"
              render={({ field }) => (
                <I.FormItem className="max-w-sm">
                  <I.FormLabel className="text-lg font-bold block">
                    Proposed Effective Date <I.RequiredIndicator />
                  </I.FormLabel>
                  <I.FormControl>
                    <I.DatePicker
                      onChange={field.onChange}
                      date={field.value}
                    />
                  </I.FormControl>
                  <I.FormMessage />
                </I.FormItem>
              )}
            />
          </SectionCard>
          <SectionCard title="Attachments">
            <C.AttachmentsSizeTypesDesc faqLink="/faq/#chip-spa-attachments" />

            <I.FormField
              control={form.control}
              name={"attachments.appk"}
              render={SlotAttachments({
                label: (
                  <I.FormLabel className="font-semibold">
                    {"1915(c) Appendix K Amendment Waiver Template"}
                    <I.RequiredIndicator />
                  </I.FormLabel>
                ),
                message: <I.FormMessage />,
                className: "my-4",
              })}
            />

            <I.FormField
              control={form.control}
              name={"attachments.other"}
              render={SlotAttachments({
                label: (
                  <I.FormLabel className="font-semibold">Other</I.FormLabel>
                ),
                message: <I.FormMessage />,
                className: "my-4",
              })}
            />
          </SectionCard>

          <SectionCard title="Additional Information">
            <I.FormField
              control={form.control}
              name="additionalInformation"
              render={({ field }) => (
                <I.FormItem>
                  <I.FormLabel className="font-normal">
                    Add anything else you would like to share with CMS.
                  </I.FormLabel>
                  <I.Textarea {...field} className="h-[200px] resize-none" />
                  <I.FormDescription>
                    4,000 characters allowed
                  </I.FormDescription>
                </I.FormItem>
              )}
            />
          </SectionCard>
          <C.PreSubmissionMessage />
          <div className="flex gap-2 p-4 ml-auto">
            <I.Button type="submit" disabled={form.formState.isSubmitting}>
              Submit
            </I.Button>
            <I.Button
              type="button"
              variant="outline"
              onClick={() => {
                modal.setContent({
                  header: "Stop form submission?",
                  body: "All information you've entered on this form will be lost if you leave this page.",
                  acceptButtonText: "Yes, leave form",
                  cancelButtonText: "Return to form",
                });
                modal.setOnAccept(() => () => {
                  modal.setModalOpen(false);
                  nav(
                    originPath ? { path: originPath } : { path: "/dashboard" },
                  );
                });
                modal.setModalOpen(true);
              }}
            >
              Cancel
            </I.Button>
          </div>
        </form>
      </I.Form>
    </SimplePageContainer>
  );
};
