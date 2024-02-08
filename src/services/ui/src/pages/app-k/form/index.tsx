/* eslint-disable react/prop-types */

import { BreadCrumbs, SectionCard, SimplePageContainer } from "@/components";
import { useLocationCrumbs } from "@/pages/form/form-breadcrumbs";
import * as I from "@/components/Inputs";
import * as C from "@/pages/form/content";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SlotAttachments } from "@/pages/actions/renderSlots";
import { FORM, SchemaForm } from "./consts";
import { SlotStateSelect, WaiverIdFieldArray } from "./slots";
import { ModalProvider } from "@/pages/form/modals";
import { submit } from "@/api/submissionService";
import { useGetUser } from "@/api/useGetUser";
import { PlanType } from "shared-types";

export const AppKSubmissionForm = () => {
  const crumbs = useLocationCrumbs();
  const { data: user } = useGetUser();

  const form = useForm<SchemaForm>({
    resolver: zodResolver(FORM),
  });

  const onSubmit = form.handleSubmit(async (draft) => {
    try {
      await submit({
        data: draft,
        authority: PlanType["1915c"],
        endpoint: "/appk",
        user,
      });
    } catch (err) {
      console.error(err);
    }
  });

  return (
    <SimplePageContainer>
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
