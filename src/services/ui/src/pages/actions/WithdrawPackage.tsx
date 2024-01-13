import { Navigate } from "@/components/Routing";
import { PlanType, opensearch } from "shared-types";
import { ActionFormIntro } from "./common";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionForm } from "@/hooks/useActionFormController";
import { ActionFormTemplate } from "@/pages/actions/template";
import {
  chipWithdrawPackageSetup,
  medicaidWithdrawPackageSetup,
} from "@/pages/actions/setups";
import { FC } from "react";

export const WithdrawPackage: FC<opensearch.main.ItemResult> = (props) => {
  const setup = (() => {
    if (props._source.planType === PlanType.CHIP_SPA)
      return chipWithdrawPackageSetup;
    return medicaidWithdrawPackageSetup;
  })();

  const form = useActionForm({
    resolver: zodResolver(setup.schema),
    item: props,
    checkConditions: (data) => {
      const errors = [];

      if (
        !data.attachments.supportingDocumentation &&
        !data.additionalInformation
      ) {
        errors.push("An Attachment or Additional Information is required.");
      }

      return errors.length ? errors : null;
    },
  });

  if (!props) return <Navigate path={"/"} />; // Prevents optionals below
  return (
    <ActionFormTemplate
      item={props}
      form={form}
      intro={
        <ActionFormIntro title={`Withdraw ${props._source.planType} Package`}>
          <p>
            Complete this form to withdraw a package. Once complete, you will
            not be able to resubmit this package. CMS will be notified and will
            use this content to review your request. If CMS needs any additional
            information, they will follow up by email.
          </p>
        </ActionFormIntro>
      }
      attachments={setup.attachments}
      attachmentFaqLink={"/faq"}
      attachmentInstructions={
        <p className="font-normal mb-4">
          Official withdrawal letters are required and must be on state
          letterhead signed by the State Medicaid Director or CHIP Director.
        </p>
      }
      addlInfoInstructions={
        <p>
          Explain your need for withdrawal, or upload supporting documentation.
          <br />
          <em>
            Once you submit this form, a confirmation email is sent to you and
            to CMS. CMS will use this content to review your package. If CMS
            needs any additional information, they will follow up by email
          </em>
          .
        </p>
      }
    />
  );
};
