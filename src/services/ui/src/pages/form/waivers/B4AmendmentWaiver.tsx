import { useForm } from "react-hook-form";
import { z } from "zod";
import { opensearch, PlanType } from "shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { SubmissionFormTemplate } from "@/pages/form/template";
import { ModalProvider } from "@/pages/form/modals";
import { SimplePageContainer } from "@/components";
import setupB4AmendmentWaiver from "@/pages/form/setups/setupB4AmendmentWaiver";

const Form = ({ item }: { item?: opensearch.main.ItemResult }) => {
  const { schema, attachments } = setupB4AmendmentWaiver;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const handleSubmit = useActionSubmitHandler<z.infer<typeof schema>>({
    formHookReturn: form,
    authority: "" as PlanType,
  });

  return (
    <SubmissionFormTemplate<z.infer<typeof schema>>
      formController={form}
      submitHandler={handleSubmit}
      title={"Formal RAI Details"}
      description={<p className="font-light mb-6 max-w-4xl"></p>}
      preSubmitMessage={""}
      attachments={attachments}
      attachmentFaqLink={"/faq"}
      requireAddlInfo
      addlInfoInstructions={<></>}
    />
  );
};

export const B4AmendmentWaiver = () => (
  <ModalProvider>
    <SimplePageContainer>
      <Form />
    </SimplePageContainer>
  </ModalProvider>
);
