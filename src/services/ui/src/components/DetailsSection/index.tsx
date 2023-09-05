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
    <div id={id} className="tw-mb-8">
      <h2 className="tw-text-xl tw-font-semibold tw-mb-2">{title}</h2>
      {description && <p className="tw-mb-4 tw-text-sm">{description}</p>}

      {children}
    </div>
  );
};
