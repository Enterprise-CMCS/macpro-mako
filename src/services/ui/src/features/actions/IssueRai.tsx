import { useCallback } from "react";
import { Path, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { opensearch, Authority } from "shared-types";

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
  ActionFormIntro,
  PackageInfo,
  SlotAdditionalInfo,
  OldFormSetup,
  SlotAttachments,
} from "@/features";
import { useGetUser, submit } from "@/api";
import {
  buildActionUrl,
  Origin,
  ORIGIN,
  originRoute,
  useOriginPath,
} from "@/utils";
import { useQuery as useQueryString } from "@/hooks";

export const RaiIssue = ({
  item,
  schema,
  attachments,
}: OldFormSetup & { item: opensearch.main.ItemResult }) => {
  const navigate = useNavigate();
  const urlQuery = useQueryString();
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const modal = useModalContext();
  const alert = useAlertContext();
  const originPath = useOriginPath();
  const acceptAction = useCallback(() => {
    modal.setModalOpen(false);
    navigate(originPath ? { path: originPath } : { path: "/dashboard" });
  }, [originPath]);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          try {
            await submit({
              data: { ...data, id: id! },
              endpoint: buildActionUrl(type!),
              user,
              authority: item?._source.authority as Authority,
            });
            alert.setContent({
              header: "RAI issued",
              body: `The RAI for ${item._source.id} has been submitted. An email confirmation will be sent to you and the state.`,
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
            navigate(
              originPath ? { path: originPath } : { path: "/dashboard" },
            );
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
        })}
      >
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
            label: (
              <p>
                Add anything else that you would like to share with the State.
              </p>
            ),
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
            Once you submit this form, a confirmation email is sent to you and
            to the State.
          </p>
        </Alert>
        {/* Buttons */}
        <div className="flex gap-2 my-8">
          <Button type="submit">Submit</Button>
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
              modal.setOnAccept(() => acceptAction);
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
