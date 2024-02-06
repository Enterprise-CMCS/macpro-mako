import { Path, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opensearch, PlanType } from "shared-types";
import { FormSetup } from "@/pages/actions/setups";
import { useModalContext } from "@/components/Context/modalContext";
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
import { submit } from "@/api/submissionService";
import { buildActionUrl } from "@/lib";
import { useNavigate, useParams } from "@/components/Routing";
import { useGetUser } from "@/api/useGetUser";
import { useCallback } from "react";
import { useAlertContext } from "@/components/Context/alertContext";

export const RespondToRai = ({
  item,
  schema,
  attachments,
}: FormSetup & {
  item: opensearch.main.ItemResult;
}) => {
  const navigate = useNavigate();
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const {
    setModalOpen,
    setContent: setModalContent,
    setOnAccept: setModalOnAccept,
  } = useModalContext();
  const {
    setContent: setBannerContent,
    setBannerShow,
    setBannerDisplayOn,
  } = useAlertContext();
  const acceptAction = useCallback(() => {
    setModalOpen(false);
    navigate({ path: "/dashboard" });
  }, []);
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          try {
            await submit({
              data: { ...data, id: id! },
              endpoint: buildActionUrl(type!),
              user,
              authority: item?._source.authority as PlanType,
            });
            setBannerContent({
              header: "RAI response submitted",
              body: `The RAI response for ${item._source.id} has been submitted.`,
            });
            setBannerShow(true);
            setBannerDisplayOn("/dashboard");
            navigate({ path: "/dashboard" });
          } catch (e) {
            console.error(e);
          }
        })}
      >
        {form.formState.isSubmitting && <LoadingSpinner />}
        {/* Intro */}
        <ActionFormIntro
          title={`${item._source.planType} Formal RAI Response Details`}
        >
          <RequiredIndicator /> Indicates a required field
          <p className="font-light mb-6 max-w-4xl">
            Once you submit this form, a confirmation email is sent to you and
            to CMS. CMS will use this content to review your package, and you
            will not be able to edit this form. If CMS needs any additional
            information, they will follow up by email.
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
              <p>Add anything else that you would like to share with CMS.</p>
            ),
            description: "4,000 characters allowed",
            className: "pt-6",
            required: false,
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
            to CMS. CMS will use this content to review your package, and you
            will not be able to edit this form. If CMS needs any additional
            information, they will follow up by email.
          </p>
        </Alert>
        {/* Buttons */}
        <div className="flex gap-2 my-8">
          <Button type="submit">Submit</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setModalContent({
                header: "Stop form submission?",
                body: "All information you've entered on this form will be lost if you leave this page.",
                acceptButtonText: "Yes, leave form",
                cancelButtonText: "Return to form",
              });
              setModalOnAccept(() => acceptAction);
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
