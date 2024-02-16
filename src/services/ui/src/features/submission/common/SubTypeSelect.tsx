import { useGetSeaSubTypes } from "@/api";
import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";

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
  const { data } = useGetSeaSubTypes(authorityId, typeId);

  return (
    <Inputs.FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Inputs.FormItem className="max-w-sm">
          <Inputs.FormLabel className="text-lg font-bold block">
            Sub Type <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
          <Inputs.Select
            onValueChange={field.onChange}
            defaultValue={field.value}
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
