import { useForm } from "react-hook-form";
import { z } from "zod";
import { opensearch, PlanType } from "shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { SubmissionFormTemplate } from "@/pages/form/template";
import { ModalProvider } from "@/pages/form/modals";
import { BreadCrumbs, SimplePageContainer } from "@/components";
import setupB4RenewalWaiver from "@/pages/form/waivers/setups/setupB4RenewalWaiver";
import { formCrumbsFromPath } from "@/pages/form/form-breadcrumbs";

const Form = ({ item }: { item?: opensearch.main.ItemResult }) => {
  const { schema, attachments } = setupB4RenewalWaiver;
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
      title={"1915(b)(4) FFS Selective Contracting Renewal Waiver Details"}
      description={
        <p className="mb-6 max-w-4xl">
          Once you submit this form, a confirmation email is sent to you and to
          CMS. CMS will use this content to review your package, and you will
          not be able to edit this form. If CMS needs any additional
          information, they will follow up by email.{" "}
          <strong>
            If you leave this page, you will lose your progress on this form.
          </strong>
        </p>
      }
      preSubmitMessage={
        "Once you submit this form, a confirmation email is sent to you and to CMS. CMS will use this content to review your package, and you will not be able to edit this form. If CMS needs any additional information, they will follow up by email."
      }
      attachments={attachments}
      attachmentFaqLink={"/faq"}
      requireAddlInfo
      addlInfoInstructions={
        <p>Add anything else that you would like to share with CMS.</p>
      }
    />
  );
};

export const B4RenewalWaiver = () => (
  <ModalProvider>
    <SimplePageContainer>
      <BreadCrumbs options={formCrumbsFromPath(location.pathname)} />
      <Form />
    </SimplePageContainer>
  </ModalProvider>
);
