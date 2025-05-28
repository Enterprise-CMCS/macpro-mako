import { SectionCard } from "../Cards";

interface DetailsSectionProps {
  children: React.ReactNode;
  title: React.ReactNode;
  id: string;
  description?: string;
  className?: string;
  defaultFormat?: boolean;
}

export const DetailsSection = ({
  children,
  title,
  description,
  id,
  className,
  defaultFormat = true,
}: DetailsSectionProps) => {
  return (
    <SectionCard id={id} title={title} className={className} defaultFormat={defaultFormat}>
      {description && <p className="text-sm mb-8">{description}</p>}
      {children}
    </SectionCard>
  );
};
