import * as I from "@/components/Inputs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opensearch, PlanType } from "shared-types";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { ActionFormIntro } from "@/pages/actions/common";
import { ActionFormTemplate } from "@/pages/actions/template";
import { FormSetup } from "@/pages/actions/setups";

export const RespondToRai = ({
  item,
  schema,
  attachments,
}: FormSetup & {
  item: opensearch.main.ItemResult;
}) => {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const handleSubmit = useActionSubmitHandler({
    formHookReturn: form,
    authority: item?._source.authority as PlanType,
  });

  return (
    <ActionFormTemplate
      item={item}
      formController={form}
      submitHandler={handleSubmit}
      intro={
        <ActionFormIntro title={"Formal RAI Details"}>
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
      attachments={attachments}
      attachmentFaqLink={"/faq/#medicaid-spa-rai-attachments"}
    />
  );
};
