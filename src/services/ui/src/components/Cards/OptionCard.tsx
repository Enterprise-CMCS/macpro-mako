import React, {PropsWithChildren, ReactNode} from "react";
import {Link} from "react-router-dom";
import {ROUTES} from "@/routes";

export type OptionCardFieldsetProps = PropsWithChildren<{
    legend: string;
}>;
export type MACFieldsetOption = {
    title: string,
    description: ReactNode,
    linkTo: ROUTES | string;
    altBg?: boolean;
};
/** Styled wrapper for use in MACCards with a gradient top border. */
export const MACCardWrapper = ({
   children,
}: PropsWithChildren) => {
    return (
        <div>
            <div style={{
                background: "linear-gradient(90.11deg,#0071bc 49.91%,#02bfe7 66.06%)",
                borderRadius: "3px 3px 0px 0px",
                height: "8px",
            }}/>
            <div className="border border-t-0 rounded-b-sm border-slate-300">
                {children}
            </div>
        </div>
    );
};
/** A fieldset for nesting {@link OptionCard} with MACCard styling */
export const OptionFieldset = ({
   children,
   legend,
}: OptionCardFieldsetProps) => {
    return (
        <section className="max-w-3xl mx-auto mb-6">
            <fieldset>
                <legend className="text-2xl font-bold py-8">{legend}</legend>
                <MACCardWrapper>
                    {children}
                </MACCardWrapper>
            </fieldset>
        </section>
    );
};
/** An element for use in options lists that lead to a destination, such as
 * the new submission options found in {@link NewSubmissionOptions} */
export const OptionCard = ({
   title,
   description,
   linkTo,
   altBg = false
}: MACFieldsetOption) => {
    return (
        <label>
            <Link to={linkTo}>
                <div className={`flex items-center justify-between gap-6 px-6 py-4 ${altBg ? "bg-slate-100" : "bg-white"} hover:bg-sky-100`}>
                    <div>
                        <h3 className="text-lg text-sky-600 font-bold my-2">
                            {title}
                        </h3>
                        <p className="my-2 text-slate-600">
                            {description}
                        </p>
                    </div>
                    {/*  TODO: Chevron Icon  */}
                    {/*<FontAwesomeIcon*/}
                    {/*    data-testid="chevron-right"*/}
                    {/*    icon={faChevronRight}*/}
                    {/*    className="choice-item-arrow"*/}
                    {/*/>*/}
                    <span>ICON</span>
                </div>
            </Link>
        </label>
    );
};