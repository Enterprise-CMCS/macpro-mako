import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlanType } from "shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { SubmissionFormTemplate } from "@/pages/form/template";
import setupB4InitialWaiver from "@/pages/form/waivers/setups/setupB4InitialWaiver";
import { ModalProvider } from "@/pages/form/modals";
import { SimplePageContainer } from "@/components";

const Form = () => {
  const { schema, attachments } = setupB4InitialWaiver;
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
      addlInfoInstructions={<></>}
    />
  );
};

export const B4InitialWaiver = () => (
  <ModalProvider>
    <SimplePageContainer>
      <Form />
    </SimplePageContainer>
  </ModalProvider>
);
