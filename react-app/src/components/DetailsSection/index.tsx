import { SectionCard } from "../Cards";

interface DetailsSectionProps {
  children: React.ReactNode;
  title: React.ReactNode;
  id: string;
  description?: string;
}

export const DetailsSection = ({ children, title, description, id }: DetailsSectionProps) => {
  return (
    <SectionCard id={id} title={title}>
      {description && <p className="text-sm">{description}</p>}
      {children}
    </SectionCard>
  );
};
