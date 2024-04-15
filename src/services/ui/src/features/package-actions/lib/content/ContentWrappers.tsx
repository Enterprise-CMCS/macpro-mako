import { ReactNode } from "react";
import { Info } from "lucide-react";
import { Alert } from "@/components";
import { useFormContext } from "react-hook-form";

export const RequiredFieldDescription = () => (
  <p>
    <span className="text-red-500">*</span> Indicates a required field
  </p>
);

export const ActionDescription = ({ children }: { children: ReactNode }) => {
  return <div className="font-light mb-6 max-w-4xl">{children}</div>;
};

export const Heading = ({ title }: { title: string }) => {
  return <h1 className="text-2xl font-semibold mt-4 mb-2">{title}</h1>;
};

export const PreSubmitNotice = ({ message }: { message: string }) => (
  <Alert variant={"infoBlock"} className="space-x-2 mb-8">
    <Info />
    <p>{message}</p>
  </Alert>
);

export const ErrorBanner = () => {
  const form = useFormContext();
  return Object.keys(form.formState.errors).length !== 0 ? (
    <Alert className="my-6" variant="destructive">
      Input validation error(s)
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
