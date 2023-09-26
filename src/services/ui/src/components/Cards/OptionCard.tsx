import React, {PropsWithChildren, ReactNode} from "react";
import {CardWithTopBorder} from "@/components";
import {Link} from "react-router-dom";
import {ROUTES} from "@/router";

export type OptionCardFieldsetProps = PropsWithChildren<{
    legend: string;
}>;
export type MACFieldsetOption = {
    title: string,
    description: ReactNode,
    linkTo: ROUTES | string;
};
/** A styled MACCard for nesting {@link OptionCard} with a fieldset and
 * legend */
export const OptionFieldset = ({
   children,
   legend,
}: OptionCardFieldsetProps) => {
    return (
        <section>
            <fieldset>
                <legend className="text-xl font-bold py-8">{legend}</legend>
                <CardWithTopBorder>
                    {children}
                </CardWithTopBorder>
            </fieldset>
        </section>
    );
};
/** An element for use in options lists that lead to a destination, such as
 * the triage options found in {@link NewSubmissionOptions} */
export const OptionCard = ({
  title,
  description,
  linkTo,
}: MACFieldsetOption) => {
    return (
        <label>
            <Link to={linkTo}>
                <div>
                    <div>
                        <h3>{title}</h3>
                        {description}
                    </div>
                    {/*  TODO: Chevron Icon  */}
                    {/*<FontAwesomeIcon*/}
                    {/*    data-testid="chevron-right"*/}
                    {/*    icon={faChevronRight}*/}
                    {/*    className="choice-item-arrow"*/}
                    {/*/>*/}
                </div>
            </Link>
        </label>
    );
};