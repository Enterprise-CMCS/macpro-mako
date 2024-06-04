import { useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Inputs from "@/components/Inputs";
import { Link } from "react-router-dom";
import { useGetUser } from "@/api/useGetUser";
import {
  Alert,
  BreadCrumbs,
  LoadingSpinner,
  SectionCard,
  SimplePageContainer,
  useModalContext,
  FAQ_TAB,
  useAlertContext,
  useNavigate,
  useLocationCrumbs,
  Route,
} from "@/components";
import * as Content from "@/components";
import { submit } from "@/api";
import { Authority } from "shared-types";
import {
  zAttachmentOptional,
  zAttachmentRequired,
  zSpaIdSchema,
  Origin,
  ORIGIN,
  originRoute,
  useOriginPath,
} from "@/utils";
import { useQuery as useQueryString } from "@/hooks";
import { FormField } from "@/components/Inputs";
import { SlotAdditionalInfo } from "@/features";
import { documentPoller } from "@/utils/Poller/documentPoller";

const formSchema = z.object({
  id: zSpaIdSchema,
  additionalInformation: z.string().max(4000).optional(),
  attachments: z.object({
    cmsForm179: zAttachmentRequired({
      min: 1,
      max: 1,
      message: "Required: You must submit exactly one file for CMS Form 179.",
    }),
    spaPages: zAttachmentRequired({ min: 1 }),
    coverLetter: zAttachmentOptional,
    tribalEngagement: zAttachmentOptional,
    existingStatePlanPages: zAttachmentOptional,
    publicNotice: zAttachmentOptional,
    sfq: zAttachmentOptional,
    tribalConsultation: zAttachmentOptional,
    other: zAttachmentOptional,
  }),
  proposedEffectiveDate: z.date(),
});
type MedicaidFormSchema = z.infer<typeof formSchema>;

// first argument in the array is the name that will show up in the form submission
// second argument is used when mapping over for the label
const attachmentList = [
  { name: "cmsForm179", label: "CMS Form 179", required: true },
  { name: "spaPages", label: "SPA Pages", required: true },
  { name: "coverLetter", label: "Cover Letter", required: false },
  {
    name: "tribalEngagement",
    label: "Document Demonstrating Good-Faith Tribal Engagement",
    required: false,
  },
  {
    name: "existingStatePlanPages",
    label: "Existing State Plan Page(s)",
    required: false,
  },
  { name: "publicNotice", label: "Public Notice", required: false },
  { name: "sfq", label: "Standard Funding Questions (SFQs)", required: false },
  { name: "tribalConsultation", label: "Tribal Consultation", required: false },
  { name: "other", label: "Other", required: false },
] as const;

export const MedicaidSpaFormPage = () => {
  const { data: user } = useGetUser();
  const crumbs = useLocationCrumbs();
  const navigate = useNavigate();
  const urlQuery = useQueryString();
  const modal = useModalContext();
  const alert = useAlertContext();
  const originPath = useOriginPath();
  const cancelOnAccept = useCallback(() => {
    modal.setModalOpen(false);
    navigate(originPath ? { path: originPath } : { path: "/dashboard" });
  }, []);
  const form = useForm<MedicaidFormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const handleSubmit: SubmitHandler<MedicaidFormSchema> = async (formData) => {
    try {
      await submit<MedicaidFormSchema>({
        data: formData,
        endpoint: "/submit",
        user,
        authority: Authority.MED_SPA,
      });
      alert.setContent({
        header: "Package submitted",
        body: "Your submission has been received.",
      });
      alert.setBannerStyle("success");
      alert.setBannerShow(true);
      alert.setBannerDisplayOn(
        // This uses the originRoute map because this value doesn't work
        // when any queries are added, such as the case of /details?id=...
        urlQuery.get(ORIGIN)
          ? originRoute[urlQuery.get(ORIGIN)! as Origin]
          : "/dashboard",
      );

      const poller = documentPoller(
        formData.id,
        (checks) => checks.recordExists,
      );

      await poller.startPollingData();

      navigate(
        originPath
          ? { path: `${originPath}?tab=spas` as Route }
          : { path: "/dashboard?tab=spas" as Route },
      );
    } catch (e) {
      console.error(e);
      alert.setContent({
        header: "An unexpected error has occurred:",
        body: e instanceof Error ? e.message : String(e),
      });
      alert.setBannerStyle("destructive");
      alert.setBannerDisplayOn(window.location.pathname as Route);
      alert.setBannerShow(true);
      window.scrollTo(0, 0);
    }
  };
  return (
    <SimplePageContainer>
      <BreadCrumbs options={crumbs} />
      <Inputs.Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="my-6 space-y-8 mx-auto justify-center flex flex-col"
        >
          <SectionCard title="Medicaid SPA Details">
            <Content.FormIntroText />
            <Inputs.FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <Inputs.FormItem>
                  <div className="flex gap-4">
                    <Inputs.FormLabel className="font-semibold">
                      SPA ID <Inputs.RequiredIndicator />
                    </Inputs.FormLabel>
                    <Link
                      to="/faq/spa-id-format"
                      target={FAQ_TAB}
                      rel="noopener noreferrer"
                      className="text-blue-900 underline"
                    >
                      What is my SPA ID?
                    </Link>
                  </div>
                  <Content.SpaIdFormattingDesc />
                  <Inputs.FormControl>
                    <Inputs.Input
                      className="max-w-sm"
                      {...field}
                      onInput={(e) => {
                        if (e.target instanceof HTMLInputElement) {
                          e.target.value = e.target.value.toUpperCase();
                        }
                      }}
                    />
                  </Inputs.FormControl>
                  <Inputs.FormMessage />
                </Inputs.FormItem>
              )}
            />
            <Inputs.FormField
              control={form.control}
              name="proposedEffectiveDate"
              render={({ field }) => (
                <Inputs.FormItem className="max-w-md">
                  <Inputs.FormLabel className="text-lg font-semibold block">
                    Proposed Effective Date of Medicaid SPA{" "}
                    <Inputs.RequiredIndicator />
                  </Inputs.FormLabel>
                  <Inputs.FormControl>
                    <Inputs.DatePicker
                      onChange={field.onChange}
                      date={field.value}
                    />
                  </Inputs.FormControl>
                  <Inputs.FormMessage />
                </Inputs.FormItem>
              )}
            />
          </SectionCard>
          <SectionCard title="Attachments">
            <Content.AttachmentsSizeTypesDesc
              faqAttLink="/faq/medicaid-spa-attachments"
              includeCMS179
            />
            {attachmentList.map(({ name, label, required }) => (
              <Inputs.FormField
                key={name}
                control={form.control}
                name={`attachments.${name}`}
                render={({ field }) => (
                  <Inputs.FormItem>
                    <Inputs.FormLabel>
                      {label} {required ? <Inputs.RequiredIndicator /> : null}
                    </Inputs.FormLabel>
                    {
                      <Inputs.FormDescription>
                        {name === "cmsForm179"
                          ? "One attachment is required"
                          : ""}
                        {name === "spaPages"
                          ? "At least one attachment is required"
                          : ""}
                      </Inputs.FormDescription>
                    }
                    <Inputs.Upload
                      files={field?.value ?? []}
                      setFiles={field.onChange}
                    />
                    <Inputs.FormMessage />
                  </Inputs.FormItem>
                )}
              />
            ))}
          </SectionCard>
          <SectionCard title={"Additional Information"}>
            <FormField
              control={form.control}
              name={"additionalInformation"}
              render={SlotAdditionalInfo({
                withoutHeading: true,
                label: (
                  <p>Add anything else you would like to share with CMS</p>
                ),
              })}
            />
          </SectionCard>
          <Content.PreSubmissionMessage />
          {Object.keys(form.formState.errors).length !== 0 ? (
            <Alert className="mb-6" variant="destructive">
              Missing or malformed information. Please see errors above.
            </Alert>
          ) : null}
          {form.formState.isSubmitting ? (
            <div className="p-4">
              <LoadingSpinner />
            </div>
          ) : null}
          <div className="flex gap-2 justify-end">
            <Inputs.Button
              disabled={form.formState.isSubmitting}
              type="submit"
              className="px-12"
            >
              Submit
            </Inputs.Button>
            <Inputs.Button
              type="button"
              variant="outline"
              onClick={() => {
                modal.setContent({
                  header: "Stop form submission?",
                  body: "All information you've entered on this form will be lost if you leave this page.",
                  acceptButtonText: "Yes, leave form",
                  cancelButtonText: "Return to form",
                });
                modal.setOnAccept(() => cancelOnAccept);
                modal.setModalOpen(true);
              }}
              className="px-12"
            >
              Cancel
            </Inputs.Button>
          </div>
        </form>
      </Inputs.Form>
      <Content.FAQFooter />
    </SimplePageContainer>
  );
};
