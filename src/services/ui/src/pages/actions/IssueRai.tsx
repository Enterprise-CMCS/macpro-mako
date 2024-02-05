import { Path, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { opensearch, PlanType } from "shared-types";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { FormSetup } from "@/pages/actions/setups";
import {
  Button,
  Form,
  FormField,
  FormMessage,
  RequiredIndicator,
} from "@/components/Inputs";
import { Alert, LoadingSpinner } from "@/components";
import { ActionFormIntro, PackageInfo } from "@/pages/actions/common";
import { AttachmentsSizeTypesDesc } from "@/pages/form/content";
import {
  SlotAdditionalInfo,
  SlotAttachments,
} from "@/pages/actions/renderSlots";
import { Info } from "lucide-react";
import { useModalContext } from "@/pages/form/modals";

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
  const { setCancelModalOpen } = useModalContext();
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {form.formState.isSubmitting && <LoadingSpinner />}
        {/* Intro */}
        <ActionFormIntro title={"Formal RAI Details"}>
          <RequiredIndicator /> Indicates a required field
          <p className="font-light mb-6 max-w-4xl">
            Issuance of a Formal RAI in OneMAC will create a Formal RAI email
            sent to the State. This will also create a section in the package
            details summary for you and the State to have record. Please attach
            the Formal RAI Letter along with any additional information or
            comments in the provided text box. Once you submit this form, a
            confirmation email is sent to you and to the State.
            <strong className="bold">
              If you leave this page, you will lose your progress on this form.
            </strong>
          </p>
        </ActionFormIntro>
        {/* Package ID and type info */}
        <PackageInfo item={item} />
        {/* Attachments */}
        <h3 className="font-bold text-2xl font-sans">Attachments</h3>
        <AttachmentsSizeTypesDesc
          faqLink={"/faq/#medicaid-spa-rai-attachments"}
        />
        {attachments.map(({ name, label, required }) => (
          <FormField
            key={String(name)}
            control={form.control}
            name={`attachments.${String(name)}` as Path<typeof schema>}
            render={SlotAttachments({
              label: (
                <>
                  {label}
                  {required ? <RequiredIndicator /> : ""}
                </>
              ),
              message: <FormMessage />,
              className: "my-4",
            })}
          />
        ))}
        {/* Additional Info */}
        <FormField
          control={form.control}
          name={"additionalInformation" as Path<typeof schema>}
          render={SlotAdditionalInfo({
            label: (
              <p>
                Add anything else that you would like to share with the State.
              </p>
            ),
            description: "4,000 characters allowed",
            className: "pt-6",
            required: true,
          })}
        />
        {/* Error banner */}
        {Object.keys(form.formState.errors).length !== 0 && (
          <Alert className="my-6" variant="destructive">
            Input validation error(s)
            <ul className="list-disc">
              {Object.values(form.formState.errors).map(
                (err, idx) =>
                  err?.message && (
                    <li className="ml-8 my-2" key={idx}>
                      {err.message as string}
                    </li>
                  )
              )}
            </ul>
          </Alert>
        )}
        {/* Pre-submit message banner */}
        <Alert variant={"infoBlock"} className="my-2 w-full flex-row text-sm">
          <Info />
          <p className="ml-2">
            Once you submit this form, a confirmation email is sent to you and
            to the State.
          </p>
        </Alert>
        {/* Buttons */}
        <div className="flex gap-2 my-8">
          <Button type="submit">Submit</Button>
          <Button
            type="button"
            onClick={() => setCancelModalOpen(true)}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
