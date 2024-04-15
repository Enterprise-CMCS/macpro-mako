/* eslint-disable react/prop-types */

import { SlotAdditionalInfo, SlotAttachments } from "@/features/actions";
import * as I from "@/components/Inputs";
import * as C from "@/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FORM, SchemaForm } from "./consts";
import { SlotStateSelect, WaiverIdFieldArray } from "./slots";
import { SubmissionServiceParameters, submit } from "@/api/submissionService";
import { useGetUser } from "@/api/useGetUser";
import { Authority } from "shared-types";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@/components/Routing";
import { useEffect } from "react";
import * as Content from "@/components";
import { useOriginPath } from "@/utils";
import { Link } from "react-router-dom";

export const AppKSubmissionForm = () => {
  const nav = useNavigate();
  const crumbs = C.useLocationCrumbs();
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
    console.log(draft);
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
            body: "The 1915(c) Appendix K Amendment Request has been submitted.",
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

  useEffect(() => {
    if (!state) return;
    form.setValue("waiverIds", []);
  }, [state]);

  return (
    <C.SimplePageContainer>
      {submission.isLoading && <C.LoadingSpinner />}
      <C.BreadCrumbs options={crumbs} />
      <I.Form {...form}>
        <form onSubmit={onSubmit} className="my-6 space-y-8 flex flex-col">
          <C.SectionCard title="1915(c) Appendix K Amendment Request Details">
            <Content.FormIntroTextForAppK />
            <I.FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <I.FormItem className="w-[280px]">
                  <I.FormLabel className="font-bold">
                    Amendment Title <I.RequiredIndicator />
                  </I.FormLabel>
                  <I.Textarea {...field} className="h-[80px]" />
                  <I.FormMessage />
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
              render={SlotStateSelect({
                label: (
                  <>
                    State <I.RequiredIndicator />
                  </>
                ),
              })}
            />
            {state && (
              <>
                <p>
                  <Link
                    to="/faq/waiver-c-id"
                    target={C.FAQ_TAB}
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    What is my Appendix K ID?
                  </Link>
                  <div>
                    Format is <strong>1111</strong>.<strong>R22</strong>.
                    <strong>33</strong> or <strong>11111</strong>.
                    <strong>R22</strong>.<strong>33</strong> where:
                  </div>
                  <ul className="pl-4 list-disc">
                    <li>
                      <strong>1111</strong> or <strong>11111</strong> is the
                      four- or five-digit waiver initial number
                    </li>
                    <li>
                      <strong>R22</strong> is the renewal number (Use{" "}
                      <strong>R00</strong> for waivers without renewals.)
                    </li>
                    <li>
                      <strong>33</strong> is the Appendix K amendment number
                      (The last two digits relating to the number of amendments
                      in the waiver cycle start with “01” and ascend.)
                    </li>
                    <li>
                      <strong>
                        The first ID entered will be used to track the
                        submission on the OneMAC dashboard.
                      </strong>
                      {"  "}
                      You’ll be able to find the other waiver IDs entered below
                      by searching for the first waiver ID.
                    </li>
                  </ul>
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <I.FormLabel className="font-bold">
                      Appendix K ID <I.RequiredIndicator />
                    </I.FormLabel>
                  </div>
                  <WaiverIdFieldArray
                    state={state}
                    name="waiverIds"
                    {...form}
                  />
                </div>
              </>
            )}

            <I.FormField
              control={form.control}
              name="proposedEffectiveDate"
              render={({ field }) => (
                <I.FormItem className="max-w-sm">
                  <I.FormLabel className="font-bold block">
                    Proposed Effective Date of 1915(c) Appendix K Amendment
                    <I.RequiredIndicator />
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
          </C.SectionCard>
          <C.SectionCard title="Attachments">
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
          </C.SectionCard>
          <C.SectionCard title="Additional Information">
            <I.FormField
              control={form.control}
              name={"additionalInformation"}
              render={SlotAdditionalInfo({
                withoutHeading: true,
                label: (
                  <p>
                    Add anything else you would like to share with CMS, limited
                    to 4000 characters
                  </p>
                ),
              })}
            />
          </C.SectionCard>
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
      <C.FAQFooter />
    </C.SimplePageContainer>
  );
};
