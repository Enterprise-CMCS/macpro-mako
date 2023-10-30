import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as I from "@/components/Inputs";
import { Link } from "react-router-dom";
import { API } from "aws-amplify";
import { OneMacSink } from "shared-types";

const formSchema = z.object({
  id: z
    .string()
    .regex(
      /^[A-Z]{2}-\d{2}-\d{4}(-\d{4})?$/,
      "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-xxxx"
    ),
  additionalInformation: z.string().max(4000).optional(),
  attachments: z.object({
    cmsForm179: z.array(z.instanceof(File)).nonempty(),
    spaPages: z.array(z.instanceof(File)).optional(),
    coverLetter: z.array(z.instanceof(File)).optional(),
    tribalEngagement: z.array(z.instanceof(File)).optional(),
    existingStatePlanPages: z.array(z.instanceof(File)).optional(),
    publicNotice: z.array(z.instanceof(File)).optional(),
    sfq: z.array(z.instanceof(File)).optional(),
    tribalConsultation: z.array(z.instanceof(File)).optional(),
    other: z.array(z.instanceof(File)).optional(),
  }),
  proposedEffectiveDate: z.date().optional(),
});

export type MedicaidFormSchema = z.infer<typeof formSchema>;
type UploadKeys = keyof MedicaidFormSchema["attachments"];
export type PreSignedURL = {
  url: string;
  key: string;
  bucket: string;
};

// first argument in the array is the name that will show up in the form submission
// second argument is used when mapping over for the label
const attachmentList: Array<[UploadKeys, string]> = [
  ["cmsForm179", "CMS Form 179"],
  ["spaPages", "SPA Pages"],
  ["coverLetter", "Cover Letter"],
  ["tribalEngagement", "Document Demonstrating Good-Faith Tribal Engagement"],
  ["existingStatePlanPages", "Existing State Plan Page(s)"],
  ["publicNotice", "Public Notice"],
  ["sfq", "Standard Funding Questions (SFQs)"],
  ["tribalConsultation", "Tribal Consultation"],
  ["other", "Other"],
];

export const MedicaidForm = () => {
  const form = useForm<MedicaidFormSchema>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<MedicaidFormSchema> = async (data) => {
    // check to see what controls have a file upload to send, because some will potentially be empty
    const uploadKeys = Object.keys(data.attachments) as UploadKeys[];
    const validUploadKeys = uploadKeys.filter((key) => {
      console.log(typeof key);
      return data.attachments[key] !== undefined;
    });
    const validUploads = validUploadKeys.map((key) => data.attachments[key]);

    // async for..of loop to handle all the promises
    const getPreSignedURLs = () => {
      const promises: Array<Promise<PreSignedURL>> = [];

      validUploads.forEach(() =>
        promises.push(
          API.post("os", "/getUploadUrl", {
            body: {},
          })
        )
      );

      return promises;
    };

    const fileUploadPromises: Promise<Response>[] = [];

    for (const upload of validUploadKeys) {
      for await (const presignedUrl of getPreSignedURLs()) {
        data.attachments[upload]?.forEach((file) => {
          fileUploadPromises.push(
            fetch(presignedUrl.url, {
              method: "PUT",
              body: file,
            })
          );
        });
      }
    }

    await Promise.all(fileUploadPromises);

    // transform data to match what the sink will expect?
    console.log("hello", data);
    const sendDataToOneMac = () => {
      const oneMacData: { id: string } & OneMacSink = {
        id: "",
        additionalInformation: data.additionalInformation ?? null,
        submitterEmail: "test@test.test",
        submitterName: "test",
        attachments: [],
        raiResponses: [],
      };
    };
  };

  return (
    <I.Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="my-6 space-y-8 max-w-3xl mx-auto"
      >
        <section>
          <h1 className="font-bold text-2xl mb-2">Medicaid SPA Details</h1>
          <p>
            Once you submit this form, a confirmation email is sent to you and
            to CMS. CMS will use this content to review your package, and you
            will not be able to edit this form. If CMS needs any additional
            information, they will follow up by email.{" "}
            <strong className="bold">
              If you leave this page, you will lose your progress on this form.
            </strong>
          </p>
        </section>

        <I.FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <I.FormItem>
              <div className="flex justify-between">
                <I.FormLabel>SPA ID</I.FormLabel>
                <Link to="/faq" className="text-blue-700 hover:underline">
                  What is my SPA ID?
                </Link>
              </div>
              <p>Must follow the format SS-YY-NNNN or SS-YY-NNNN-xxxx.</p>
              <p className="italic">
                Reminder - CMS recommends that all SPA numbers start with the
                year in which the package is submitted.
              </p>
              <I.FormControl className="max-w-sm">
                <I.Input {...field} />
              </I.FormControl>
              <I.FormMessage />
            </I.FormItem>
          )}
        />

        <I.FormField
          control={form.control}
          name="proposedEffectiveDate"
          render={({ field }) => (
            <I.FormItem className="max-w-sm">
              <I.FormLabel className="block">
                Proposed Effective Date of Medicaid SPA
              </I.FormLabel>
              <I.FormDescription>For example: 4/28/1986</I.FormDescription>
              <I.FormControl>
                <I.DatePicker onChange={field.onChange} date={field.value} />
              </I.FormControl>
              <I.FormMessage />
            </I.FormItem>
          )}
        />

        <section>
          <h3 className="text-2xl font-bold font-sans">Attachments</h3>
          <p>
            Maximum file size of 80 MB per attachment. You can add multiple
            files per attachment type.Read the description for each of the
            attachment types on the FAQ Page. We accept the following file
            formats:{" "}
            <strong className="bold">
              .doc, .docx, .jpg, .odp, .ods, .odt, .png, .pdf, .ppt, .pptx,
              .rtf, .txt, .xls, .xlsx,
            </strong>{" "}
            and a few others. See the full list on the FAQ Page. *At least one
            attachment is required.
          </p>
        </section>

        {attachmentList.map((attachment) => (
          <I.FormField
            key={attachment[0]}
            control={form.control}
            name={`attachments.${attachment[0]}`}
            render={({ field }) => (
              <I.FormItem>
                <I.FormLabel>{attachment[1]}</I.FormLabel>
                <I.Upload
                  files={field?.value ?? []}
                  setFiles={field.onChange}
                />
                <I.FormMessage />
              </I.FormItem>
            )}
          />
        ))}

        <I.FormField
          control={form.control}
          name="additionalInformation"
          render={({ field }) => (
            <I.FormItem>
              <h3 className="font-bold text-2xl font-sans">
                Additional Information
              </h3>
              <I.FormLabel className="font-normal">
                Add anything else you would like to share with CMS
              </I.FormLabel>
              <I.Textarea {...field} className="h-[200px] resize-none" />
              <I.FormDescription>4,000 characters allowed</I.FormDescription>
            </I.FormItem>
          )}
        />

        <div className="flex gap-2">
          <I.Button type="submit">Submit</I.Button>
          <I.Button variant="outline">Cancel</I.Button>
        </div>
      </form>
    </I.Form>
  );
};
