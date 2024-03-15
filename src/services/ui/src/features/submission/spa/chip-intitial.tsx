import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useNavigate } from "@/components/Routing";
import {
  Alert,
  BreadCrumbs,
  LoadingSpinner,
  SectionCard,
  SimplePageContainer,
  useModalContext,
  FAQ_TAB,
  useAlertContext,
  useLocationCrumbs,
} from "@/components";
import * as Inputs from "@/components/Inputs";
import * as Content from "@/components";
import { useGetUser, submit } from "@/api";
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
import {
  DescriptionInput,
  SubjectInput,
  TypeSelect,
  SubTypeSelect,
  AdditionalInfoInput,
} from "../shared-components";

const formSchema = z.object({
  id: zSpaIdSchema,
  additionalInformation: z.string().max(4000).optional(),
  subject: z
    .string()
    .trim()
    .min(1, { message: "This field is required" })
    .max(120, { message: "Subject should be under 120 characters" }),
  description: z
    .string()
    .trim()
    .min(1, { message: "This field is required" })
    .max(4000, { message: "Description should be under 4000 characters" }),
  typeIds: z
    .array(z.number())
    .min(1, { message: "At least one type is required" }),
  subTypeIds: z
    .array(z.number())
    .min(1, { message: "At least one subtype is required" }),
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
  const urlQuery = useQueryString();
  const modal = useModalContext();
  const alert = useAlertContext();
  const originPath = useOriginPath();
  const cancelOnAccept = useCallback(() => {
    modal.setModalOpen(false);
    navigate(originPath ? { path: originPath } : { path: "/dashboard" });
  }, []);
  const form = useForm<ChipFormSchema>({
    resolver: zodResolver(formSchema),
  });
  const handleSubmit = form.handleSubmit(async (formData) => {
    try {
      await submit<ChipFormSchema>({
        data: formData,
        endpoint: "/submit",
        user,
        authority: Authority.CHIP_SPA,
      });
      alert.setContent({
        header: "Package submitted",
        body: "Your submission has been received.",
      });
      alert.setBannerShow(true);
      alert.setBannerDisplayOn(
        // This uses the originRoute map because this value doesn't work
        // when any queries are added, such as the case of /details?id=...
        urlQuery.get(ORIGIN)
          ? originRoute[urlQuery.get(ORIGIN)! as Origin]
          : "/dashboard",
      );
      navigate(originPath ? { path: originPath } : { path: "/dashboard" });
    } catch (e) {
      console.error(e);
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
                      className="text-blue-700 hover:underline"
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
            <SubjectInput
              control={form.control}
              name="subject"
              helperText="The title or purpose of the SPA"
            />
            <DescriptionInput
              control={form.control}
              name="description"
              helperText="A summary of the SPA. This should include details about a reduction or increase, the amount of the reduction or increase, Federal Budget impact, and fiscal year. If there is a reduction, indicate if the EPSDT population is or isn’t exempt from the reduction."
            />
            <TypeSelect
              control={form.control}
              name="typeIds"
              authorityId={124} // chip authority
            />
            <SubTypeSelect
              name="subTypeIds"
              authorityId={124} // chip authority
            />
          </SectionCard>
          <SectionCard title="Attachments">
            <Content.AttachmentsSizeTypesDesc faqLink="/faq/chip-spa-attachments" />
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

          <AdditionalInfoInput
            control={form.control}
            name="additionalInformation"
          />

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
          <div className="flex gap-2 justify-end ">
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
    </SimplePageContainer>
  );
};
