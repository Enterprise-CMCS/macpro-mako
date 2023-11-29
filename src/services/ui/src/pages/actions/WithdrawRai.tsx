import { BreadCrumbs, SimplePageContainer } from "@/components";
import * as I from "@/components/Inputs";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { DETAILS_AND_ACTIONS_CRUMBS } from "./actions-breadcrumbs";
import { useNavigate, useParams } from "react-router-dom";
import { Action, OneMacTransform, WithdrawRaiRecord } from "shared-types";
import { FormDescriptionText } from "@/components/FormDescriptionText";
import { useGetItem } from "@/api/useGetItem";
import { useGetUser } from "@/api/useGetUser";
import { PreSignedURL } from "./IssueRai";
import { API } from "aws-amplify";

const formSchema = z.object({
  additionalInformation: z.string().max(4000),
  attachments: z.object({
    supportingDocumentation: z.array(z.instanceof(File)),
  }),
});

type FormSchema = z.infer<typeof formSchema>;
type UploadKeys = keyof FormSchema["attachments"];

const attachmentList = [
  {
    name: "supportingDocumentation",
    label: "Supporting Documentation",
    required: false,
  },
] as const;

export const WithdrawRai = () => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const { data: item } = useGetItem(id!);

  const user = useGetUser();

  const handleSubmit: SubmitHandler<FormSchema> = async (data) => {
    // Attachment Stuff (this will change soon)
    const uploadKeys = Object.keys(data.attachments) as UploadKeys[];
    const uploadedFiles: any[] = [];
    const fileMetaData: NonNullable<OneMacTransform["attachments"]> = [];

    const presignedUrls: Promise<PreSignedURL>[] = uploadKeys
      .filter((key) => data.attachments[key] !== undefined)
      .map(() =>
        API.post("os", "/getUploadUrl", {
          body: {},
        })
      );
    const loadPresignedUrls = await Promise.all(presignedUrls);

    uploadKeys
      .filter((key) => data.attachments[key] !== undefined)
      .forEach((uploadKey, index) => {
        const attachmenListObject = attachmentList?.find(
          (item) => item.name === uploadKey
        );
        const title = attachmenListObject ? attachmenListObject.label : "Other";
        const fileGroup = data.attachments[uploadKey] as File[];

        // upload all files in this group and track there name
        for (const file of fileGroup) {
          uploadedFiles.push(
            fetch(loadPresignedUrls[index].url, {
              body: file,
              method: "PUT",
            })
          );

          fileMetaData.push({
            key: loadPresignedUrls[index].key,
            filename: file.name,
            title: title,
            bucket: loadPresignedUrls[index].bucket,
            uploadDate: Date.now(),
          });
        }
      });

    await Promise.all(uploadedFiles);

    // creating record to send to action api
    const dataToSend: WithdrawRaiRecord = {
      submitterEmail: user.data?.user?.email ?? "",
      submitterName: `${user.data?.user?.given_name ?? "N/A"} ${
        user.data?.user?.family_name ?? "N/A"
      }`,
      id: id!,
      withdraw: {
        withdrawDate: new Date().getTime(),
        additionalInformation: data.additionalInformation,
        withdrawAttachments: fileMetaData,
      },
    };

    console.log("Record that will be sent to action api endpoint", {
      dataToSend,
    });
  };

  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={DETAILS_AND_ACTIONS_CRUMBS({
          id: id || "",
          action: Action.WITHDRAW_RAI,
        })}
      />
      <I.Form {...form}>
        <form
          className="my-6 space-y-8 mx-auto"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <section>
            <h1 className="font-bold text-2xl mb-2">
              Medicaid Withdraw Formal RAI Details
            </h1>
            <p className="my-1">
              <I.RequiredIndicator /> Indicates a required field
            </p>
            <FormDescriptionText />
          </section>
          <section className="grid grid-cols-2">
            <h3 className="text-2xl font-bold font-sans col-span-2">
              Package Details
            </h3>
            <div className="flex flex-col my-8">
              <label>SPA ID</label>
              <span className="text-xl" aria-labelledby="package-id-label">
                {id}
              </span>
            </div>
            <div className="flex flex-col my-8">
              <label>Type</label>
              <span className="text-xl" aria-labelledby="package-id-label">
                {item?._source.planType}
              </span>
            </div>
          </section>
          <h3 className="font-bold text-2xl font-sans">Attachments</h3>
          <I.FormField
            name="attachments.supportingDocumentation"
            control={form.control}
            render={({ field }) => (
              <I.FormItem>
                <I.FormLabel>Supporting Documentation</I.FormLabel>
                <I.Upload
                  files={field?.value ?? []}
                  setFiles={field.onChange}
                />
              </I.FormItem>
            )}
          />
          <I.FormField
            control={form.control}
            name="additionalInformation"
            render={({ field }) => {
              return (
                <I.FormItem>
                  <h3 className="font-bold text-2xl font-sans">
                    Additional Information <I.RequiredIndicator />
                  </h3>
                  <I.FormLabel className="font-normal">
                    Add anything else that you would like to share with CMS.
                  </I.FormLabel>
                  <I.Textarea {...field} className="h-[200px] resize-none" />
                  <I.FormDescription>
                    {field.value && field.value.length >= 0
                      ? `${4000 - field.value.length} characters remaining`
                      : "4000 characters allowed"}
                  </I.FormDescription>
                </I.FormItem>
              );
            }}
          />
          <div className="flex gap-2">
            <I.Button
              disabled={form.formState.isSubmitting}
              type="submit"
              className="px-12"
            >
              Submit
            </I.Button>
            <I.Button
              type="button"
              variant="outline"
              // onClick={() => setCancelModalIsOpen(true)}
              className="px-12"
            >
              Cancel
            </I.Button>
          </div>
        </form>
      </I.Form>
    </SimplePageContainer>
  );
};
