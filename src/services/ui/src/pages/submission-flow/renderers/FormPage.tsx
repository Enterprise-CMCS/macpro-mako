import { SimplePageContainer } from "@/components";
import { SimplePageTitle } from "@/pages/submission-flow/renderers/OptionsPage";
import { MEDICAID_SPA_FORM } from "@/pages/submission-flow/config/forms";

export interface FormPageConfig {
  pageTitle: string;
  descriptionHeading: string;
}
const FormPage = ({ pageTitle, descriptionHeading }: FormPageConfig) => {
  return (
    <SimplePageContainer>
      <SimplePageTitle title={pageTitle} />
      <h2>{descriptionHeading}</h2>
    </SimplePageContainer>
  );
};

export const SampleFormPage = () => <FormPage {...MEDICAID_SPA_FORM} />;
