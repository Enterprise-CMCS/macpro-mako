import {
  MACFieldsetOption,
  OptionCard,
  OptionFieldset,
} from "@/components/Cards/OptionCard";
import {
  AUTHORITY_OPTIONS,
  B4_WAIVER_OPTIONS,
  B_WAIVER_OPTIONS,
  BCAP_WAIVER_OPTIONS,
  CHIP_SPA_OPTIONS,
  MEDICAID_SPA_OPTIONS,
  SPA_OPTIONS,
  WAIVER_OPTIONS,
} from "@/pages/create/options";
import { SimplePageContainer } from "@/components";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { BREAD_CRUMB_CONFIG } from "@/components/BreadCrumb/bread-crumb-config";

/** Can be removed once page title bar with back nav is integrated */
export const SimplePageTitle = ({ title }: { title: string }) => (
  <div className="flex items-center justify-between my-4">
    <h1 className="text-xl">{title}</h1>
  </div>
);

export type OptionData = Omit<MACFieldsetOption, "altBg">;
type OptionsPageProps = {
  options: OptionData[];
  title: string;
  fieldsetLegend: string;
};
/** A page for rendering an array of {@link OptionData} */
const OptionsPage = ({ options, title, fieldsetLegend }: OptionsPageProps) => {
  return (
    <SimplePageContainer>
      <BreadCrumbs options={BREAD_CRUMB_CONFIG} />
      <SimplePageTitle title={title} />
      <OptionFieldset legend={fieldsetLegend}>
        {options.map((opt, idx) => (
          <OptionCard
            key={idx}
            {...opt}
            altBg={idx % 2 === 1} // Even number option cards show altBg
          />
        ))}
      </OptionFieldset>
    </SimplePageContainer>
  );
};
/** Initial set of options for a New Submission */
export const NewSubmissionInitialOptions = () => (
  <OptionsPage
    title="Submission Type"
    fieldsetLegend="Select a Submission Type."
    options={AUTHORITY_OPTIONS}
  />
);
/** Choice between the main SPA types when creating a New Submission */
export const SPASubmissionOptions = () => (
  <OptionsPage
    title="SPA Type"
    fieldsetLegend="Select a SPA type to start your submission"
    options={SPA_OPTIONS}
  />
);
/** Sub-choices for Medicaid SPAs */
export const MedicaidSPASubmissionOptions = () => (
  <OptionsPage
    title="Medicaid SPA Type"
    fieldsetLegend="Select a Medicaid SPA type to create your submission"
    options={MEDICAID_SPA_OPTIONS}
  />
);
/** Sub-choices for CHIP SPAs */
export const ChipSPASubmissionOptions = () => (
  <OptionsPage
    title="CHIP SPA Type"
    fieldsetLegend="Select a CHIP SPA type to create your submission"
    options={CHIP_SPA_OPTIONS}
  />
);
export const WaiverSubmissionOptions = () => (
  <OptionsPage
    title="Waiver Action Type"
    fieldsetLegend="Select a Waiver type to start your submission."
    options={WAIVER_OPTIONS}
  />
);
export const BWaiverSubmissionOptions = () => (
  <OptionsPage
    title="1915(b) Waiver Action Type"
    fieldsetLegend="Select a 1915(b) Waiver type for your submission."
    options={B_WAIVER_OPTIONS}
  />
);
export const B4WaiverSubmissionOptions = () => (
  <OptionsPage
    title="1915(b)(4) FFS Selective Contracting Waiver Authority"
    fieldsetLegend="Select a Waiver type to start your submission."
    options={B4_WAIVER_OPTIONS}
  />
);
export const BCapWaiverSubmissionOptions = () => (
  <OptionsPage
    title="1915(b) Comprehensive (Capitated) Waiver Authority"
    fieldsetLegend="Select a Waiver type to start your submission."
    options={BCAP_WAIVER_OPTIONS}
  />
);
