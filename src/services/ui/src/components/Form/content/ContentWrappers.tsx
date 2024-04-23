import { ReactElement, ReactNode, useMemo } from "react";
import { Info } from "lucide-react";
import { Alert, RequiredIndicator } from "@/components";
import { useFormContext } from "react-hook-form";

export const RequiredFieldDescription = () => (
  <p>
    <RequiredIndicator /> Indicates a required field
  </p>
);

export const ActionFormDescription = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <div className="font-light mb-8 max-w-4xl">{children}</div>;
};

export const ActionFormHeading = ({ title }: { title: string }) => {
  return <h1 className="text-2xl font-semibold mt-4 mb-2">{title}</h1>;
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
