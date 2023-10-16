import { FC, ReactNode } from "react";

interface CardWithTopBorderProps {
  children: ReactNode;
}
export const CardWithTopBorder: FC<CardWithTopBorderProps> = ({
  children,
}: CardWithTopBorderProps) => {
  return (
    <div className="mb-4 sticky top-12">
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
