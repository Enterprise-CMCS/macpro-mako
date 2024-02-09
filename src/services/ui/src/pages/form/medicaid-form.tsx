import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Inputs from "@/components/Inputs";
import * as Content from "./content";
import { Link, useLocation } from "react-router-dom";
import { useGetUser } from "@/api/useGetUser";
import {
  Alert,
  BreadCrumbs,
  LoadingSpinner,
  SimplePageContainer,
  SectionCard,
} from "@/components";
import { submit } from "@/api/submissionService";
import { PlanType } from "shared-types";
import {
  zAttachmentOptional,
  zAttachmentRequired,
  zSpaIdSchema,
} from "@/pages/form/zod";
import { ModalProvider, useModalContext } from "@/pages/form/modals";
import { formCrumbsFromPath } from "@/pages/form/form-breadcrumbs";
import { FAQ_TAB } from "@/components/Routing/consts";

const formSchema = z.object({
  id: zSpaIdSchema,
  additionalInformation: z.string().max(4000).optional(),
  subject: z.string(),
  description: z.string(),
  planType: z.string(),
  planSubType: z.string(),
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

export const MedicaidForm = () => {
  const location = useLocation();
  const { data: user } = useGetUser();
  const { setCancelModalOpen, setSuccessModalOpen } = useModalContext();
  const handleSubmit: SubmitHandler<MedicaidFormSchema> = async (formData) => {

    try {
      await submit<MedicaidFormSchema>({
        data: formData,
        endpoint: "/submit",
        user,
        authority: PlanType.MED_SPA,
      });
      setSuccessModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const form = useForm<MedicaidFormSchema>({
    resolver: zodResolver(formSchema),
  });

  return (
    <SimplePageContainer>
      <BreadCrumbs options={formCrumbsFromPath(location.pathname)} />
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
                    <Inputs.FormLabel className="text-lg font-bold">
                      SPA ID <Inputs.RequiredIndicator />
                    </Inputs.FormLabel>
                    <Link
                      to="/faq/#spa-id-format"
                      target={FAQ_TAB}
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      What is my SPA ID?
                    </Link>
                  </div>
                  <Content.SpaIdFormattingDesc />
                  <Inputs.FormControl className="max-w-sm">
                    <Inputs.Input
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
                  <Inputs.FormLabel className="text-lg font-bold block">
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
            <Inputs.FormField
              control={form.control}
              name="planType"
              render={({ field }) => (
                <Inputs.FormItem className="max-w-sm">
                  <Inputs.FormLabel className="text-lg font-bold block">
                    Plan Type <Inputs.RequiredIndicator />
                  </Inputs.FormLabel>
                    <Inputs.Select {...field} >
                  <Inputs.FormControl>
                  <Inputs.SelectTrigger>
                    <Inputs.SelectValue placeholder="Select a plan type" />
                  </Inputs.SelectTrigger>
                  </Inputs.FormControl>
                      <Inputs.SelectContent>
                        <Inputs.SelectItem value="125">Medicaid SPA</Inputs.SelectItem>
                      </Inputs.SelectContent>
                      </Inputs.Select>
                  <Inputs.FormMessage />
                </Inputs.FormItem>
              )}
            />
            <Inputs.FormField
              control={form.control}
              name="planSubType"
              render={({ field }) => (
                <Inputs.FormItem className="max-w-sm">
                  <Inputs.FormLabel className="text-lg font-bold block">
                    Plan Sub Type <Inputs.RequiredIndicator />
                  </Inputs.FormLabel>
                    <Inputs.Select {...field} >
                  <Inputs.FormControl>
                  <Inputs.SelectTrigger>
                    <Inputs.SelectValue placeholder="Select a plan sub-type" />
                  </Inputs.SelectTrigger>
                  </Inputs.FormControl>
                      <Inputs.SelectContent>
                        <Inputs.SelectItem value="782">Copays/Deductibles/Coinsurance</Inputs.SelectItem>
                        <Inputs.SelectItem value="783">Premiums/Enrollment Fees</Inputs.SelectItem>
                        <Inputs.SelectItem value="784">Aged/Blind/Disabled Eligibility</Inputs.SelectItem>
                        <Inputs.SelectItem value="785">Application</Inputs.SelectItem>
                        <Inputs.SelectItem value="786">Asset Verification System</Inputs.SelectItem>
                        <Inputs.SelectItem value="787">Authorized Representative</Inputs.SelectItem>
                        <Inputs.SelectItem value="788">Breast & Cervical Cancer</Inputs.SelectItem>
                        <Inputs.SelectItem value="789">Citizenship and Non-Citizen Eligibility</Inputs.SelectItem>
                        <Inputs.SelectItem value="790">Cost of Living Adjustment</Inputs.SelectItem>
                        <Inputs.SelectItem value="791">Cost Sharing/Copayment</Inputs.SelectItem>
                        <Inputs.SelectItem value="792">Disabled Children</Inputs.SelectItem>
                        <Inputs.SelectItem value="793">Disregards</Inputs.SelectItem>
                        <Inputs.SelectItem value="794">Eligibility Process</Inputs.SelectItem>
                        <Inputs.SelectItem value="795">Express Lane</Inputs.SelectItem>
                        <Inputs.SelectItem value="796">Family Planning</Inputs.SelectItem>
                        <Inputs.SelectItem value="797">Family/Adult Eligibility</Inputs.SelectItem>
                        <Inputs.SelectItem value="798">Federal Benefit Rate</Inputs.SelectItem>
                        <Inputs.SelectItem value="799">Home Equity</Inputs.SelectItem>
                        <Inputs.SelectItem value="800">Hospital Presumptive Eligibility</Inputs.SelectItem>
                        <Inputs.SelectItem value="801">Income Standard—Territories</Inputs.SelectItem>
                        <Inputs.SelectItem value="802">Income/Resource Methodologies</Inputs.SelectItem>
                      </Inputs.SelectContent>
                      </Inputs.Select>
                  <Inputs.FormMessage />
                </Inputs.FormItem>
              )}
            />
            <Inputs.FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <Inputs.FormItem className="max-w-xl">
                  <Inputs.FormLabel className="text-lg font-bold block">
                    Subject <Inputs.RequiredIndicator />
                  </Inputs.FormLabel>
                  <Inputs.FormControl>
                    <Inputs.Input {...field} />
                  </Inputs.FormControl>
                  <Inputs.FormMessage />
                </Inputs.FormItem>
              )}
            />
            <Inputs.FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <Inputs.FormItem className="max-w-xl">
                  <Inputs.FormLabel className="text-lg font-bold block">
                    Description <Inputs.RequiredIndicator />
                  </Inputs.FormLabel>
                  <Inputs.Textarea
                    {...field}
                    className="h-[100px] resize-none"
                  />
                  <Inputs.FormMessage />
                </Inputs.FormItem>
              )}
            />
          </SectionCard>
          <SectionCard title="Attachments">
            <Content.AttachmentsSizeTypesDesc
              faqLink="/faq/#medicaid-spa-attachments"
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
          <SectionCard title="Additional Information">
            <Inputs.FormField
              control={form.control}
              name="additionalInformation"
              render={({ field }) => (
                <Inputs.FormItem>
                  <Inputs.FormLabel className="font-normal">
                    Add anything else you would like to share with CMS, limited
                    to 4000 characters
                  </Inputs.FormLabel>
                  <Inputs.Textarea
                    {...field}
                    className="h-[200px] resize-none"
                  />
                  <Inputs.FormDescription>
                    4,000 characters allowed
                  </Inputs.FormDescription>
                </Inputs.FormItem>
              )}
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
              onClick={() => setCancelModalOpen(true)}
              className="px-12"
            >
              Cancel
            </Inputs.Button>
          </div>
        </form>
      </Inputs.Form>
    </SimplePageContainer>
  );
};

export const MedicaidSpaFormPage = () => (
  <ModalProvider>
    <MedicaidForm />
  </ModalProvider>
);
