import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { opensearch, Authority } from "shared-types";
import { ActionFormTemplate } from "@/pages/actions/template";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { FormSetup } from "@/pages/actions/setups";

const preSubmitMessage =
  "Once complete, you and CMS will receive an email confirmation.";
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
    authority: item?._source.authority as Authority,
  });

  return (
    <ActionFormTemplate<z.infer<typeof schema>>
      item={item}
      formController={form}
      submitHandler={handleSubmit}
      title={"Withdraw Formal RAI Response Details"}
      description={
        <p className="font-light mb-6 max-w-4xl">
          Complete this form to withdraw the Formal RAI response.{" "}
          {preSubmitMessage}
        </p>
      }
      preSubmitMessage={preSubmitMessage}
      attachments={attachments}
      attachmentFaqLink={"/faq/#medicaid-spa-rai-attachments"}
      requireAddlInfo
      addlInfoInstructions={<p>Explain your need for withdrawal.</p>}
    />
  );
};
