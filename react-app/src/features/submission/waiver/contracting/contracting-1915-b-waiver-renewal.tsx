import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BreadCrumbs,
  SimplePageContainer,
  SectionCard,
  FAQ_TAB,
  FAQFooter,
  formCrumbsFromPath,
  useAlertContext,
  Route,
  FormField,
} from "@/components";
import * as Content from "@/components/Form/old-content";
import * as Inputs from "@/components/Inputs";
import { useGetUser, submit } from "@/api";
import { Authority } from "shared-types";
import {
  zAdditionalInfoOptional,
  zRenewalOriginalWaiverNumberSchema,
  zAttachmentOptional,
  zAttachmentRequired,
  zRenewalWaiverNumberSchema,
  getFormOrigin,
} from "@/utils";
import { SlotAdditionalInfo } from "@/features";
import { SubmitAndCancelBtnSection } from "../shared-components";
import { documentPoller } from "@/utils/Poller/documentPoller";

const formSchema = z
  .object({
    waiverNumber: zRenewalOriginalWaiverNumberSchema,
    id: zRenewalWaiverNumberSchema,
    proposedEffectiveDate: z.date(),
    attachments: z.object({
      b4WaiverApplication: zAttachmentRequired({ min: 1 }),
      b4IndependentAssessment: zAttachmentOptional,
      tribalConsultation: zAttachmentOptional,
      other: zAttachmentOptional,
    }),
    additionalInformation: zAdditionalInfoOptional,
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
  const alert = useAlertContext();

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

      const originPath = getFormOrigin({ authority: Authority["1915b"] });

      alert.setContent({
        header: "Package submitted",
        body: "Your submission has been received.",
      });
      alert.setBannerStyle("success");
      alert.setBannerShow(true);
      alert.setBannerDisplayOn(originPath.pathname as Route);

      const poller = documentPoller(formData.id, (checks) =>
        checks.actionIs("Renew"),
      );

      await poller.startPollingData();

      navigate(originPath);
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

  const form = useForm<Waiver1915BContractingRenewal>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
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
              <Inputs.FormLabel className="font-semibold" htmlFor="1975b">
                Waiver Authority
              </Inputs.FormLabel>
              <span className="text-lg font-thin" id="1975b">
                1915(b)
              </span>
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
                      to="/faq/waiver-renewal-id-format"
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
          </SectionCard>
          <SectionCard title="Attachments">
            <Content.AttachmentsSizeTypesDesc faqAttLink="/faq/waiverb-attachments" />
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
          <SubmitAndCancelBtnSection showAlert loadingSpinner />
        </form>
      </Inputs.Form>
      <FAQFooter />
    </SimplePageContainer>
  );
};
