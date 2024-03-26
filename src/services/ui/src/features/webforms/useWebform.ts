import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { FormSchema } from "shared-types";
import { documentInitializer } from "../../components/RHF";

interface UseWebformParams {
  values: any;
  id: string;
  version: string;
  data: FormSchema;
}

export const useWebform = ({
  id,
  version,
  data,
  values,
}: UseWebformParams): {
  form: UseFormReturn<FormSchema>;
  onSave: () => void;
  reset: () => void;
  subData: string; // Added subData to the return type
  setSubData: React.Dispatch<React.SetStateAction<string>>;
} => {
  const [subData, setSubData] = useState<string>("");

  const form = useForm<FormSchema>({
    defaultValues: values,
  });

  const onSave = (): void => {
    const values = form.getValues();
    localStorage.setItem(`${id}v${version}`, JSON.stringify(values));
    alert("Saved");
  };

  const reset = (): void => {
    setSubData("");
    form.reset(documentInitializer(data));
    localStorage.removeItem(`${id}v${version}`);
    alert("Data Cleared");
  };

  return { form, onSave, reset, subData, setSubData };
};
