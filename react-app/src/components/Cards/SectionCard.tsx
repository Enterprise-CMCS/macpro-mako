import { ReactNode } from "react";
import { cn } from "@/utils";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  id?: string;
}
export const SectionCard = ({ title, children, className, id }: SectionCardProps) => {
  return (
    <section id={id} className={cn("p-4 border rounded-sm border-cardBorder", className)}>
      {title && (
        <>
          <h1 className="text-3xl font-semibold mb-2">{title}</h1>
          <hr className="my-6 bg-slate-200" />
        </>
      )}
      <div className="gap-8 flex flex-col">{children}</div>
    </section>
  );
};
