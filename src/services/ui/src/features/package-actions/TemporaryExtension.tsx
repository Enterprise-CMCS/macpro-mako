import {
  Alert,
  FAQ_TAB,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Link,
  RequiredIndicator,
} from "@/components";
import * as SC from "@/features/package-actions/shared-components";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { Info } from "lucide-react";
import { getUser } from "@/api/useGetUser";
import { Authority } from "shared-types";
import { unflatten } from "flat";
import { zAttachmentOptional, zAttachmentRequired } from "@/utils";
import { submit } from "@/api/submissionService";
import { useFormContext } from "react-hook-form";

type Attachments = keyof z.infer<typeof tempExtensionSchema>["attachments"];
export const tempExtensionSchema = z.object({
  id: z.string(),
  teType: z.string(),
  originalWaiverNumber: z.string(),
  teRequestNumber: z.string(),
  additionalInformation: z.string(),
  attachments: z.object({
    waiverExtensionRequest: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});

export const onValidSubmission: SC.ActionFunction = async ({
  request,
  params,
}) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = tempExtensionSchema.parse(unflattenedFormData);

    const user = await getUser();
    const authority = Authority["1915b"];
    await submit({
      data: { ...data, id: params.id },
      endpoint: "/action/issue-rai",
      user,
      authority,
    });

    return {
      submitted: true,
    };
  } catch (err) {
    console.log(err);
    return { submitted: false };
  }
};

export const TemporaryExtension = () => {
  const { handleSubmit } = SC.useSubmitForm();
  const { id } = useParams();

  SC.useDisplaySubmissionAlert(
    "Temporary Extension issued",
    `The Extension for ${id} has been submitted. An email confirmation will be sent to you and the state.`
  );

  return (
    <>
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
        <TEPackageSection teType="1915(b)" id={id} />
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
              required: true,
            },
          ]}
        />
        <SC.AdditionalInformation helperText="Add anything else that you would like to share with CMS" />
        <AdditionalFormInformation />
        <SC.FormLoadingSpinner />
        <SC.ErrorBanner />
        <SC.SubmissionButtons />
      </form>
    </>
  );
};

/**
Private Components for IssueRai
**/

const AdditionalFormInformation = () => {
  return (
    <Alert variant={"infoBlock"} className="space-x-2 mb-8">
      <Info />
      <p>
        Once you submit this form, a confirmation email is sent to you and to
        CMS. CMS will use this content to review your package, and you will not
        be able to edit this form. If CMS needs any additional information, they
        will follow up by email. If you leave this page, you will lose your
        progress on this form.
      </p>
    </Alert>
  );
};

const TERequestNumberInput = () => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="teRequestNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <strong className="font-bold">
              Temporary Extension Request Number
              <RequiredIndicator />
            </strong>
            <Link
              className="text-blue-600 cursor-pointer hover:underline px-4"
              path="/faq"
              target={FAQ_TAB}
            >
              What is my Temporary Extension Request Number
            </Link>
          </FormLabel>
          <FormDescription className="max-w-md">
            Must be a waiver extension request number with the format
            SS-####.R##.TE## or SS-#####.R##.TE##
          </FormDescription>
          <FormControl>
            <Input {...field} className="max-w-md" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const TEPackageSection = ({
  teType,
  id,
}: {
  teType: "1915(b)" | "1915(c)";
  id: string | undefined;
}) => {
  const type = id?.split(".")[1]?.includes("00") ? "Initial" : "Renewal";
  const { setValue } = useFormContext<z.infer<typeof tempExtensionSchema>>();

  if (id) {
    setValue("originalWaiverNumber", id);
    setValue("teType", teType);
  }

  return (
    <section className="flex flex-col my-8 space-y-8">
      {/* If ID exists show these */}
      {id && (
        <>
          <div>
            <p>Temporary Extension Type</p>
            <p className="text-xl">{teType}</p>
          </div>

          <div>
            <p>Approved Initial or Renewal Waiver Number</p>
            <p className="text-xl">{id}</p>
          </div>
          <TERequestNumberInput />
          <div>
            <p>Type</p>
            <p className="text-xl">
              {teType} Waiver {type}
            </p>
          </div>
        </>
      )}
      {/* Otherwise collect the following fields */}
      {/* Set the fields that are required by default when they don't need to be collected */}
    </section>
  );
};
