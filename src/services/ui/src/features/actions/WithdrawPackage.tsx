import { ReactElement, useCallback } from "react";
import { Path, useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Authority, SEATOOL_STATUS, opensearch } from "shared-types";
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
  useParams,
  useModalContext,
  useAlertContext,
  Route,
} from "@/components";
import {
  SetupOptions,
  FormSetup,
  ActionFormIntro,
  PackageInfo,
  SlotAdditionalInfo,
  SlotAttachments,
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
import { useSyncStatus } from "@/hooks/useSyncStatus";

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
    <p>Explain your need for withdrawal, or upload supporting documentation.</p>
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
  const urlQuery = useQueryString();
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();
  const modal = useModalContext();
  const alert = useAlertContext();
  const location = useLocation();
  const { loading, syncRecord } = useSyncStatus({
    path: location.state?.from ?? "/dashboard",
    isCorrectStatus: (data) => {
      return data._source.seatoolStatus === SEATOOL_STATUS.WITHDRAWN;
    },
  });
  const cancelOnAccept = useCallback(() => {
    modal.setModalOpen(false);
    navigate(-1);
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
          header: "Package withdrawn",
          body: `The package ${item._source.id} has been withdrawn.`,
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
        syncRecord(id);
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
        {(loading || form.formState.isSubmitting) && <LoadingSpinner />}
        {/* Intro */}
        <ActionFormIntro title={`Withdraw ${item._source.authority} Package`}>
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
            item!._source.authority as string as SetupOptions
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
                item!._source.authority as string as SetupOptions
              ],
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
                  ),
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
          <Button
            type={"button"}
            onClick={() => {
              modal.setContent({
                header: "Withdraw package?",
                body: `The package ${item._source.id} will be withdrawn.`,
                acceptButtonText: "Yes, withdraw package",
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
