import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "react-router-dom";
import {
  BreadCrumbs,
  SimplePageContainer,
  SectionCard,
  formCrumbsFromPath,
  FAQ_TAB,
  FAQFooter,
  useAlertContext,
  useNavigate,
  Route,
  FormField,
} from "@/components";
import * as Content from "@/components/Form/old-content";
import * as Inputs from "@/components/Inputs";
import { useGetUser, submit, getItem } from "@/api";
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
import { SubmitAndCancelBtnSection } from "../shared-components";
import { SlotAdditionalInfo } from "@/features";
import { DataPoller } from "@/utils/DataPoller";

const formSchema = z
  .object({
    waiverNumber: zRenewalOriginalWaiverNumberSchema,
    id: zRenewalWaiverNumberSchema,
    proposedEffectiveDate: z.date(),
    attachments: z.object({
      bCapWaiverApplication: zAttachmentRequired({ min: 1 }),
      bCapCostSpreadsheets: zAttachmentRequired({ min: 1 }),
      bCapIndependentAssessment: zAttachmentOptional,
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
      data.attachments.bCapIndependentAssessment === undefined
    ) {
      ctx.addIssue({
        message:
          "An Independent Assessment is required for the first two renewals.",
        code: z.ZodIssueCode.custom,
        fatal: true,
        path: ["attachments", "bCapIndependentAssessment"],
      });
    }
    return z.never;
  });
type Waiver1915BCapitatedRenewal = z.infer<typeof formSchema>;

// first argument in the array is the name that will show up in the form submission
// second argument is used when mapping over for the label
const attachmentList = [
  {
    name: "bCapWaiverApplication",
    label: "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
    required: true,
  },
  {
    name: "bCapCostSpreadsheets",
    label:
      "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
    required: true,
  },
  {
    name: "bCapIndependentAssessment",
    label:
      "1915(b) Comprehensive (Capitated) Waiver Independent Assessment (first two renewals only)",
    subtext: "Required for the first two renewals",
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

export const Capitated1915BWaiverRenewalPage = () => {
  const location = useLocation();
  const { data: user } = useGetUser();
  const navigate = useNavigate();
  const urlQuery = useQueryString();
  const alert = useAlertContext();
  const originPath = useOriginPath();

  const handleSubmit: SubmitHandler<Waiver1915BCapitatedRenewal> = async (
    formData,
  ) => {
    try {
      // AK-0260.R04.02
      await submit<Waiver1915BCapitatedRenewal>({
        data: formData,
        endpoint: "/submit",
        user,
        authority: Authority["1915b"],
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

      const poller = new DataPoller({
        interval: 1000,
        pollAttempts: 10,
        fetcher: () => getItem(formData.id),
        checkStatus: (data) => {
          return data._source.actionType === "Renew";
        },
      });
      await poller.startPollingData();

      navigate(originPath ? { path: originPath } : { path: "/dashboard" });
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

  const form = useForm<Waiver1915BCapitatedRenewal>({
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
            1915(b) Comprehensive (Capitated) Renewal Waiver
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
                    SS-#####.R##.00. For renewals, the {"'R##'"} starts with{" "}
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
          <SubmitAndCancelBtnSection />
        </form>
      </Inputs.Form>
      <FAQFooter />
    </SimplePageContainer>
  );
};
