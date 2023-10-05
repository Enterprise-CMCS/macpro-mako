import { SimplePageContainer } from "@/components";
import { SimplePageTitle } from "@/pages/submission-flow/renderers/OptionsPage";
import { MEDICAID_SPA_FORM } from "@/pages/submission-flow/config/forms/medicaid-spa-config";
import { ReactElement } from "react";
import { ROUTES } from "@/routes";
import { Link } from "react-router-dom";

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
      <section id="description">
        <h2>{description.heading}</h2>
        <p>
          <span className="text-red-500">*</span> indicates required field
        </p>
        {description.instructions}
      </section>
      <form>
        {fields.map((section, idx) => (
          <section key={`${idx}-${section.id}`} id={section.id}>
            {typeof section.heading === "object" ? (
              /* Some headings require an additional link to the FAQ. Those
               * are provided in configs as HeadingWithLink objects. */
              <div className="flex justify-between">
                <h3>{section.heading.text}</h3>
                <Link to={section.heading.linkRoute}>
                  {section.heading.linkText}
                </Link>
              </div>
            ) : (
              <h3>{section.heading}</h3>
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
