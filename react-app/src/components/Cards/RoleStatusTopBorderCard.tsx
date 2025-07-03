import { FC, ReactNode } from "react";

import { cn } from "@/utils";

interface RoleStatusTopBorderCardProps {
  children: ReactNode;
  className?: string;
  status?: "pending" | "denied" | string;
}

export const RoleStatusTopBorderCard: FC<RoleStatusTopBorderCardProps> = ({
  children,
  className,
  status,
}) => {
  const isSolidHeader = status === "pending" || status === "denied";

  const headerStyle = isSolidHeader
    ? { background: "#3D4551" }
    : {
        background: "linear-gradient(90.11deg,#0071BC 49.91%,#004370 66.06%)",
      };

  return (
    <div className={cn("my-6 flex flex-col", className)}>
      <div
        style={{
          ...headerStyle,
          borderRadius: "3px 3px 0px 0px",
          height: "8px",
        }}
        className="h-2 shadow-lg"
      />
      <div className="flex-1 border border-t-0 rounded-b-sm border-slate-300">{children}</div>
    </div>
  );
};
