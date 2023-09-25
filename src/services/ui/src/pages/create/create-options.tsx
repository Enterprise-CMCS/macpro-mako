import React, { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";
import {Card} from "@mui/material";

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

export type MACCardListProps = PropsWithChildren<{
    legend: string;
    additionalContainerClassName?: string;
}>;
/** A styled MACCard for nesting {@link MACFieldsetCardOption} with a fieldset and
 * legend */
export const OptionFieldset = ({
    children,
    legend,
    additionalContainerClassName,
}: MACCardListProps) => {
    return (
        <section className={`mac-fieldset-wrapper ${additionalContainerClassName}`}>
            <fieldset>
                <legend className="mac-fieldset-legend">{legend}</legend>
                <Card>
                    {children}
                </Card>
            </fieldset>
        </section>
    );
};

export const NewSubmissionOptions = () => {
    return (
        <SimplePageContainer>
            <SimplePageTitle title={"New Submission"}/>
            <OptionFieldset legend={"Test"}>
            </OptionFieldset>
        </SimplePageContainer>
    );
};
