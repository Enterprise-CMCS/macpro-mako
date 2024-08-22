import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BreadCrumbs,
  SimplePageContainer,
  SectionCard,
  formCrumbsFromPath,
  FAQ_TAB,
  FAQFooter,
  banner,
  FormField,
  LoadingSpinner,
} from "@/components";
import * as Content from "@/components/Form/old-content";
import * as Inputs from "@/components/Inputs";
import { useGetUser, submit } from "@/api";
import { Authority } from "shared-types";
import {
  zAdditionalInfoOptional,
  zAmendmentOriginalWaiverNumberSchema,
  zAmendmentWaiverNumberSchema,
  zAttachmentOptional,
  zAttachmentRequired,
  getFormOrigin,
} from "@/utils";
import { SubmitAndCancelBtnSection } from "../shared-components";
import { SlotAdditionalInfo } from "@/features";
import { documentPoller } from "@/utils/Poller/documentPoller";

const formSchema = z.object({
  waiverNumber: zAmendmentOriginalWaiverNumberSchema,
  id: zAmendmentWaiverNumberSchema,
  proposedEffectiveDate: z.date(),
  attachments: z.object({
    bCapWaiverApplication: zAttachmentRequired({ min: 1 }),
    bCapCostSpreadsheets: zAttachmentRequired({ min: 1 }),
    tribalConsultation: zAttachmentOptional,
    other: zAttachmentOptional,
  }),
  additionalInformation: zAdditionalInfoOptional,
  seaActionType: z.string().default("Amend"),
});
type Waiver1915BCapitatedAmendment = z.infer<typeof formSchema>;

// const attachmentList = [
//   {
//     name: "bCapWaiverApplication",
//     label: "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
//     required: true,
//   },
//   {
//     name: "bCapCostSpreadsheets",
//     label:
//       "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
//     required: true,
//   },
//   {
//     name: "tribalConsultation",
//     label: "Tribal Consultation",
//     required: false,
//   },
//   {
//     name: "other",
//     label: "Other",
//     required: false,
//   },
// ] as const;

export const Capitated1915BWaiverAmendmentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useGetUser();

  const handleSubmit: SubmitHandler<Waiver1915BCapitatedAmendment> = async (
    formData,
  ) => {
    try {
      await submit<Waiver1915BCapitatedAmendment>({
        data: formData,
        endpoint: "/submit",
        user,
        authority: Authority["1915b"],
      });

      const poller = documentPoller(formData.id, (checks) =>
        checks.actionIs("Amend"),
      );
      await poller.startPollingData();

      const originPath = getFormOrigin({ authority: Authority["1915b"] });

      banner({
        header: "Package submitted",
        body: "Your submission has been received.",
        variant: "success",
        pathnameToDisplayOn: originPath.pathname,
      });

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
  };

  const form = useForm<Waiver1915BCapitatedAmendment>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  return (
    <SimplePageContainer>
      <BreadCrumbs options={formCrumbsFromPath(location.pathname)} />
      <Inputs.Form {...form}>
        {form.formState.isSubmitting && <LoadingSpinner />}
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="my-6 space-y-8 mx-auto justify-center flex flex-col"
        >
          <h1 className="text-2xl font-semibold mt-4 mb-2">
            1915(b) Comprehensive (Capitated) Waiver Amendment
          </h1>
          <SectionCard title="1915(b) Waiver Amendment Request Details">
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
                  <Inputs.FormLabel className="font-semibold">
                    Existing Waiver Number to Amend <Inputs.RequiredIndicator />
                  </Inputs.FormLabel>
                  <p className="text-gray-500 font-light">
                    Enter the existing waiver number you are seeking to amend in
                    the format it was approved, using a dash after the two
                    character state abbreviation.
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
                      1915(b) Waiver Amendment Number{" "}
                      <Inputs.RequiredIndicator />
                    </Inputs.FormLabel>
                    <Link
                      to="/faq/waiver-amendment-id-format"
                      target={FAQ_TAB}
                      rel="noopener noreferrer"
                      className="text-blue-900 underline"
                    >
                      What is my 1915(b) Waiver Amendment Number?
                    </Link>
                  </div>
                  <p className="text-gray-500 font-light">
                    The Waiver Number must be in the format of SS-####.R##.## or
                    SS-#####.R##.##. For amendments, the last two digits start
                    with {"'01'"} and ascends.
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
                  <Inputs.FormLabel className="text-lg font-semibold block">
                    Proposed Effective Date of 1915(b) Waiver Amendment{" "}
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
          {/* <SectionCard title="Attachments">
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
          </SectionCard> */}
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
