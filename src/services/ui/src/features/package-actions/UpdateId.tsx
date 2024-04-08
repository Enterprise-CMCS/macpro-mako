import { Alert, FormField } from "@/components";
import { useParams } from "react-router-dom";
import * as SC from "@/features/package-actions/shared-components";
import { z } from "zod";
import { Info } from "lucide-react";
import { getUser } from "@/api/useGetUser";
import { Authority } from "shared-types";
import { unflatten } from "flat";
import { submit } from "@/api/submissionService";
import * as Inputs from "@/components/Inputs";
import { useFormContext } from "react-hook-form";
import { zUpdateIdSchema } from "@/utils/zod";
import { SlotAdditionalInfo } from "@/features";

export const updateIdSchema = z
  .object({
    id: z.string(),
    additionalInformation: z.string().refine((data) => data.trim().length > 0, {
      message: "Additional information cannot be empty or just spaces.",
    }),
    newId: zUpdateIdSchema,
  })
  .superRefine((data, ctx) => {
    if (data.id.split("-")[0] !== data.newId.split("-")[0]) {
      ctx.addIssue({
        message: "New IDs must have the same state code as the old ID.",
        code: z.ZodIssueCode.custom,
        fatal: true,
        path: ["newId"],
      });
    }
    return z.NEVER;
  });

export const onValidSubmission: SC.ActionFunction = async ({
  request,
  params,
}) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = await updateIdSchema.parseAsync(unflattenedFormData);

    const user = await getUser();
    await submit({
      data: { ...data, id: params.id },
      endpoint: "/action/update-id",
      user,
      authority: params.authority as Authority,
    });

    return {
      submitted: true,
    };
  } catch (err) {
    console.log(err);
    return {
      submitted: false,
    };
  }
};

export const UpdateId = () => {
  const { handleSubmit, formMethods } = SC.useSubmitForm();
  const { id } = useParams() as { id: string; authority: Authority };
  const { setValue } = useFormContext<z.infer<typeof updateIdSchema>>();
  setValue("id", id);
  const form = useFormContext();
  SC.useDisplaySubmissionAlert(
    "ID Update submitted",
    `The ID Update for ${id} has been submitted.`,
  );

  return (
    <>
      <SC.Heading title={"Update ID"} />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        Once you submit this form, the ID of the existing package will be
        updated in SEATool and OneMAC.{" "}
        <strong>
          If you leave this page, you will lose your progress on this form.
        </strong>
      </SC.ActionDescription>
      <SC.PackageSection />
      <form
        className="my-6 space-y-8 mx-auto justify-center flex flex-col"
        onSubmit={handleSubmit}
      >
        <Inputs.FormField
          control={form.control}
          name="newId"
          render={({ field }) => (
            <Inputs.FormItem>
              <div className="flex gap-4">
                <Inputs.FormLabel className="font-semibold">
                  New ID <Inputs.RequiredIndicator />
                </Inputs.FormLabel>
              </div>
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
        <FormField
          control={formMethods.control}
          name={"additionalInformation"}
          render={SlotAdditionalInfo({
            required: true,
            label: <p>Please explain the reason for updating this ID.</p>,
          })}
        />
        <AdditionalFormInformation />
        <SC.FormLoadingSpinner />
        <SC.ErrorBanner />
        <SC.SubmissionButtons />
      </form>
    </>
  );
};

/**
Private Components for UpdateID
**/

const AdditionalFormInformation = () => {
  return (
    <Alert variant={"infoBlock"} className="space-x-2 mb-8">
      <Info />
      <p>
        Once you submit this form, the ID of the existing package will be
        updated in SEATool and OneMAC.
      </p>
    </Alert>
  );
};
