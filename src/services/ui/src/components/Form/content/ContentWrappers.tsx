import { ReactElement, ReactNode, useMemo } from "react";
import { Info } from "lucide-react";
import {
  Alert,
  RequiredIndicator,
  PackageSection,
  SectionCard,
} from "@/components";
import { useFormContext } from "react-hook-form";

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
    <RequiredIndicator />{" "}
    <em className="font-light">Indicates a required field.</em>
  </>
);

export const ActionFormDescription = ({
  children,
  boldReminder,
}: {
  children: ReactNode;
  boldReminder?: boolean;
}) => {
  return (
    <div className="mt-4 text-gray-700 font-light">
      {children}
      {boldReminder && (
        <span className="font-bold">
          If you leave this page, you will lose your progress on this form.
        </span>
      )}
    </div>
  );
};

export const ActionFormHeading = ({ title }: { title: string }) => {
  return <h1 className="text-2xl font-semibold mt-4 mb-2">{title}</h1>;
};

export const ActionFormHeaderCard = ({
  title,
  hasRequiredField,
  children,
}: {
  title: string;
  hasRequiredField?: boolean;
  children: ReactNode;
}) => {
  return (
    <FormSectionCard id="action-form-header-card" title={title}>
      <div className="font-light">
        {hasRequiredField && <RequiredFieldDescription />}
        {children}
      </div>
      <PackageSection />
    </FormSectionCard>
  );
};

export const PreSubmitNotice = ({
  message,
}: {
  message: string | ReactElement;
}) => (
  <Alert variant={"infoBlock"} className="space-x-2 mb-8">
    <Info />
    {/* Wraps strings, but allows for ReactElements to declare their own wrapper */}
    {typeof message === "string" ? <p>{message}</p> : message}
  </Alert>
);

export const ErrorBanner = () => {
  const form = useFormContext();
  const errorLen = useMemo(
    () => Object.keys(form.formState.errors).length,
    [form.formState.errors],
  );
  const errorLanguage = useMemo(
    () =>
      errorLen > 1 ? "Input validation error(s)" : "Input validation error",
    [errorLen],
  );
  return errorLen !== 0 ? (
    <Alert className="my-6" variant="destructive">
      {errorLanguage}
      <ul className="list-disc">
        {Object.values(form.formState.errors).map(
          (err, idx) =>
            err?.message && (
              <li className="ml-8 my-2" key={idx}>
                {err.message as string}
              </li>
            ),
        )}
      </ul>
    </Alert>
  ) : null;
};
