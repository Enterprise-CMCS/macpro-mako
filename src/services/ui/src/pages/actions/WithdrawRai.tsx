import { zodResolver } from "@hookform/resolvers/zod";
import { Path, useForm } from "react-hook-form";
import { z } from "zod";
import { opensearch, PlanType } from "shared-types";
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
import { useModalContext } from "@/components/Context/modalContext";
import { submit } from "@/api/submissionService";
import { buildActionUrl } from "@/lib";
import { useNavigate, useParams } from "@/components/Routing";
import { useGetUser } from "@/api/useGetUser";
import { useCallback, useState } from "react";

export const WithdrawRai = ({
  item,
  schema,
  attachments,
}: FormSetup & { item: opensearch.main.ItemResult }) => {
  const navigate = useNavigate();
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const { setModalOpen, setContent, setOnAccept } = useModalContext();
  const acceptAction = useCallback(() => {
    setModalOpen(false);
    navigate({ path: "/dashboard" });
  }, []);
  const [confirmed, setConfirmed] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          if (!confirmed) {
            setContent({
              header: "Withdraw RAI response?",
              body: `The RAI response for ${item._source.id} will be withdrawn, and CMS will be notified.`,
              acceptButtonText: "Yes, withdraw response",
              cancelButtonText: "Cancel",
            });
            setModalOpen(true);
          } else {
            try {
              await submit({
                data: { ...data, id: id! },
                endpoint: buildActionUrl(type!),
                user,
                authority: item?._source.authority as PlanType,
              });
              navigate({ path: "/dashboard" });
            } catch (e) {
              console.error(e);
            }
          }
        })}
      >
        {form.formState.isSubmitting && <LoadingSpinner />}
        {/* Intro */}
        <ActionFormIntro title={"Withdraw Formal RAI Response Details"}>
          <RequiredIndicator /> Indicates a required field
          <p className="font-light mb-6 max-w-4xl">
            Complete this form to withdraw the Formal RAI response. Once
            complete, you and CMS will receive an email confirmation.
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
            label: <p>Explain your need for withdrawal.</p>,
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
            Once complete, you and CMS will receive an email confirmation.
          </p>
        </Alert>
        {/* Buttons */}
        <div className="flex gap-2 my-8">
          <Button type="submit">Submit</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setContent({
                header: "Stop form submission?",
                body: "All information you've entered on this form will be lost if you leave this page.",
                acceptButtonText: "Yes, leave form",
                cancelButtonText: "Return to form",
              });
              setOnAccept(() => acceptAction);
              setModalOpen(true);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
