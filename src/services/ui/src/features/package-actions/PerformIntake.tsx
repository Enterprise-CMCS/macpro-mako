import { Alert, useParams } from "@/components";
import * as SC from "@/features/package-actions/shared-components";
import { z } from "zod";
import { Info } from "lucide-react";
import { getUser } from "@/api/useGetUser";
import { Authority, SEATOOL_AUTHORITIES_MAP_TO_ID } from "shared-types";
import { unflatten } from "flat";
import { submit } from "@/api/submissionService";
import * as Inputs from "@/components/Inputs";
import { useFormContext } from "react-hook-form";
import {
  CPOCSelect,
  DescriptionInput,
  SubTypeSelect,
  SubjectInput,
  TypeSelect,
} from "../submission/shared-components";

export const performIntakeSchema = z.object({
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
  typeIds: z.array(z.number()).min(1, { message: "Required" }),
  subTypeIds: z.array(z.number()).min(1, { message: "Required" }),
  cpoc: z.string().min(1, { message: "CPOC is required" }),
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
  const { id, authority } = useParams("/action/:authority/:id/:type");
  const form = useFormContext();
  SC.useDisplaySubmissionAlert(
    "Intake Complete",
    `The Intake for ${id} has been completed.`,
  );

  const authorityId = SEATOOL_AUTHORITIES_MAP_TO_ID[authority];
  console.log(authorityId);

  return (
    <>
      <SC.Heading title={"Perform Intake"} />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        <p>
          Once you submit this form, the supplied information will be writted to
          SEATool, and intake for the record will be complete.
        </p>
        <strong>
          If you leave this page, you will lose your progress on this form.
        </strong>
      </SC.ActionDescription>
      <SC.PackageSection />
      <form
        className="my-6 space-y-8 mx-auto justify-center flex flex-col"
        onSubmit={handleSubmit}
      >
        <SubjectInput
          control={form.control}
          name="subject"
          helperText="The title or purpose of the SPA"
        />
        <DescriptionInput
          control={form.control}
          name="description"
          helperText={`A summary of the ${authority}. This should include details about a reduction or increase, the amount of the reduction or increase, Federal Budget impact, and fiscal year. If there is a reduction, indicate if the EPSDT population is or isn’t exempt from the reduction.`}
        />
        <TypeSelect
          control={form.control}
          name="typeIds"
          authorityId={authorityId} // chip authority
        />
        <SubTypeSelect authorityId={authorityId} />
        <CPOCSelect control={form.control} name="cpoc" />
        <SC.FormLoadingSpinner />
        <SC.ErrorBanner />
        <SC.SubmissionButtons />
      </form>
    </>
  );
};
