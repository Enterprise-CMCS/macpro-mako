import { Alert } from "@/components";
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

export const performIntakeSchema = z.object({
  type: z.string(), // perhaps an id
  // subtype: z.string(), // perhaps an id
  // subject: z.string(),
  // description: z.string(),
  // cpoc: z.string(), // perhaps an id, but need the index built first
});

export const onValidSubmission: SC.ActionFunction = async ({
  request,
  params,
}) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = await performIntakeSchema.parseAsync(unflattenedFormData);

    const user = await getUser();
    await submit({
      data: { ...data, id: params.id },
      endpoint: "/action/perform-intake",
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

export const PerformIntake = () => {
  const { handleSubmit } = SC.useSubmitForm();
  const { id } = useParams() as { id: string; authority: Authority };
  const form = useFormContext();
  SC.useDisplaySubmissionAlert(
    "Intake Complete",
    `The Intake for ${id} has been completed.`,
  );

  return (
    <>
      <SC.Heading title={"Perform Intake"} />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        Once you submit this form, the supplied information will be writted to
        SEATool, and intake for the record will be complete.{" "}
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
          name="type"
          render={({ field }) => (
            <Inputs.FormItem>
              <div className="flex gap-4">
                <Inputs.FormLabel className="font-semibold">
                  Type <Inputs.RequiredIndicator />
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
        <SC.FormLoadingSpinner />
        <SC.ErrorBanner />
        <SC.SubmissionButtons />
      </form>
    </>
  );
};
