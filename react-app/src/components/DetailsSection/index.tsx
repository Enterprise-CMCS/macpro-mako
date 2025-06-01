import { SectionCard } from "../Cards";

interface DetailsSectionProps {
  children: React.ReactNode;
  title: React.ReactNode;
  id: string;
  description?: string;
  className?: string;
  childrenClassName?: string;
}

export const DetailsSection = ({
  children,
  title,
  description,
  id,
  className,
  childrenClassName,
}: DetailsSectionProps) => {
  return (
    <SectionCard id={id} title={title} className={className} childrenClassName={childrenClassName}>
      {description && <p className="text-sm">{description}</p>}
      {children}
    </SectionCard>
  );
};
