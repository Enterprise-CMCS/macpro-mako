/* eslint-disable react/prop-types */

import {
  BreadCrumbs,
  LoadingSpinner,
  SectionCard,
  SimplePageContainer,
} from "@/components";
import { useLocationCrumbs } from "@/pages/form/form-breadcrumbs";
import * as I from "@/components/Inputs";
import * as C from "@/pages/form/content";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SlotAttachments } from "@/pages/actions/renderSlots";
import { FORM, SchemaForm } from "./consts";
import { SlotStateSelect, WaiverIdFieldArray } from "./slots";
import { ModalProvider } from "@/components/Context/modalContext";
import { SubmissionServiceParameters, submit } from "@/api/submissionService";
import { useGetUser } from "@/api/useGetUser";
import { PlanType } from "shared-types";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@/components/Routing";
import { useState } from "react";

export const AppKSubmissionForm = () => {
  const nav = useNavigate();
  const crumbs = useLocationCrumbs();
  const { data: user } = useGetUser();
  const [isNavigating, setIsNavigating] = useState(false); // delay for opensearch record to be ready

  const form = useForm<SchemaForm>({
    resolver: zodResolver(FORM),
  });

  const submission = useMutation({
    mutationFn: (config: SubmissionServiceParameters<any>) => submit(config),
  });

  const onSubmit = form.handleSubmit(async (draft) => {
    await submission.mutateAsync(
      {
        data: draft,
        authority: PlanType["1915c"],
        endpoint: "/appk",
        user,
      },
      {
        onSuccess: () => {
          setIsNavigating(true);
          setTimeout(() => {
            nav({
              path: "/details",
              query: { id: `${draft.state}-${draft.waiverIds[0]}` },
            });
          }, 5000); // delay for opensearch record to be ready
        },
        onError: (err) => console.error(err),
      }
    );
  });

  return (
    <SimplePageContainer>
      {(submission.isLoading || isNavigating) && <LoadingSpinner />}
      <ModalProvider>
        <BreadCrumbs options={crumbs} />
        <I.Form {...form}>
          <form onSubmit={onSubmit} className="my-6 space-y-8 flex flex-col">
            <SectionCard title="Appendix K Details">
              <I.FormField
                control={form.control}
                name="state"
                render={SlotStateSelect({ label: "State" })}
              />
              <div className="px-4 border-l-2">
                <WaiverIdFieldArray
                  {...form}
                  state={form.watch("state")}
                  name="waiverIds"
                />
              </div>
              <I.FormField
                control={form.control}
                name="proposedEffectiveDate"
                render={({ field }) => (
                  <I.FormItem className="max-w-sm">
                    <I.FormLabel className="text-lg font-bold block">
                      Proposed Effective Date
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
            </SectionCard>

            <SectionCard title="Additional Information">
              <I.FormField
                control={form.control}
                name="additionalInformation"
                render={({ field }) => (
                  <I.FormItem>
                    <I.FormLabel className="font-normal">
                      Add anything else you would like to share with CMS,
                      limited to 4000 characters
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
              <I.Button type="submit">Submit</I.Button>
              <I.Button
                type="button"
                // onClick={() => setCancelModalOpen(true)}
                variant="outline"
              >
                Cancel
              </I.Button>
            </div>
          </form>
        </I.Form>
      </ModalProvider>
    </SimplePageContainer>
  );
};
