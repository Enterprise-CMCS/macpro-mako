import {
  Alert,
  BreadCrumbs,
  FAQ_TAB,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RequiredIndicator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimplePageContainer,
  useLocationCrumbs,
} from "@/components";
import * as SC from "@/features/package-actions/shared-components";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { Info } from "lucide-react";
import { getUser } from "@/api/useGetUser";
import { Authority } from "shared-types";
import { unflatten } from "flat";
import {
  zAttachmentOptional,
  zAttachmentRequired,
  zExtensionOriginalWaiverNumberSchema,
  zExtensionWaiverNumberSchema,
} from "@/utils";
import { submit } from "@/api/submissionService";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type Attachments = keyof z.infer<typeof tempExtensionSchema>["attachments"];
export const tempExtensionSchema = z.object({
  id: zExtensionWaiverNumberSchema,
  authority: z.string(), //aka tetype
  seaActionType: z.string().default("Extend"),
  originalWaiverNumber: zExtensionOriginalWaiverNumberSchema,
  additionalInformation: z.string().optional().default(""),
  attachments: z.object({
    waiverExtensionRequest: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});

export const onValidSubmission: SC.ActionFunction = async ({ request }) => {
  try {
    const formData = Object.fromEntries(await request.formData());
    const unflattenedFormData = unflatten(formData);
    const data = await tempExtensionSchema.parseAsync(unflattenedFormData);

    const user = await getUser();

    await submit({
      data,
      endpoint: "/submit",
      user,
      authority: data.authority as Authority,
    });

    return {
      submitted: true,
    };
  } catch (err) {
    console.log(err);
    return { submitted: false };
  }
};

export const TempExtensionWrapper = () => {
  const methods = useForm({
    resolver: zodResolver(tempExtensionSchema),
  });
  const crumbs = useLocationCrumbs();

  return (
    <FormProvider {...methods}>
      <SimplePageContainer>
        <BreadCrumbs options={crumbs} />
      </SimplePageContainer>
      <TemporaryExtension />
    </FormProvider>
  );
};

export const TemporaryExtension = () => {
  const { handleSubmit, formMethods } = SC.useSubmitForm();
  const { id: urlId, authority: urlAuthority } = useParams();
  const formId = formMethods.getValues("originalWaiverNumber");
  const formAuthority = formMethods.getValues("authority");
  const authority = urlAuthority ? urlAuthority : formAuthority;

  const parentId = urlId ? urlId : formId;
  SC.useDisplaySubmissionAlert(
    "Temporary Extension issued",
    `The Temporary Extension Request for ${parentId} has been submitted.`
  );

  return (
    <SimplePageContainer>
      <SC.Heading title="Temporary Extension Request Details" />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        Once you submit this form, a confirmation email is sent to you and to
        CMS. CMS will use this content to review your package, and you will not
        be able to edit this form. If CMS needs any additional information, they
        will follow up by email.{" "}
        <strong className="font-bold">
          If you leave this page, you will lose your progress on this form.
        </strong>
      </SC.ActionDescription>
      <form onSubmit={handleSubmit}>
        <TEPackageSection authority={authority} id={urlId} />
        <SC.AttachmentsSection<Attachments>
          attachments={[
            {
              registerName: "waiverExtensionRequest",
              name: "Waiver Extension Request",
              required: true,
            },
            {
              registerName: "other",
              name: "Other",
              required: false,
            },
          ]}
        />
        <SC.AdditionalInformation
          required={false}
          helperText="Add anything else that you would like to share with CMS"
        />
        <AdditionalFormInformation />
        <SC.FormLoadingSpinner />
        <SC.ErrorBanner />
        <SC.SubmissionButtons />
      </form>
    </SimplePageContainer>
  );
};

/**
Private Components for Temporary Extension
**/

const TEPackageSection = ({
  authority,
  id,
}: {
  authority?: "1915(b)" | "1915(c)";
  id?: string;
}) => {
  const type = id?.split(".")[1]?.includes("00") ? "Initial" : "Renewal";
  const { setValue } = useFormContext<z.infer<typeof tempExtensionSchema>>();

  if (id && authority) {
    setValue("originalWaiverNumber", id);
    setValue("authority", authority);
  }

  return (
    <section className="flex flex-col my-8 space-y-8">
      {/* If ID exists show these */}
      {id && (
        <>
          <div>
            <p>Temporary Extension Type</p>
            <p className="text-xl">{authority}</p>
          </div>

          <div>
            <p>Approved Initial or Renewal Waiver Number</p>
            <p className="text-xl">{id}</p>
          </div>
          <IdInput />
          <div>
            <p>Type</p>
            <p className="text-xl">
              {authority} Waiver {type}
            </p>
          </div>
        </>
      )}
      {/* Otherwise collect the following fields */}
      {/* Set the fields that are required by default when they don't need to be collected */}
      {!id && (
        <>
          <TempExtensionTypeDropDown />
          <TempExtensionApproveOrRenewNumber />
          <IdInput />
        </>
      )}
    </section>
  );
};
const AdditionalFormInformation = () => {
  return (
    <Alert variant={"infoBlock"} className="space-x-2 mb-8">
      <Info />
      <p>
        Once you submit this form, a confirmation email is sent to you and to
        CMS. CMS will use this content to review your package, and you will not
        be able to edit this form. If CMS needs any additional information, they
        will follow up by email.
      </p>
    </Alert>
  );
};

const IdInput = () => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <strong className="font-bold">
              Temporary Extension Request Number
              <RequiredIndicator />
            </strong>
            <Link
              className="text-blue-600 cursor-pointer hover:underline px-4"
              to={"/faq/waiver-extension-id-format"}
              target={FAQ_TAB}
              rel="noopener noreferrer"
            >
              What is my Temporary Extension Request Number
            </Link>
          </FormLabel>
          <FormDescription className="max-w-md">
            Must use a waiver extension request number with the format
            SS-####.R##.TE## or SS-#####.R##.TE##
          </FormDescription>
          <FormControl>
            <Input
              {...field}
              className="max-w-md"
              onInput={(e) => {
                if (e.target instanceof HTMLInputElement) {
                  e.target.value = e.target.value.toUpperCase();
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const TempExtensionTypeDropDown = () => {
  const { control } = useFormContext<z.infer<typeof tempExtensionSchema>>();

  return (
    <FormField
      name="authority"
      control={control}
      render={({ field }) => (
        <FormItem className="max-w-xs">
          <FormLabel>
            <strong className="font-bold">Temporary Extension Type</strong>{" "}
            <RequiredIndicator />
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="-- select a temporary extension type --" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="1915(b)">1915(b)</SelectItem>
              <SelectItem value="1915(c)">1915(c)</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const TempExtensionApproveOrRenewNumber = () => {
  const { control } = useFormContext<z.infer<typeof tempExtensionSchema>>();

  return (
    <FormField
      name="originalWaiverNumber"
      control={control}
      render={({ field }) => (
        <FormItem className="max-w-md">
          <FormLabel>
            <strong className="font-bold">
              Approved Initial or Renewal Waiver Number
            </strong>{" "}
            <RequiredIndicator />
          </FormLabel>
          <FormDescription>
            Enter the existing waiver number in the format it was approved,
            using a dash after the two character state abbreviation.
          </FormDescription>
          <FormControl>
            <Input
              {...field}
              onInput={(e) => {
                if (e.target instanceof HTMLInputElement) {
                  e.target.value = e.target.value.toUpperCase();
                }
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
