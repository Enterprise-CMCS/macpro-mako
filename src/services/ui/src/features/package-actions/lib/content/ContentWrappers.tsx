import { ReactNode } from "react";
import { Info } from "lucide-react";
import { Alert } from "@/components";

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
