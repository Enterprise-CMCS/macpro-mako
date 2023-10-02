import React, {PropsWithChildren} from "react";
import {MACFieldsetOption, OptionCard, OptionFieldset} from "@/components/Cards/OptionCard";
import {AUTHORITY_OPTIONS, CHIP_SPA_OPTIONS, MEDICAID_SPA_OPTIONS, SPA_OPTIONS} from "@/pages/create/options";

/** I didn't see a page container already present in the repo, so to better standardize
 * we can extract this and use it on more pages where currently each page has its own. (KH) */
export const SimplePageContainer = ({ children }: PropsWithChildren) => (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        {children}
    </div>
);
/** Can be removed once page title bar with back nav is integrated */
export const SimplePageTitle = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between my-4">
        <h1 className="text-xl">{title}</h1>
    </div>
);

export type OptionData = Omit<MACFieldsetOption, "altBg">
type OptionsPageProps = {
    options: OptionData[]
    title: string
    fieldsetLegend: string
}
/** A page for rendering an array of {@link OptionData} */
const OptionsPage = ({ options, title, fieldsetLegend }: OptionsPageProps) => {
    return (
        <SimplePageContainer>
            <SimplePageTitle title={title}/>
            <OptionFieldset legend={fieldsetLegend}>
                {options.map((opt, idx) =>
                    <OptionCard
                        key={idx}
                        {...opt}
                        altBg={idx % 2 === 1} // Even number option cards show altBg
                    />
                )}
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
        options={SPA_OPTIONS} />
);
/** Sub-choices for Medicaid SPAs */
export const MedicaidSPASubmissionOptions = () => (
    <OptionsPage
        title="Medicaid SPA Type"
        fieldsetLegend="Select a Medicaid SPA type to create your submission"
        options={MEDICAID_SPA_OPTIONS} />
);
/** Sub-choices for CHIP SPAs */
export const ChipSPASubmissionOptions = () => (
    <OptionsPage
        title="CHIP SPA Type"
        fieldsetLegend="Select a CHIP SPA type to start your submission"
        options={CHIP_SPA_OPTIONS} />
);
