import * as I from "@/components/Inputs";

import { zodResolver } from "@hookform/resolvers/zod";
import { opensearch, PlanType } from "shared-types";
import { useActionForm } from "@/hooks/useActionFormController";
import { ActionFormIntro } from "@/pages/actions/common";
import { ActionFormTemplate } from "@/pages/actions/template";
import {
  chipRespondToRaiSetup,
  medicaidRespondToRaiSetup,
} from "@/pages/actions/setups";
import { FC } from "react";

export const RespondToRai: FC<opensearch.main.ItemResult> = (props) => {
  const setup = (() => {
    if (props._source.planType === PlanType.CHIP_SPA)
      return chipRespondToRaiSetup;
    return medicaidRespondToRaiSetup;
  })();

  const form = useActionForm({
    resolver: zodResolver(setup.schema),
    item: props,
  });

  return (
    <ActionFormTemplate
      item={props}
      form={form}
      intro={
        <ActionFormIntro title={`${props._source.planType} Formal RAI Details`}>
          <I.RequiredIndicator /> Indicates a required field
          <p className="font-light mb-6 max-w-4xl">
            Once you submit this form, a confirmation email is sent to you and
            to CMS. CMS will use this content to review your package, and you
            will not be able to edit this form. If CMS needs any additional
            information, they will follow up by email.{" "}
            <strong className="bold">
              If you leave this page, you will lose your progress on this form.
            </strong>
          </p>
        </ActionFormIntro>
      }
      attachments={setup.attachments}
      attachmentFaqLink={"/faq/#medicaid-spa-rai-attachments"}
      addlInfoInstructions={
        <p>Add anything else that you would like to share with CMS.</p>
      }
    />
  );
};
