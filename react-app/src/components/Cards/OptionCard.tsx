import { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { CardWithTopBorder } from "@/components";
import { Route } from "../Routing/types";

export type OptionCardFieldsetProps = PropsWithChildren<{
  legend: string;
}>;
export type MACFieldsetOption = {
  title: string;
  description: ReactNode;
  linkTo: Route;
  altBg?: boolean;
};
/** A fieldset for nesting {@link OptionCard} with MACCard styling */
export const OptionFieldset = ({
  children,
  legend,
}: OptionCardFieldsetProps) => {
  return (
    <section className="max-w-3xl mx-auto mb-6">
      <fieldset>
        <legend className="text-2xl font-medium py-8">{legend}</legend>
        <CardWithTopBorder>{children}</CardWithTopBorder>
      </fieldset>
    </section>
  );
};
/** An element for use in options lists that lead to a destination, such as
 * the new submission options found in {@link NewSubmissionInitialOptions} */
export const OptionCard = ({
  title,
  description,
  linkTo,
  altBg = false,
}: MACFieldsetOption) => {
  return (
    <label>
      <Link to={linkTo} relative={"path"}>
        <div
          data-testid={"card-inner-wrapper"}
          className={`flex items-center justify-between gap-6 px-6 py-4 ${
            altBg ? "bg-slate-100" : "bg-white"
          } hover:bg-sky-100`}
        >
          <div>
            <h2 className="text-lg text-sky-700 font-bold my-2">{title}</h2>
            <p className="my-2 text-slate-600">{description}</p>
          </div>
          <ChevronRight className="text-sky-700 w-8 h-8" />
        </div>
      </Link>
    </label>
  );
};
