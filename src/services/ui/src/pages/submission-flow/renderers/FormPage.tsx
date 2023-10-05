import { SimplePageContainer } from "@/components";
import { SimplePageTitle } from "@/pages/submission-flow/renderers/OptionsPage";
import { MEDICAID_SPA_FORM } from "@/pages/submission-flow/config/forms";
import { ReactElement } from "react";

type FormSection = {
  id: string;
  heading: string;
  instructions: ReactElement;
  content: ReactElement;
};
type FormDescription = Pick<FormSection, "heading" | "instructions">;
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
            <h3>{section.heading}</h3>
            {section.instructions}
            {section.content}
          </section>
        ))}
      </form>
    </SimplePageContainer>
  );
};

export const SampleFormPage = () => <FormPage {...MEDICAID_SPA_FORM} />;
