import React, {PropsWithChildren} from "react";
import {MACFieldsetOption, OptionCard, OptionFieldset} from "@/components/Cards/OptionCard";
import {AUTHORITY_OPTIONS, SPA_OPTIONS} from "@/pages/create/options";

export const SimplePageContainer = ({ children }: PropsWithChildren) => (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        {children}
    </div>
);

export const SimplePageTitle = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between my-4">
        <h1 className="text-xl">{title}</h1>
    </div>
);

export type OptionData = Omit<MACFieldsetOption, "altBg">
type OptionsPageProps = {
    options: OptionData[]
}

const OptionsPage = ({ options }: OptionsPageProps) => {
    return (
        <SimplePageContainer>
            <SimplePageTitle title={"New Submission"}/>
            <OptionFieldset legend={"Select a Submission Type"}>
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

export const NewSubmissionInitialOptions = () => <OptionsPage options={AUTHORITY_OPTIONS} />;
export const SPASubmissionOptions = () => <OptionsPage options={SPA_OPTIONS} />;
