import { useSeaTypes } from "@/api";
import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";
import { opensearch } from "shared-types";

type SubTypeSelectFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  authorityId: number;
  typeId: string;
};

export function SubTypeSelect<TFieldValues extends FieldValues>({
  control,
  typeId,
  name,
  authorityId,
}: SubTypeSelectFormFieldProps<TFieldValues>) {
  const { data } = useSeaTypes<opensearch.subtypes.Document>(
    authorityId,
    typeId
  );

  return (
    <Inputs.FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Inputs.FormItem className="max-w-sm">
          <Inputs.FormLabel className="font-semibold block">
            Sub Type <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
          <Inputs.Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={!typeId}
          >
            <Inputs.FormControl>
              <Inputs.SelectTrigger>
                <Inputs.SelectValue placeholder="Select a sub type" />
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
