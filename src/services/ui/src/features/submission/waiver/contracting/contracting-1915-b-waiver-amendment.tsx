import { useCallback } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "react-router-dom";
import {
  Alert,
  BreadCrumbs,
  LoadingSpinner,
  SimplePageContainer,
  SectionCard,
  FAQ_TAB,
  useModalContext,
  useNavigate,
  useAlertContext,
  formCrumbsFromPath,
} from "@/components";
import * as Content from "@/components/Form/content";
import * as Inputs from "@/components/Inputs";
import { useGetUser, submit } from "@/api";
import { Authority } from "shared-types";
import {
  zAdditionalInfo,
  zAmendmentOriginalWaiverNumberSchema,
  zAmendmentWaiverNumberSchema,
  zAttachmentOptional,
  zAttachmentRequired,
  Origin,
  ORIGIN,
  originRoute,
  useOriginPath,
} from "@/utils";
import { useQuery as useQueryString } from "@/hooks";
import {
  AdditionalInfoInput,
  DescriptionInput,
  SubTypeSelect,
  SubjectInput,
} from "@/features";

const formSchema = z.object({
  waiverNumber: zAmendmentOriginalWaiverNumberSchema,
  id: zAmendmentWaiverNumberSchema,
  proposedEffectiveDate: z.date(),
  // TODO: FFF
  // subject: z.string(),
  // description: z.string(),
  // typeId: z.string().default("111"),
  // subTypeId: z.string(),
  attachments: z.object({
    b4WaiverApplication: zAttachmentRequired({ min: 1 }),
    tribalConsultation: zAttachmentOptional,
    other: zAttachmentOptional,
  }),
  additionalInformation: zAdditionalInfo.optional(),
  seaActionType: z.string().default("Amend"),
});

type Waiver1915BContractingAmendment = z.infer<typeof formSchema>;

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

export const Contracting1915BWaiverAmendmentPage = () => {
  const location = useLocation();
  const { data: user } = useGetUser();
  const navigate = useNavigate();
  const urlQuery = useQueryString();
  const alert = useAlertContext();
  const modal = useModalContext();
  const originPath = useOriginPath();
  const cancelOnAccept = useCallback(() => {
    modal.setModalOpen(false);
    navigate(originPath ? { path: originPath } : { path: "/dashboard" });
  }, []);
  const handleSubmit: SubmitHandler<Waiver1915BContractingAmendment> = async (
    formData
  ) => {
    try {
      await submit<Waiver1915BContractingAmendment>({
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
          : "/dashboard"
      );
      navigate(originPath ? { path: originPath } : { path: "/dashboard" });
    } catch (e) {
      console.error(e);
    }
  };

  const form = useForm<Waiver1915BContractingAmendment>({
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
            1915(b)(4) FFS Selective Contracting Waiver Amendment
          </h1>
          <SectionCard title="1915(b) Waiver Amendment Request Details">
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
                      className="text-blue-700 hover:underline"
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
            {/* // TODO: FFF */}
            {/* <SubTypeSelect
              control={form.control}
              typeId={"111"}
              name="subTypeId"
              authorityId={122} // waivers authority
            />

            <SubjectInput control={form.control} name="subject" />
            <DescriptionInput control={form.control} name="description" /> */}
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
                    <Inputs.Upload {...field} />
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
            >
              Cancel
            </Inputs.Button>
          </div>
        </form>
      </Inputs.Form>
    </SimplePageContainer>
  );
};
