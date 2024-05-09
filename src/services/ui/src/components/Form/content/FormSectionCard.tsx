import { SectionCard } from "@/components/Cards";
import { RequiredIndicator } from "./RequiredIndicator";

interface FormSectionCardProps {
  children: React.ReactNode;
  title: React.ReactNode;
  id: string;
  description?: string;
  required?: boolean;
}

export const FormSectionCard: React.FC<FormSectionCardProps> = ({
  children,
  title,
  id,
  required,
}: FormSectionCardProps) => {
  return (
    <SectionCard
      id={id}
      title={
        <>
          {title} {required && <RequiredIndicator />}
        </>
      }
    >
      {children}
    </SectionCard>
  );
};
