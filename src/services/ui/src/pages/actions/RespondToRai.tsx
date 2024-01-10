import * as I from "@/components/Inputs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { opensearch, PlanType } from "shared-types";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { ActionFormIntro } from "@/pages/actions/common";
import { ActionFormTemplate } from "@/pages/actions/template";

const formSchema = z.object({
  additionalInformation: z.string().max(4000).optional(),
  attachments: z.object({
    raiResponseLetter: z
      .array(z.instanceof(File))
      .refine((value) => value.length > 0, {
        message: "Required",
      }),
    other: z.array(z.instanceof(File)).optional(),
  }),
});

export const RespondToRai = ({
  item,
}: {
  item: opensearch.main.ItemResult;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const handleSubmit = useActionSubmitHandler<z.infer<typeof formSchema>>({
    formHookReturn: form,
    authority: item?._source.authority as PlanType,
  });

  return (
    <ActionFormTemplate<z.infer<typeof formSchema>>
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
      attachments={[
        {
          name: "raiResponseLetter",
          label: "RAI Response Letter",
          required: true,
        },
        {
          name: "other",
          label: "Other",
          required: false,
        },
      ]}
      attachmentFaqLink={"/faq/#medicaid-spa-rai-attachments"}
    />
  );
};
