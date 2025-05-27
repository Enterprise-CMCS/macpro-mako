import { GridSectionCard } from "../Cards";

interface GridDetailsSectionProps {
  children: React.ReactNode;
  title: React.ReactNode;
  id: string;
  description?: string;
  className?: string;
}

export const GridDetailsSection = ({
  children,
  title,
  description,
  id,
  className,
}: GridDetailsSectionProps) => {
  return (
    <GridSectionCard id={id} title={title} className={className}>
      {description && <p className="text-sm col-span-full">{description}</p>}
      {children}
    </GridSectionCard>
  );
};
