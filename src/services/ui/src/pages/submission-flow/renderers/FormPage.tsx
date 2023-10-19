import { SimplePageContainer } from "@/components";
import { SimplePageTitle } from "@/pages/submission-flow/renderers/OptionsPage";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, RequiredIndicator } from "@/components/Inputs";
import { SpaSubmissionBody, useSubmissionMutation } from "@/api/submit";
import { grabPreSignedURL, uploadAttachments } from "@/api/uploadAttachments";
import { useGetUser } from "@/api/useGetUser";
import { FormSection } from "@/pages/submission-flow/config/forms/common";
import { ZodIssue, ZodObject } from "zod";

type FormDescription = Pick<FormSection, "instructions"> & {
  // Limits the higher form header to just a string, no HeadingWithLink
  // is needed at this level.
  heading: string;
};
type FormMeta = {
  origin: string;
  authority: string;
  validator: ZodObject<any>;
};
export interface FormPageConfig {
  meta: FormMeta;
  pageTitle: string;
  description: FormDescription;
  fields: FormSection[];
}

export const FormPage = ({
  meta,
  pageTitle,
  description,
  fields,
}: FormPageConfig) => {
  const [fieldErrors, setFieldErrors] = useState<ZodIssue[]>([]);
  const { data: user } = useGetUser();
  // This shape will change with other authorities like Waivers.
  // One approach could be generics?
  const [data, setData] = useState<SpaSubmissionBody>({
    additionalInformation: "",
    attachments: [],
    id: "",
    raiResponses: [],
    state: "",
    proposedEffectiveDate: 0,
    // Values below are universal for all authorities (waiver & spa)
    origin: meta.origin,
    authority: meta.authority,
    submitterEmail: user?.user?.email || "",
    submitterName: `${user?.user?.given_name} ${user?.user?.family_name}`,
  });
  // Which API we send to may be something that changes with Waiver authorities
  // unless we hit a single endpoint that further routes based on the value(s)
  // given (it does not currently)
  const api = useSubmissionMutation();
  return (
    <SimplePageContainer>
      <SimplePageTitle title={pageTitle} />
      <section id="description" className="max-w-4xl">
        <h2 className="text-2xl font-bold">{description.heading}</h2>
        <p className="my-1">
          <RequiredIndicator /> indicates required field
        </p>
        {description.instructions}
      </section>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          // Get pre signed urls for upload
          // Upload files and get S3 bucket/key
          for (let i = 0; i < data.attachments.length; i++) {
            console.log(data.attachments[i]);
            const response = await grabPreSignedURL();
            console.log(response);
          }

          const payload = {
            ...data,
            // TODO: Set attachments with S3 buckets/keys
            state: data.id?.split("-")[0] || undefined,
          };
          console.log(payload);
          const result = meta.validator.safeParse(payload);
          if (result.success) {
            // api.mutate(submission);
            setFieldErrors([]);
          } else {
            // Send errors to state
            setFieldErrors(result.error.errors);
            // Console log 'em
            console.error("SCHEMA PARSE ERROR(S): ", result.error.errors);
          }
          // TODO: route back to dashboard on success
        }}
      >
        {fields.map((section, idx) => (
          <section
            className="my-6 max-w-4xl"
            key={`${idx}-${section.id}`}
            id={section.id}
          >
            {typeof section.heading === "object" ? (
              /* Some headings require an additional link to the FAQ. Those
               * are provided in configs as HeadingWithLink objects. */
              <div className="flex justify-between">
                <label htmlFor={section.id} className="text-lg font-bold">
                  {section.heading.text}
                  {section.required && <RequiredIndicator />}
                </label>
                <Link
                  className="text-sky-600 hover:text-sky-800 underline"
                  to={section.heading.linkRoute}
                >
                  {section.heading.linkText}
                </Link>
              </div>
            ) : (
              <label htmlFor={section.id} className="text-lg font-bold">
                {section.heading}
                {section.required && <RequiredIndicator />}
              </label>
            )}
            {/* Render field instruction */}
            {section.instructions}
            {/* Render error messages pertaining to field */}
            {fieldErrors
              .filter((err) => err.path.includes(section.id))
              .map((err) => (
                <>
                  <span
                    key={`${err.path[0]}-err-msg`}
                    className="text-red-600 text-sm"
                  >
                    {err.message}
                  </span>
                  <br />
                </>
              ))}
            {/* Render field inputs */}
            {section.field(setData)}
          </section>
        ))}
        <div className="flex gap-3">
          <Button className="md:px-12" type="submit">
            Submit
          </Button>
          <Button className="xs:w-full md:px-12" variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </SimplePageContainer>
  );
};
