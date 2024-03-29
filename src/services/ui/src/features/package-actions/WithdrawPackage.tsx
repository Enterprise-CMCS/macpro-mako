import { submit, getUser } from "@/api";
import { Alert, useModalContext } from "@/components";
import * as SC from "@/features/package-actions/shared-components";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { zAttachmentOptional } from "@/utils";
import { unflatten } from "flat";
import { Info } from "lucide-react";
import { useActionData, useParams } from "react-router-dom";
import { Authority, SEATOOL_STATUS } from "shared-types";
import { z } from "zod";

const title: Record<Authority, string> = {
  "1915(b)": "Withdraw Waiver",
  "1915(c)": "Withdraw Waiver",
  "chip spa": "Withdraw CHIP SPA Package",
  "medicaid spa": "Withdraw Medicaid SPA Package",
  waiver: "Withdraw Waiver",
};
const descriptionText: Record<Authority, string> = {
  "1915(b)": "this 1915(b) Waiver",
  "1915(c)": "this 1915(c) Waiver",
  "chip spa": "",
  "medicaid spa": "",
  waiver: "this Waiver",
};

export const withdrawPackageSchema = z
  .object({
    additionalInformation: z.string().optional().default(""),
    attachments: z
      .object({
        supportingDocumentation: zAttachmentOptional,
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      !data.attachments?.supportingDocumentation?.length &&
      data.additionalInformation.length === 0
    ) {
      ctx.addIssue({
        message: "An Attachment or Additional Information is required.",
        code: z.ZodIssueCode.custom,
        fatal: true,
      });
      // Zod says this is to appease types
      // https://github.com/colinhacks/zod?tab=readme-ov-file#type-refinements
      return z.NEVER;
    }
  });
type Attachments = keyof NonNullable<
  z.infer<typeof withdrawPackageSchema>["attachments"]
>;

export const onValidSubmission: SC.ActionFunction = async ({
  request,
  params,
}) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = withdrawPackageSchema.parse(unflattenedFormData);
    const user = await getUser();
    const authority = Authority["1915b"];

    await submit({
      data: { ...data, id: params.id },
      endpoint: "/action/withdraw-package",
      user,
      authority,
    });

    return { submitted: true };
  } catch (err) {
    console.log(err);
    return { submitted: false };
  }
};

export const WithdrawPackage = () => {
  const modal = useModalContext();
  const { handleSubmit } = SC.useSubmitForm();
  const { id, authority } = useParams() as { id: string; authority: Authority };

  SC.useDisplaySubmissionAlert(
    "Package withdrawn",
    `The package ${id} has been withdrawn.`,
    (data) => {
      return data._source.seatoolStatus === SEATOOL_STATUS.WITHDRAWN;
    },
    id,
  );

  return (
    <>
      <SC.Heading title={title[authority]} />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        Complete this form to withdraw {descriptionText[authority]} package.
        Once complete, you will not be able to resubmit this package. CMS will
        be notified and will use this content to review your request. If CMS
        needs any additional information, they will follow up by email.
      </SC.ActionDescription>
      <SC.PackageSection />
      <form onSubmit={handleSubmit}>
        <SC.AttachmentsSection<Attachments>
          supportingInformation="Upload your supporting documentation for withdrawal or explain your need for withdrawal in the Additional Information box."
          attachments={[
            {
              name: "Supporting Documentation",
              registerName: "supportingDocumentation",
              required: false,
            },
          ]}
        />
        <SC.AdditionalInformation helperText="Explain your need for withdrawal or upload supporting documentation." />
        <SC.FormLoadingSpinner />
        <SC.ErrorBanner />
        <AdditionalFormInformation />
        <SC.SubmissionButtons
          onSubmit={() => {
            const acceptAction = () => {
              modal.setModalOpen(false);
              handleSubmit();
            };

            modal.setContent({
              header: "Withdraw Package?",
              body: `The package ${id} will be withdrawn.`,
              acceptButtonText: "Yes, withdraw package",
              cancelButtonText: "Return to form",
            });

            modal.setOnAccept(() => acceptAction);

            modal.setModalOpen(true);
          }}
        />
      </form>
    </>
  );
};

const AdditionalFormInformation = () => {
  const { authority } = useParams() as { id: string; authority: Authority };
  return (
    <Alert variant={"infoBlock"} className="space-x-2 mb-8">
      <Info />
      <p>
        Complete this form to withdraw {descriptionText[authority]} package.
        Once complete, you will not be able to resubmit this package. CMS will
        be notified and will use this content to review your request. If CMS
        needs any additional information, they will follow up by email.
      </p>
    </Alert>
  );
};
