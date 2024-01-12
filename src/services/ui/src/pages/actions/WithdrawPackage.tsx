import { Navigate } from "@/components/Routing";
import { PlanType, opensearch } from "shared-types";
import { ActionFormIntro } from "./common";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { ActionFormTemplate } from "@/pages/actions/template";
import { FormSetup } from "@/pages/actions/setups";

export const WithdrawPackage = ({
  item,
  schema,
  attachments,
}: FormSetup & {
  item: opensearch.main.ItemResult;
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const handleSubmit = useActionSubmitHandler({
    formHookReturn: form,
    authority: item?._source.authority as PlanType,
    addDataConditions: [
      (data) => {
        if (
          !data.attachments.supportingDocumentation &&
          !data.additionalInformation
        ) {
          return {
            message: "An Attachment or Additional Information is required.",
          };
        } else {
          return null;
        }
      },
    ],
  });

  if (!item) return <Navigate path={"/"} />; // Prevents optionals below
  return (
    <ActionFormTemplate<z.infer<typeof schema>>
      item={item}
      formController={form}
      submitHandler={handleSubmit}
      intro={
        <ActionFormIntro title={`Withdraw ${item._source.planType} Package`}>
          <p>
            Complete this form to withdraw a package. Once complete, you will
            not be able to resubmit this package. CMS will be notified and will
            use this content to review your request. If CMS needs any additional
            information, they will follow up by email.
          </p>
        </ActionFormIntro>
      }
      attachments={attachments}
      attachmentFaqLink={"/faq"}
      attachmentInstructions={
        <p className="font-normal mb-4">
          Official withdrawal letters are required and must be on state
          letterhead signed by the State Medicaid Director or CHIP Director.
        </p>
      }
    />
  );
};
