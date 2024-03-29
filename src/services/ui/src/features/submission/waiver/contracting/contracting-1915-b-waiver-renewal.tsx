import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "react-router-dom";
import {
  BreadCrumbs,
  SimplePageContainer,
  SectionCard,
  FAQ_TAB,
  formCrumbsFromPath,
  useAlertContext,
  useNavigate,
} from "@/components";
import * as Content from "@/components/Form/content";
import * as Inputs from "@/components/Inputs";
import { useGetUser, submit } from "@/api";
import { Authority } from "shared-types";
import {
  zAdditionalInfo,
  zRenewalOriginalWaiverNumberSchema,
  zAttachmentOptional,
  zAttachmentRequired,
  zRenewalWaiverNumberSchema,
  Origin,
  ORIGIN,
  originRoute,
  useOriginPath,
} from "@/utils";
import { useQuery as useQueryString } from "@/hooks";
import {
  AdditionalInfoInput,
  DescriptionInput,
  SubjectInput,
} from "@/features";
import { SubmitAndCancelBtnSection } from "../shared-components";

const formSchema = z
  .object({
    waiverNumber: zRenewalOriginalWaiverNumberSchema,
    id: zRenewalWaiverNumberSchema,
    proposedEffectiveDate: z.date(),
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
    attachments: z.object({
      b4WaiverApplication: zAttachmentRequired({ min: 1 }),
      b4IndependentAssessment: zAttachmentOptional,
      tribalConsultation: zAttachmentOptional,
      other: zAttachmentOptional,
    }),
    additionalInformation: zAdditionalInfo.optional(),
    seaActionType: z.string().default("Renew"),
  })
  .superRefine((data, ctx) => {
    const renewalIteration = data.id.split(".")[1]; // R## segment of Waiver Number
    if (
      ["R00", "R01"].includes(renewalIteration) &&
      data.attachments.b4IndependentAssessment === undefined
    ) {
      ctx.addIssue({
        message:
          "An Independent Assessment is required for the first two renewals.",
        code: z.ZodIssueCode.custom,
        fatal: true,
        path: ["attachments", "b4IndependentAssessment"],
      });
    }
    return z.never;
  });
type Waiver1915BContractingRenewal = z.infer<typeof formSchema>;

// first argument in the array is the name that will show up in the form submission
// second argument is used when mapping over for the label
const attachmentList = [
  {
    name: "b4WaiverApplication",
    label:
      "1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print",
    required: true,
  },
  {
    name: "b4IndependentAssessment",
    label:
      "1915(b)(4) FFS Selective Contracting (Streamlined) Independent Assessment (first two renewals only)",
    required: false,
  },
  {
    name: "tribalConsultation",
    label: "Tribal Consultation",
    required: false,
  },
  {
    name: "other",
    label: "Other",
    required: false,
  },
] as const;

export const Contracting1915BWaiverRenewalPage = () => {
  const location = useLocation();
  const { data: user } = useGetUser();
  const navigate = useNavigate();
  const urlQuery = useQueryString();
  const alert = useAlertContext();
  const originPath = useOriginPath();

  const handleSubmit: SubmitHandler<Waiver1915BContractingRenewal> = async (
    formData,
  ) => {
    try {
      // AK-0260.R04.02
      await submit<Waiver1915BContractingRenewal>({
        data: formData,
        endpoint: "/submit",
        user,
        authority: Authority["1915b"],
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
  };

  const form = useForm<Waiver1915BContractingRenewal>({
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
          <h1 className="text-2xl font-semibold mt-4 mb-2">
            1915(b)(4) FFS Selective Contracting Renewal Waiver
          </h1>
          <SectionCard title="1915(b) Waiver Renewal Details">
            <Content.FormIntroText />
            <div className="flex flex-col">
              <Inputs.FormLabel className="font-semibold">
                Waiver Authority
              </Inputs.FormLabel>
              <span className="text-lg font-thin">1915(b)</span>
            </div>
            <Inputs.FormField
              control={form.control}
              name="waiverNumber"
              render={({ field }) => (
                <Inputs.FormItem>
                  <div className="flex gap-4">
                    <Inputs.FormLabel className="font-semibold">
                      Existing Waiver Number to Renew{" "}
                      <Inputs.RequiredIndicator />
                    </Inputs.FormLabel>
                  </div>
                  <p className="text-gray-500 font-light">
                    Enter the existing waiver number in the format it was
                    approved, using a dash after the two character state
                    abbreviation.
                  </p>
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
              name="id"
              render={({ field }) => (
                <Inputs.FormItem>
                  <div className="flex gap-4">
                    <Inputs.FormLabel className="font-semibold">
                      1915(b) Waiver Renewal Number <Inputs.RequiredIndicator />
                    </Inputs.FormLabel>
                    <Link
                      to="/faq/waiver-amendment-id-format"
                      target={FAQ_TAB}
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline flex items-center"
                    >
                      What is my 1915(b) Waiver Renewal Number?
                    </Link>
                  </div>
                  <p className="text-gray-500 font-light">
                    The Waiver Number must be in the format of SS-####.R##.00 or
                    SS-#####.R##.00. For renewals, the {"'R##'"} starts with
                    {" 'R01'"} and ascends.
                  </p>
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
                <Inputs.FormItem className="max-w-lg">
                  <Inputs.FormLabel className="font-semibold block">
                    Proposed Effective Date of 1915(b) Waiver Renewal{" "}
                    <Inputs.RequiredIndicator />
                  </Inputs.FormLabel>
                  <Inputs.FormControl className="max-w-sm">
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
              helperText="The title or purpose of the Waiver"
            />
            <DescriptionInput
              control={form.control}
              name="description"
              helperText="A summary of the Waiver. This should include details about a reduction or increase, the amount of the reduction or increase, Federal Budget impact, and fiscal year. If there is a reduction, indicate if the EPSDT population is or isn’t exempt from the reduction."
            />
          </SectionCard>
          <SectionCard title="Attachments">
            <Content.AttachmentsSizeTypesDesc faqLink="/faq/medicaid-spa-attachments" />
            {attachmentList.map(({ name, label, required }) => (
              <Inputs.FormField
                key={name}
                control={form.control}
                name={`attachments.${name}`}
                render={({ field }) => (
                  <Inputs.FormItem>
                    <Inputs.FormLabel>
                      {label}
                      {required ? <Inputs.RequiredIndicator /> : null}
                    </Inputs.FormLabel>
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
          <SubmitAndCancelBtnSection />
        </form>
      </Inputs.Form>
    </SimplePageContainer>
  );
};
