export const HowItWorks = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="tw-py-8 tw-px-6 tw-border tw-border-gray-300 tw-rounded-md tw-border-solid tw-w-full">
      <h4 className="text-bold tw-text-xl">How it works</h4>
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
    <div className="tw-flex tw-gap-4 tw-items-center tw-mt-4">
      {icon}
      <div className="">
        <p className="text-bold">{title}</p>
        <p className="">{content}</p>
      </div>
    </div>
  );
};
