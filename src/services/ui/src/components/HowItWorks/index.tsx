export const HowItWorks = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="py-8 px-6 border border-gray-300 rounded-md border-solid max-w-sm">
      <h4 className="text-bold text-xl">How it works</h4>
      {children}
    </div>
  );
};

export type StepProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  content: React.ReactNode;
};

export const Step = ({ icon, content, title }: StepProps) => {
  return (
    <div className="flex gap-4 items-center mt-4">
      {icon}
      <div className="">
        <p className="text-bold">{title}</p>
        <p className="">{content}</p>
      </div>
    </div>
  );
};
