import { useScrollToTop } from "@/hooks";

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
    <div id={id} className="mb-8 p-4 border rounded-sm border-slate-500">
      <h2 className="text-3xl font-semibold mb-2">{title}</h2>
      <hr className="my-4 bg-gray-700 border " />

      {description && <p className="mb-4 text-sm">{description}</p>}

      {children}
    </div>
  );
};
