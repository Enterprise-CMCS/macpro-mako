import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";

type TypeSubTypeSelectFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  typeName: Path<TFieldValues>;
  subTypeName: Path<TFieldValues>;
  authorityId: number;
};

export function TypeSubTypeSelect<TFieldValues extends FieldValues>({
  control,
  typeName,
  subTypeName,
  authorityId,
}: TypeSubTypeSelectFormFieldProps<TFieldValues>) {
  console.log({ authorityId });
  return (
    <>
      <Inputs.FormField
        control={control}
        name={typeName}
        render={({ field }) => (
          <Inputs.FormItem className="max-w-sm">
            <Inputs.FormLabel className="text-lg font-bold block">
              Service Type <Inputs.RequiredIndicator />
            </Inputs.FormLabel>
            <Inputs.Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <Inputs.FormControl>
                <Inputs.SelectTrigger>
                  <Inputs.SelectValue placeholder="Select a service type" />
                </Inputs.SelectTrigger>
              </Inputs.FormControl>
              <Inputs.SelectContent>
                {/* map through some options here */}
                <Inputs.SelectItem value="125">Medicaid SPA</Inputs.SelectItem>
              </Inputs.SelectContent>
            </Inputs.Select>
            <Inputs.FormMessage />
          </Inputs.FormItem>
        )}
      />
      <Inputs.FormField
        control={control}
        name={subTypeName}
        render={({ field }) => (
          <Inputs.FormItem className="max-w-sm">
            <Inputs.FormLabel className="text-lg font-bold block">
              Service Sub Type <Inputs.RequiredIndicator />
            </Inputs.FormLabel>
            <Inputs.Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <Inputs.FormControl>
                <Inputs.SelectTrigger>
                  <Inputs.SelectValue placeholder="Select a service sub-type" />
                </Inputs.SelectTrigger>
              </Inputs.FormControl>
              <Inputs.SelectContent>
                {/* map through some options here */}
                <Inputs.SelectItem value="782">
                  Copays/Deductibles/Coinsurance
                </Inputs.SelectItem>
                <Inputs.SelectItem value="783">
                  Premiums/Enrollment Fees
                </Inputs.SelectItem>
                <Inputs.SelectItem value="784">
                  Aged/Blind/Disabled Eligibility
                </Inputs.SelectItem>
                <Inputs.SelectItem value="785">Application</Inputs.SelectItem>
                {/* map through some options here */}
              </Inputs.SelectContent>
            </Inputs.Select>
            <Inputs.FormMessage />
          </Inputs.FormItem>
        )}
      />
    </>
  );
}
