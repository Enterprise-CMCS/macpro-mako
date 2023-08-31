interface CardWithTopBorderProps {
  children: React.ReactNode;
}

export const CardWithTopBorder: React.FC<CardWithTopBorderProps> = ({
  children,
}: CardWithTopBorderProps) => {
  return (
    <div className="tw-border tw-rounded-sm tw-border-slate-300 tw-mb-4 tw-grow md:tw-max-w-sm">
      <div
        style={{
          background: "linear-gradient(90.11deg,#0071bc 49.91%,#02bfe7 66.06%)",
        }}
        className="tw-h-2 tw-shadow-lg"
      />
      <div className="tw-p-4">{children}</div>
    </div>
  );
};
