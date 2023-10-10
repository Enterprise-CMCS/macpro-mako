import { SimplePageContainer } from "@/components";
import { SimplePageTitle } from "@/pages/submission-flow/renderers/OptionsPage";
import { MEDICAID_SPA_FORM } from "@/pages/submission-flow/config/forms/medicaid-spa-config";
import { ReactElement } from "react";
import { ROUTES } from "@/routes";
import { Link } from "react-router-dom";
import { RequiredIndicator } from "@/components/Inputs";

type HeadingWithLink = {
  text: string;
  linkText: string;
  linkRoute: ROUTES;
};
type FormSection = {
  id: string;
  heading: string | HeadingWithLink;
  instructions: ReactElement;
  content: ReactElement;
  //TODO: Required boolean
};
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
      <form>
        {fields.map((section, idx) => (
          <section
            className="my-3 max-w-4xl"
            key={`${idx}-${section.id}`}
            id={section.id}
          >
            {typeof section.heading === "object" ? (
              /* Some headings require an additional link to the FAQ. Those
               * are provided in configs as HeadingWithLink objects. */
              <div className="flex justify-between">
                <h3 className="text-lg font-bold">{section.heading.text}</h3>
                <Link
                  className="text-sky-600 hover:text-sky-800 underline"
                  to={section.heading.linkRoute}
                >
                  {section.heading.linkText}
                </Link>
              </div>
            ) : (
              <h3 className="text-lg font-bold">{section.heading}</h3>
            )}
            {section.instructions}
            {section.content}
          </section>
        ))}
      </form>
    </SimplePageContainer>
  );
};

export const SampleFormPage = () => <FormPage {...MEDICAID_SPA_FORM} />;
