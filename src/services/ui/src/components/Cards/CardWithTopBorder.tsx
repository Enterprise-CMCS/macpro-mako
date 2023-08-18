interface CardWithTopBorderProps {
  children: React.ReactNode;
}

export const CardWithTopBorder: React.FC<CardWithTopBorderProps> = ({
  children,
}: CardWithTopBorderProps) => {
  return (
    <div className="border rounded-sm border-slate-300 mb-4 grow md:max-w-sm">
      <div
        style={{
          background: "linear-gradient(90.11deg,#0071bc 49.91%,#02bfe7 66.06%)",
        }}
        className="h-2 shadow-lg"
      />
      <div className="p-4">{children}</div>
    </div>
  );
};
