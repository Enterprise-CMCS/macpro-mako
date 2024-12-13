import { PropsWithChildren, ReactNode } from "react";
import { Link, LinkProps } from "react-router";
import { ChevronRight } from "lucide-react";
import { CardWithTopBorder } from "@/components";

export type OptionCardFieldsetProps = PropsWithChildren<{
  legend: string;
}>;
export type MACFieldsetOption = {
  title: string;
  description: ReactNode;
  to: LinkProps["to"];
  altBg?: boolean;
};
/** A fieldset for nesting {@link OptionCard} with MACCard styling */
export const OptionFieldset = ({ children, legend }: OptionCardFieldsetProps) => {
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
export const OptionCard = ({ title, description, to, altBg = false }: MACFieldsetOption) => {
  return (
    <label>
      <Link to={to} relative="path">
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
