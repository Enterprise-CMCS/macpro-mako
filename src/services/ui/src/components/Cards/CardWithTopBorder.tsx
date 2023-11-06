import { FC, ReactNode } from "react";
import { cn } from "@/lib";

interface CardWithTopBorderProps {
  children: ReactNode;
  className?: string;
}
export const CardWithTopBorder: FC<CardWithTopBorderProps> = ({
  children,
  className,
}: CardWithTopBorderProps) => {
  return (
    <div className={cn("mb-4 sticky top-12", className)}>
      <div
        style={{
          background: "linear-gradient(90.11deg,#0071bc 49.91%,#02bfe7 66.06%)",
          borderRadius: "3px 3px 0px 0px",
          height: "8px",
        }}
        className="h-2 shadow-lg"
      />
      <div className="border border-t-0 rounded-b-sm border-slate-300">
        {children}
      </div>
    </div>
  );
};
