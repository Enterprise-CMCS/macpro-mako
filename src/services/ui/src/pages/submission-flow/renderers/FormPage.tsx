import { SimplePageContainer } from "@/components";
import { SimplePageTitle } from "@/pages/submission-flow/renderers/OptionsPage";
import { MEDICAID_SPA_FORM } from "@/pages/submission-flow/config/forms";
import { ReactElement } from "react";

export interface FormPageConfig {
  pageTitle: string;
  descriptionHeading: string;
  descriptionElement: ReactElement;
}
const FormPage = ({
  pageTitle,
  descriptionHeading,
  descriptionElement,
}: FormPageConfig) => {
  return (
    <SimplePageContainer>
      <SimplePageTitle title={pageTitle} />
      <section id="description">
        <h2>{descriptionHeading}</h2>
        <p>
          <span className="text-red-500">*</span> indicates required field
        </p>
        {descriptionElement}
      </section>
      <section id="spa-id"></section>
    </SimplePageContainer>
  );
};

export const SampleFormPage = () => <FormPage {...MEDICAID_SPA_FORM} />;
