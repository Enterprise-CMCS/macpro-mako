import { Alert, RequiredIndicator, SectionCard } from "@/components";
import clsx from "clsx";
import { Info } from "lucide-react";
import { ReactElement, ReactNode } from "react";

export const FormSectionCard = ({
  children,
  title,
  id,
  required,
}: {
  children: ReactNode;
  title: string;
  id: string;
  description?: string;
  required?: boolean;
}) => {
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

export const RequiredFieldDescription = () => (
  <>
    <RequiredIndicator /> <em className="text-neutral-500">Indicates a required field.</em>
  </>
);

export const ProgressLossReminder = ({ className = "" }: { className?: string }) => (
  <p className={clsx("font-bold", className)}>
    If you leave this page, you will lose your progress on this form.
  </p>
);

export const ActionFormDescription = ({
  children,
  boldReminder,
}: {
  children: ReactNode;
  boldReminder?: boolean;
}) => {
  return (
    <div className="mt-4">
      {children}
      {boldReminder && <ProgressLossReminder />}
    </div>
  );
};

export const ActionFormHeading = ({ title }: { title: string }) => {
  return (
    <h1 data-testid="AFH" className="text-2xl font-semibold mt-4 mb-2">
      {title}
    </h1>
  );
};

export const PreSubmitNotice = ({
  message,
  hasProgressLossReminder = true,
}: {
  message: string | ReactElement;
  hasProgressLossReminder?: boolean;
}) => (
  <Alert variant={"infoBlock"} className="space-x-2 mb-8">
    <Info />
    {/* Wraps strings, but allows for ReactElements to declare their own wrapper */}
    {typeof message === "string" ? (
      <p>
        {message}
        {hasProgressLossReminder && <ProgressLossReminder />}
      </p>
    ) : (
      <>
        {message} {hasProgressLossReminder && <ProgressLossReminder />}
      </>
    )}
  </Alert>
);
