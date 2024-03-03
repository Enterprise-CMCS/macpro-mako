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
  return (
    <div id={id} className="mb-8 border border-slate-600 p-4">
      <h2 className="text-3xl font-semibold mb-2">{title}</h2>
      <hr className="my-4 bg-gray-700 border " />

      {description && <p className="mb-4 text-sm">{description}</p>}

      {children}
    </div>
  );
};
