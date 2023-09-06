interface DetailsSectionProps {
  children: React.ReactNode;
  title: string;
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
    <div id={id} className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {description && <p className="mb-4 text-sm">{description}</p>}

      {children}
    </div>
  );
};
