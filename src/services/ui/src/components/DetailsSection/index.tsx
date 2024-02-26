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
    <div id={id} className="mb-8 border-[1px] p-4">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <hr className="my-4" />

      {description && <p className="mb-4 text-sm">{description}</p>}

      {children}
    </div>
  );
};
