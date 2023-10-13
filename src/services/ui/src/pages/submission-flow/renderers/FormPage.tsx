import { SimplePageContainer } from "@/components";
import { SimplePageTitle } from "@/pages/submission-flow/renderers/OptionsPage";
import { MEDICAID_SPA_FORM } from "@/pages/submission-flow/config/forms/medicaid-spa-config";
import { ChangeEvent, ReactElement, useState } from "react";
import { ROUTES } from "@/routes";
import { Link } from "react-router-dom";
import { Button, RequiredIndicator } from "@/components/Inputs";

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
export interface FormPageConfig {
  pageTitle: string;
  description: FormDescription;
  fields: FormSection[];
}
const FormPage = ({ pageTitle, description, fields }: FormPageConfig) => {
  const [data, setData] = useState({});
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
          // plug in the API call with data
          console.log(data);
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
