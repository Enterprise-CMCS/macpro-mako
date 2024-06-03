import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "react-router-dom";
import {
  BreadCrumbs,
  SimplePageContainer,
  SectionCard,
  FAQ_TAB,
  FAQFooter,
  useAlertContext,
  formCrumbsFromPath,
  useNavigate,
  Route,
  FormField,
} from "@/components";
import * as Content from "@/components/Form/old-content";
import * as Inputs from "@/components/Inputs";
import { useGetUser, submit } from "@/api";
import { Authority } from "shared-types";
import {
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
  zInitialWaiverNumberSchema,
  Origin,
  ORIGIN,
  originRoute,
  useOriginPath,
} from "@/utils";
import { useQuery as useQueryString } from "@/hooks";
import { SlotAdditionalInfo } from "@/features";
import { SubmitAndCancelBtnSection } from "../shared-components";
import { documentPoller } from "@/utils/Poller/documentPoller";

const formSchema = z.object({
  id: zInitialWaiverNumberSchema,
  proposedEffectiveDate: z.date(),
  attachments: z.object({
    b4WaiverApplication: zAttachmentRequired({ min: 1 }),
    tribalConsultation: zAttachmentOptional,
    other: zAttachmentOptional,
  }),
  additionalInformation: zAdditionalInfo.optional(),
  seaActionType: z.string().default("New"),
});
type Waiver1915BContractingInitial = z.infer<typeof formSchema>;

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

export const Contracting1915BWaiverInitialPage = () => {
  const location = useLocation();
  const { data: user } = useGetUser();
  const navigate = useNavigate();
  const urlQuery = useQueryString();
  const alert = useAlertContext();
  const originPath = useOriginPath();

  const handleSubmit: SubmitHandler<Waiver1915BContractingInitial> = async (
    formData,
  ) => {
    try {
      await submit<Waiver1915BContractingInitial>({
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

      const poller = documentPoller(formData.id, (checks) =>
        checks.actionIs("New"),
      );

      await poller.startPollingData();

      navigate(
        originPath
          ? { path: `${originPath}?tab=waivers` as Route }
          : { path: "/dashboard?tab=waivers" as Route },
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

  const form = useForm<Waiver1915BContractingInitial>({
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
            1915(b)(4) FFS Selective Contracting Initial Waiver
          </h1>
          <SectionCard title="Initial Waiver Details">
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
              name="id"
              render={({ field }) => (
                <Inputs.FormItem>
                  <div className="flex gap-4">
                    <Inputs.FormLabel className="text-lg font-semibold mr-1">
                      Initial Waiver Number <Inputs.RequiredIndicator />
                    </Inputs.FormLabel>
                    <Link
                      to={"/faq/initial-waiver-id-format"}
                      target={FAQ_TAB}
                      rel="noopener noreferrer"
                      className="text-blue-900 underline"
                    >
                      What is my Initial Waiver Number?
                    </Link>
                  </div>
                  <p
                    className="text-gray-500 font-light"
                    id="waiver-number-format"
                  >
                    Must be a new initial number with the format SS-####.R00.00
                    or SS-#####.R00.00
                  </p>
                  <Inputs.FormControl className="max-w-sm">
                    <Inputs.Input
                      {...field}
                      aria-describedby="waiver-number-format"
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
                    Proposed Effective Date of 1915(b) Initial Waiver{" "}
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
                      {label} {required ? <Inputs.RequiredIndicator /> : null}
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
