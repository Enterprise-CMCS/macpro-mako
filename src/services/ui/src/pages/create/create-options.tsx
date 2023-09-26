import React, {PropsWithChildren} from "react";
import {OptionCard, OptionFieldset} from "@/components/Cards/OptionCard";
import {ROUTES} from "@/router";

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

export const NewSubmissionOptions = () => {
    return (
        <SimplePageContainer>
            <SimplePageTitle title={"New Submission"}/>
            <OptionFieldset legend={"Select a Submission Type"}>
                <OptionCard
                    title="State Plan Amendment (SPA)"
                    description={<p>Submit a Medicaid or CHIP State Plan Amendment</p>}
                    linkTo={ROUTES.HOME}
                />
                <OptionCard
                    title="Waiver Action"
                    description={<p>Submit Waivers, Amendments, Renewals, and Temporary Extensions</p>}
                    linkTo={ROUTES.HOME}
                    altBg
                />
            </OptionFieldset>
        </SimplePageContainer>
    );
};
