import { useForm } from "react-hook-form";
import { z } from "zod";
import { opensearch, PlanType } from "shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { SubmissionFormTemplate } from "@/pages/form/template";
import { ModalProvider } from "@/pages/form/modals";
import { BreadCrumbs, SimplePageContainer } from "@/components";
import setupBCapAmendmentWaiver from "@/pages/form/waivers/setups/setupBCapAmendmentWaiver";
import { formCrumbsFromPath } from "@/pages/form/form-breadcrumbs";

const Form = ({ item }: { item?: opensearch.main.ItemResult }) => {
  const { schema, attachments } = setupBCapAmendmentWaiver;
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
      title={"1915(b) Comprehensive (Capitated) Waiver Amendment Details"}
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
      idFieldLabel={"Waiver Amendment Number"}
      idFieldDescription={
        <span>
          The Waiver Number must be in the format of SS-####.R##.## or
          SS-#####.R##.##. For amendments, the last two digits start with ‘01’
          and ascends
        </span>
      }
      idHelpLabel={"What is my 1915(b) Waiver Amendment Number?"}
      idHelpFAQHash={"waiver-amendment-id-format"}
      dateFieldLabel={"Proposed Effective Date of 1915(b) Waiver Amendment"}
      attachments={attachments}
      attachmentFaqLink={"/faq"}
      requireAddlInfo
      addlInfoDescription={
        <p>Add anything else that you would like to share with CMS.</p>
      }
      preSubmitMessage={
        "Once you submit this form, a confirmation email is sent to you and to CMS. CMS will use this content to review your package, and you will not be able to edit this form. If CMS needs any additional information, they will follow up by email."
      }
    />
  );
};

export const BCapAmendmentWaiver = () => (
  <ModalProvider>
    <SimplePageContainer>
      <BreadCrumbs options={formCrumbsFromPath(location.pathname)} />
      <Form />
    </SimplePageContainer>
  </ModalProvider>
);
