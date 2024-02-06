import { PlanType, opensearch } from "shared-types";
import { z } from "zod";
import { Path, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSetup } from "@/pages/actions/setups";
import { SetupOptions } from "@/pages";
import { ReactElement, useCallback } from "react";
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
import { useModalContext } from "@/components/Context/modalContext";

const attachmentInstructions: Record<SetupOptions, ReactElement> = {
  "Medicaid SPA": (
    <p>
      Upload your supporting documentation for withdrawal or explain your need
      for withdrawal in the Additional Information section.
    </p>
  ),
  "CHIP SPA": (
    <p className="font-normal mb-4">
      Official withdrawal letters are required and must be on state letterhead
      signed by the State Medicaid Director or CHIP Director.
    </p>
  ),
};

const addlInfoInstructions: Record<SetupOptions, ReactElement> = {
  "Medicaid SPA": (
    <p>
      Explain your need for withdrawal, or upload supporting documentation. .
    </p>
  ),
  "CHIP SPA": <p>Explain your need for withdrawal.</p>,
};

export const WithdrawPackage = ({
  item,
  schema,
  attachments,
}: FormSetup & {
  item: opensearch.main.ItemResult;
}) => {
  const navigate = useNavigate();
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const { setModalOpen, setContent, setOnAccept } = useModalContext();
  const acceptAction = useCallback(() => {
    setModalOpen(false);
    navigate({ path: "/dashboard" });
  }, []);
  const form = useForm<z.infer<typeof schema>>({
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
            navigate({ path: "/dashboard" });
          } catch (e) {
            console.error(e);
          }
        })}
      >
        {form.formState.isSubmitting && <LoadingSpinner />}
        {/* Intro */}
        <ActionFormIntro title={`Withdraw ${item._source.planType} Package`}>
          <RequiredIndicator /> Indicates a required field
          <p>
            Complete this form to withdraw a package. Once complete, you will
            not be able to resubmit this package. CMS will be notified and will
            use this content to review your request. If CMS needs any additional
            information, they will follow up by email.
          </p>
        </ActionFormIntro>
        {/* Package ID and type info */}
        <PackageInfo item={item} />
        {/* Attachments */}
        <h3 className="font-bold text-2xl font-sans">Attachments</h3>
        {
          attachmentInstructions[
            item!._source.planType as string as SetupOptions
          ]
        }
        <AttachmentsSizeTypesDesc faqLink={"/faq"} />
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
            label:
              addlInfoInstructions[
                item!._source.planType as string as SetupOptions
              ],
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
            Once complete, you will not be able to resubmit this package. CMS
            will be notified and will use this content to review your request.
            If CMS needs any additional information, they will follow up by
            email.
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
              setOnAccept(acceptAction);
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
