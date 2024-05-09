import { useScrollToTop } from "@/hooks";
import { SectionCard } from "../Cards";

interface DetailsSectionProps {
  children: React.ReactNode;
  title: React.ReactNode;
  id: string;
  description?: string;
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({
  children,
  title,
  description,
  id,
}: DetailsSectionProps) => {
  useScrollToTop();
  return (
    <SectionCard id={id} title={title}>
      {description && <p className="mb-4 text-sm">{description}</p>}
      {children}
    </SectionCard>
  );
};
