import { ReactNode } from "react";

import { cn } from "@/utils";

interface GridSectionCardProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  id?: string;
  testId?: string;
}
export const GridSectionCard = ({
  title,
  children,
  className,
  id,
  testId,
}: GridSectionCardProps) => {
  return (
    <section
      data-testid={testId}
      id={id}
      className={cn("p-4 border rounded-sm border-cardBorder", className)}
    >
      {title && (
        <>
          <h1 data-testid={`${testId}-title`} className="text-3xl font-semibold mb-2 col-span-full">
            {title}
          </h1>
          <hr className="my-6 bg-slate-200 col-span-full" />
        </>
      )}
      <div data-testid={`${testId}-child`} className="two-cols-subgrid gap-y-8">
        {children}
      </div>
    </section>
  );
};
