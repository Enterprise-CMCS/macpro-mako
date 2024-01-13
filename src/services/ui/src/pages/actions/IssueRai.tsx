import * as I from "@/components/Inputs";
import { zodResolver } from "@hookform/resolvers/zod";
import { opensearch } from "shared-types";
import { ActionFormTemplate } from "@/pages/actions/template";
import { useActionForm } from "@/hooks/useActionFormController";
import { ActionFormIntro } from "@/pages/actions/common";
import { defaultIssueRaiSetup } from "@/pages/actions/setups";
import { FC } from "react";

export const RaiIssue: FC<opensearch.main.ItemResult> = (props) => {
  const form = useActionForm({
    resolver: zodResolver(defaultIssueRaiSetup.schema),
    item: props,
  });

  return (
    <ActionFormTemplate
      item={props}
      form={form}
      intro={
        <ActionFormIntro title={"Formal RAI Details"}>
          <I.RequiredIndicator /> Indicates a required field
          <p className="font-light mb-6 max-w-4xl">
            Issuance of a Formal RAI in OneMAC will create a Formal RAI email
            sent to the State. This will also create a section in the package
            details summary for you and the State to have record. Please attach
            the Formal RAI Letter along with any additional information or
            comments in the provided text box. Once you submit this form, a
            confirmation email is sent to you and to the State.{" "}
            <strong className="bold">
              If you leave this page, you will lose your progress on this form.
            </strong>
          </p>
        </ActionFormIntro>
      }
      attachments={defaultIssueRaiSetup.attachments}
      attachmentFaqLink={"/faq/#medicaid-spa-rai-attachments"}
      requireAddlInfo
    />
  );
};
