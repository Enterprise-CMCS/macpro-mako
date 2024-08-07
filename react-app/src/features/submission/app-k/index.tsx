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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SlotAdditionalInfo, SlotAttachments } from "@/features";
import { documentPoller } from "@/utils/Poller/documentPoller";
import { SubmitAndCancelBtnSection } from "../waiver/shared-components";

export const AppKSubmissionForm = () => {
  const nav = useNavigate();
  const crumbs = C.useLocationCrumbs();
  const { data: user } = useGetUser();
  const [isDataPolling, setIsDataPolling] = useState(false);
  const form = useForm<SchemaForm>({
    reValidateMode: "onBlur",
    resolver: zodResolver(FORM),
  });

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
        onSuccess: async () => {
          C.banner({
            header: "Package submitted",
            body: "The 1915(c) Appendix K Amendment Request has been submitted.",
            variant: "success",
            pathnameToDisplayOn: "/dashboard",
          });
          setIsDataPolling(true);
          await documentPoller(
            `${draft.state}-${draft.waiverIds[0]}`,
            (checks) =>
              checks.authorityIs([Authority["1915c"]]) &&
              checks.actionIs("Amend"),
          ).startPollingData();
          setIsDataPolling(false);

          nav({
            path: "/dashboard",
            query: {
              tab: "waivers",
            },
          });
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
      {(submission.isLoading || isDataPolling) && <C.LoadingSpinner />}
      <C.BreadCrumbs options={crumbs} />
      <I.Form {...form}>
        <form onSubmit={onSubmit} className="my-6 space-y-8 flex flex-col">
          <C.SectionCard title="1915(c) Appendix K Amendment Request Details">
            <C.FormIntroTextForAppK />
            <I.FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <I.FormItem className="w-[280px]">
                  <I.FormLabel className="font-bold" htmlFor="amendment-title">
                    Amendment Title <I.RequiredIndicator />
                  </I.FormLabel>
                  <I.Textarea
                    {...field}
                    className="h-[80px]"
                    id="amendment-title"
                  />
                  <I.FormMessage />
                </I.FormItem>
              )}
            />
            <div className="flex flex-col">
              <I.FormLabel className="font-semibold" htmlFor="1975c">
                Waiver Authority
              </I.FormLabel>
              <span className="text-lg font-thin" id="1975c">
                1915(c)
              </span>
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
                  <div className="flex gap-4">
                    <I.FormLabel className="font-bold">
                      Waiver IDs <I.RequiredIndicator />
                    </I.FormLabel>
                    <Link
                      to="/faq/waiver-c-id"
                      target={C.FAQ_TAB}
                      rel="noopener noreferrer"
                      className="text-blue-900 underline"
                    >
                      What is my Appendix K ID?
                    </Link>
                  </div>
                  <div className="my-1">
                    Format is <strong>1111</strong>.<strong>R22</strong>.
                    <strong>33</strong> or <strong>11111</strong>.
                    <strong>R22</strong>.<strong>33</strong> where:
                  </div>
                  <ul className="pl-4 list-disc w-[600px] flex flex-col gap-1">
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
                  </ul>
                </p>
                <div className="flex flex-col gap-2">
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
                    Proposed Effective Date of 1915(c) Appendix K Amendment{" "}
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
            <C.AttachmentsSizeTypesDesc faqAttLink="/faq/appk-attachments" />
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
                  <p>Add anything else you would like to share with CMS.</p>
                ),
              })}
            />
          </C.SectionCard>
          <C.PreSubmissionMessage />
          <SubmitAndCancelBtnSection />
        </form>
      </I.Form>
      <C.FAQFooter />
    </C.SimplePageContainer>
  );
};
