import { SimplePageContainer } from "@/components";
import { SimplePageTitle } from "@/pages/submission-flow/renderers/OptionsPage";
import { MEDICAID_SPA_FORM } from "@/pages/submission-flow/config/forms/medicaid-spa-config";
import { ChangeEvent, ReactElement, useState } from "react";
import { ROUTES } from "@/routes";
import { Link } from "react-router-dom";
import { Button, RequiredIndicator } from "@/components/Inputs";
import { SubmissionAPIBody, useSubmissionMutation } from "@/api/submit";
import { useGetUser } from "@/api/useGetUser";

type HeadingWithLink = {
  text: string;
  linkText: string;
  linkRoute: ROUTES;
};
export type Handler = (e: ChangeEvent<any>) => void;
type FormSection = {
  id: string;
  heading: string | HeadingWithLink;
  instructions: ReactElement;
  field: (func: Handler) => ReactElement;
  //TODO: Required boolean
};
// TODO: Instructions may be universal? If so, just plug it in jsx
//  without the need for a config prop
type FormDescription = Pick<FormSection, "instructions"> & {
  // Limits the higher form header to just a string, no HeadingWithLink
  // is needed at this level.
  heading: string;
};
type FormMeta = { origin: string; authority: string };
export interface FormPageConfig {
  meta: FormMeta;
  pageTitle: string;
  description: FormDescription;
  fields: FormSection[];
}
const FormPage = ({ meta, pageTitle, description, fields }: FormPageConfig) => {
  const { data: user } = useGetUser();
  const [data, setData] = useState<SubmissionAPIBody>({
    additionalInformation: "",
    attachments: [],
    id: "",
    raiResponses: [],
    origin: meta.origin,
    authority: meta.authority,
    submitterEmail: user?.user?.email || "",
    submitterName: `${user?.user?.given_name} ${user?.user?.family_name}`,
    state: "",
  });
  const api = useSubmissionMutation();
  const updateData = (e: ChangeEvent<any>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

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
        onSubmit={(event) => {
          event.preventDefault();
          const submission = {
            ...data,
            state: data.id.split("-")[0],
          };
          // plug in the API call with data
          api.mutate(submission);
          console.log(submission);
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
              </label>
            )}
            {section.instructions}
            {section.field(updateData)}
          </section>
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </SimplePageContainer>
  );
};

export const SampleFormPage = () => <FormPage {...MEDICAID_SPA_FORM} />;
