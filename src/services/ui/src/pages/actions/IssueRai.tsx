import * as I from "@/components/Inputs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { opensearch, PlanType } from "shared-types";
import { ActionFormTemplate } from "@/pages/actions/template";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { ActionFormIntro } from "@/pages/actions/common";
import { FormSetup } from "@/pages/actions/setups";

export const RaiIssue = ({
  item,
  schema,
  attachments,
}: FormSetup & { item: opensearch.main.ItemResult }) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const handleSubmit = useActionSubmitHandler<z.infer<typeof schema>>({
    formHookReturn: form,
    authority: item?._source.authority as PlanType,
  });

  return (
    <ActionFormTemplate<z.infer<typeof schema>>
      item={item}
      formController={form}
      submitHandler={handleSubmit}
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
      attachments={attachments}
      attachmentFaqLink={"/faq/#medicaid-spa-rai-attachments"}
      requireAddlInfo
      addlInfoInstructions={
        <p>Add anything else that you would like to share with the State.</p>
      }
    />
  );
};
