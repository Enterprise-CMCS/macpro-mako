import { useCallback } from "react";
import { Path, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opensearch, Authority } from "shared-types";
import { Info } from "lucide-react";
import {
  Button,
  Form,
  FormField,
  FormMessage,
  RequiredIndicator,
  Alert,
  LoadingSpinner,
  AttachmentsSizeTypesDesc,
  useNavigate,
  useParams,
  useModalContext,
  useAlertContext,
  Route,
} from "@/components";
import {
  SlotAdditionalInfo,
  SlotAttachments,
  FormSetup,
  ActionFormIntro,
  PackageInfo,
} from "@/features";
import { submit, useGetUser } from "@/api";
import {
  buildActionUrl,
  Origin,
  ORIGIN,
  originRoute,
  useOriginPath,
} from "@/utils";
import { useQuery as useQueryString } from "@/hooks";

export const WithdrawRai = ({
  item,
  schema,
  attachments,
}: FormSetup & { item: opensearch.main.ItemResult }) => {
  const navigate = useNavigate();
  const urlQuery = useQueryString();
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const modal = useModalContext();
  const alert = useAlertContext();
  const originPath = useOriginPath();
  const cancelOnAccept = useCallback(() => {
    modal.setModalOpen(false);
    navigate(originPath ? { path: originPath } : { path: "/dashboard" });
  }, []);
  const confirmOnAccept = useCallback(() => {
    modal.setModalOpen(false);
    form.handleSubmit(async (data) => {
      try {
        await submit({
          data: { ...data, id: id! },
          endpoint: buildActionUrl(type!),
          user,
          authority: item?._source.authority as Authority,
        });
        alert.setContent({
          header: "RAI response withdrawn",
          body: `The RAI response for ${item._source.id} has been withdrawn. CMS may follow up if additional information is needed.`,
        });
        alert.setBannerStyle("success");
        alert.setBannerShow(true);
        alert.setBannerDisplayOn(
          // This uses the originRoute map because this value doesn't work
          // when any queries are added, such as the case of /details?id=...
          urlQuery.get(ORIGIN)
            ? originRoute[urlQuery.get(ORIGIN)! as Origin]
            : "/dashboard",
        );
        navigate(originPath ? { path: originPath } : { path: "/dashboard" });
      } catch (e) {
        console.error(e);
        alert.setContent({
          header: "An unexpected error has occurred:",
          body: e instanceof Error ? e.message : String(e),
        });
        alert.setBannerStyle("destructive");
        alert.setBannerDisplayOn(window.location.pathname as Route);
        alert.setBannerShow(true);
        window.scrollTo(0, 0);
      }
    })();
  }, []);
  return (
    <Form {...form}>
      <form>
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
          faqLink={"/faq/medicaid-spa-rai-attachments"}
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
                  ),
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
          <Button
            type={"button"}
            onClick={() => {
              modal.setContent({
                header: "Withdraw RAI response?",
                body: `The RAI response for ${item._source.id} will be withdrawn, and CMS will be notified.`,
                acceptButtonText: "Yes, withdraw response",
                cancelButtonText: "Cancel",
              });
              modal.setOnAccept(() => confirmOnAccept);
              modal.setModalOpen(true);
            }}
          >
            Submit
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              modal.setContent({
                header: "Stop form submission?",
                body: "All information you've entered on this form will be lost if you leave this page.",
                acceptButtonText: "Yes, leave form",
                cancelButtonText: "Return to form",
              });
              modal.setOnAccept(() => cancelOnAccept);
              modal.setModalOpen(true);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
