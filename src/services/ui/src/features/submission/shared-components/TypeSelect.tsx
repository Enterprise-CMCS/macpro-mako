import { useSeaTypes } from "@/api";
import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";
import { opensearch } from "shared-types";

type TypeSelectFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  authorityId: number;
};

export function TypeSelect<TFieldValues extends FieldValues>({
  control,
  name,
  authorityId,
}: TypeSelectFormFieldProps<TFieldValues>) {
  const { data } = useSeaTypes<opensearch.types.Document>(authorityId);

  return (
    <Inputs.FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Inputs.FormItem className="max-w-sm">
          <Inputs.FormLabel className="font-semibold block">
            Type <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
          <Inputs.Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <Inputs.FormControl>
              <Inputs.SelectTrigger>
                <Inputs.SelectValue placeholder="Select a type" />
              </Inputs.SelectTrigger>
            </Inputs.FormControl>
            <Inputs.SelectContent>
              {data &&
                data.map((T) => (
                  <Inputs.SelectItem key={T.id} value={String(T.id)}>
                    {T.name}
                  </Inputs.SelectItem>
                ))}
            </Inputs.SelectContent>
          </Inputs.Select>
          <Inputs.FormMessage />
        </Inputs.FormItem>
      )}
    />
  );
}
