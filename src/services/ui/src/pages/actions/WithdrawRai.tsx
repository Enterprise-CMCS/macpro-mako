import * as I from "@/components/Inputs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { opensearch, PlanType } from "shared-types";
import { ActionFormTemplate } from "@/pages/actions/template";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { ActionFormIntro } from "@/pages/actions/common";
import { FormSetup } from "@/pages/actions/setups";

export const WithdrawRai = ({
  item,
  schema,
  attachments,
}: FormSetup & { item: opensearch.main.ItemResult }) => {
  // const [areYouSureModalOpen, setAreYouSureModalOpen] = useState(false);
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
        <ActionFormIntro title={"Withdraw Formal RAI Response Details"}>
          <I.RequiredIndicator /> Indicates a required field
          <p className="font-light mb-6 max-w-4xl">
            Complete this form to withdraw the Formal RAI response. Once
            complete, you and CMS will receive an email confirmation.
          </p>
        </ActionFormIntro>
      }
      attachments={attachments}
      attachmentFaqLink={"/faq/#medicaid-spa-rai-attachments"}
      requireAddlInfo
      addlInfoInstructions={<p>Explain your need for withdrawal.</p>}
    />
  );
};
