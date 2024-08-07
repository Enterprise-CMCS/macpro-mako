import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  BreadCrumbs,
  LoadingSpinner,
  SectionCard,
  SimplePageContainer,
  FAQ_TAB,
  useLocationCrumbs,
  FormField,
  banner,
} from "@/components";
import * as Inputs from "@/components/Inputs";
import * as Content from "@/components";
import { useGetUser, submit } from "@/api";
import {
  zAttachmentOptional,
  zAttachmentRequired,
  zSpaIdSchema,
  getFormOrigin,
} from "@/utils";
import { SlotAdditionalInfo } from "@/features";
import { documentPoller } from "@/utils/Poller/documentPoller";
import { SubmitAndCancelBtnSection } from "../waiver/shared-components";
import { Authority } from "shared-types";

const formSchema = z.object({
  id: zSpaIdSchema,
  additionalInformation: z.string().max(4000).optional(),
  attachments: z.object({
    currentStatePlan: zAttachmentRequired({ min: 1 }),
    amendedLanguage: zAttachmentRequired({ min: 1 }),
    coverLetter: zAttachmentRequired({ min: 1 }),
    budgetDocuments: zAttachmentOptional,
    publicNotice: zAttachmentOptional,
    tribalConsultation: zAttachmentOptional,
    other: zAttachmentOptional,
  }),
  proposedEffectiveDate: z.date(),
  seaActionType: z.string().default("Amend"),
});

type ChipFormSchema = z.infer<typeof formSchema>;

// first argument in the array is the name that will show up in the form submission
// second argument is used when mapping over for the label
const attachmentList = [
  { name: "currentStatePlan", label: "Current State Plan", required: true },
  {
    name: "amendedLanguage",
    label: "Amended State Plan Language",
    required: true,
  },
  {
    name: "coverLetter",
    label: "Cover Letter",
    required: true,
  },
  {
    name: "budgetDocuments",
    label: "Budget Documents",
    required: false,
  },
  { name: "publicNotice", label: "Public Notice", required: false },
  { name: "tribalConsultation", label: "Tribal Consultation", required: false },
  { name: "other", label: "Other", required: false },
] as const;

export const ChipSpaFormPage = () => {
  const crumbs = useLocationCrumbs();
  const { data: user } = useGetUser();
  const navigate = useNavigate();

  const form = useForm<ChipFormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });
  const handleSubmit = form.handleSubmit(async (formData) => {
    try {
      await submit<ChipFormSchema>({
        data: formData,
        endpoint: "/submit",
        user,
        authority: Authority.CHIP_SPA,
      });

      const originPath = getFormOrigin();

      banner({
        header: "Package submitted",
        body: "Your submission has been received.",
        variant: "success",
        pathnameToDisplayOn: originPath.pathname,
      });

      const poller = documentPoller(
        formData.id,
        (checks) => checks.recordExists,
      );

      await poller.startPollingData();

      navigate(originPath);
    } catch (e) {
      console.error(e);
      banner({
        header: "An unexpected error has occurred:",
        body: e instanceof Error ? e.message : String(e),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
      window.scrollTo(0, 0);
    }
  });

  return (
    <SimplePageContainer>
      <BreadCrumbs options={crumbs} />
      <Inputs.Form {...form}>
        <form
          onSubmit={handleSubmit}
          className="my-6 space-y-8 mx-auto justify-center flex flex-col"
        >
          <SectionCard title="CHIP SPA Details">
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
                <Inputs.FormItem className="max-w-sm">
                  <Inputs.FormLabel className="text-lg font-semibold block">
                    Proposed Effective Date of CHIP SPA{" "}
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
            <Content.AttachmentsSizeTypesDesc faqAttLink="/faq/chip-spa-attachments" />
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
                    {required && (
                      <Inputs.FormDescription>
                        At least one attachment is required
                      </Inputs.FormDescription>
                    )}
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
            <Alert className="mb-6 " variant="destructive">
              Missing or malformed information. Please see errors above.
            </Alert>
          ) : null}
          {form.formState.isSubmitting ? (
            <div className="p-4">
              <LoadingSpinner />
            </div>
          ) : null}
          <SubmitAndCancelBtnSection />
        </form>
      </Inputs.Form>
      <Content.FAQFooter />
    </SimplePageContainer>
  );
};
