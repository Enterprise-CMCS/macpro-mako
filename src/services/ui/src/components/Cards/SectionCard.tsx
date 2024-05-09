import { FC, ReactNode } from "react";
import { cn } from "@/utils";
import { RequiredIndicator } from "../Inputs";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  title: string;
  id?: string;
  required?: boolean;
}
export const SectionCard: FC<SectionCardProps> = ({
  title,
  children,
  className,
  id,
  required,
}: SectionCardProps) => {
  return (
    <div
      id={id}
      className={cn("mb-8 p-4 border rounded-sm border-slate-500", className)}
    >
      <section>
        <h2 className="text-3xl font-semibold mb-2">
          {title}
          {required && <RequiredIndicator />}
        </h2>
        <hr className="my-4 bg-gray-700 border " />
        <div className="gap-8 flex flex-col">{children}</div>
      </section>
    </div>
  );
};
