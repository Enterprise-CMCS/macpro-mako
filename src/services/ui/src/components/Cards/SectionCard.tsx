import { FC, ReactNode } from "react";
import { cn } from "@/lib";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  title: string;
}
export const SectionCard: FC<SectionCardProps> = ({
  title,
  children,
  className,
}: SectionCardProps) => {
  return (
    <div className={cn("border-2 border-slate-300 w-5/6 p-4", className)}>
      <section>
        <h1 className="font-bold text-2xl">{title}</h1>
        <div className="border-t-2 border-slate-300 w-full mt-2 mb-4" />
        <div className="gap-8 flex flex-col">{children}</div>
      </section>
    </div>
  );
};
