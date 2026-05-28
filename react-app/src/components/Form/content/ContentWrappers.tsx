import clsx from "clsx";
import { Info } from "lucide-react";
import { ReactElement, ReactNode } from "react";

import { Alert, RequiredIndicator, SectionCard } from "@/components";

export const FormSectionCard = ({
  children,
  title,
  id,
  required,
  childrenClassName,
}: {
  children: ReactNode;
  title: string;
  id: string;
  description?: string;
  required?: boolean;
  childrenClassName?: string;
}) => {
  return (
    <SectionCard
      id={id}
      title={
        <>
          {title} {required && <RequiredIndicator />}
        </>
      }
      childrenClassName={childrenClassName}
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

export const DEFAULT_PROGRESS_LOSS_REMINDER =
  "If you leave this page, you will lose your progress on this form.";

export const ProgressLossReminder = ({
  className = "",
  children = DEFAULT_PROGRESS_LOSS_REMINDER,
}: {
  className?: string;
  children?: ReactNode;
}) => <p className={clsx("font-bold", className)}>{children}</p>;

export const ActionFormDescription = ({
  children,
  boldReminder,
  progressLossReminder,
}: {
  children: ReactNode;
  boldReminder?: boolean;
  progressLossReminder?: ReactNode;
}) => {
  return (
    <div className="mt-4">
      {children}
      {boldReminder && <ProgressLossReminder>{progressLossReminder}</ProgressLossReminder>}
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
