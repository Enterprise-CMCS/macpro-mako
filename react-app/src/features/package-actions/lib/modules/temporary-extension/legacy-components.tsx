import { Link, useParams } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import {
  FAQ_TAB,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RequiredIndicator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import type { defaultTempExtSchema } from "@/features/package-actions/lib/modules";

export const TEPackageSection = () => {
  const { id, authority } = useParams();
  const type = id?.split(".")[1]?.includes("00") ? "Initial" : "Renewal";
  const { setValue } = useFormContext<z.infer<typeof defaultTempExtSchema>>();

  if (id && authority) {
    setValue("originalWaiverNumber", id);
    setValue("authority", authority);
  }

  return (
    <section className="flex flex-col mb-8 space-y-8">
      {/* If ID exists show these */}
      {id && (
        <>
          <div>
            <p>Temporary Extension Type</p>
            <p className="text-xl">{authority}</p>
          </div>

          <div>
            <p>Approved Initial or Renewal Waiver Number</p>
            <p className="text-xl">{id}</p>
          </div>
          <IdInput />
          <div>
            <p>Type</p>
            <p className="text-xl">
              {authority} Waiver {type}
            </p>
          </div>
        </>
      )}
      {/* Otherwise collect the following fields */}
      {/* Set the fields that are required by default when they don't need to be collected */}
      {!id && (
        <>
          <TempExtensionTypeDropDown />
          <TempExtensionApproveOrRenewNumber />
          <IdInput />
        </>
      )}
    </section>
  );
};

const IdInput = () => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <strong className="font-bold">
              Temporary Extension Request Number
              <RequiredIndicator />
            </strong>
            <Link
              className="text-blue-600 cursor-pointer hover:underline px-4"
              to={"/faq/waiver-extension-id-format"}
              target={FAQ_TAB}
              rel="noopener noreferrer"
            >
              What is my Temporary Extension Request Number?
            </Link>
          </FormLabel>
          <FormDescription className="max-w-md">
            Must use a waiver extension request number with the format
            SS-####.R##.TE## or SS-#####.R##.TE##
          </FormDescription>
          <FormControl>
            <Input
              {...field}
              className="max-w-md"
              onInput={(e) => {
                if (e.target instanceof HTMLInputElement) {
                  e.target.value = e.target.value.toUpperCase();
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const TempExtensionTypeDropDown = () => {
  const { control } = useFormContext<z.infer<typeof defaultTempExtSchema>>();

  return (
    <FormField
      name="authority"
      control={control}
      render={({ field }) => (
        <FormItem className="max-w-xs">
          <FormLabel>
            <strong className="font-bold">Temporary Extension Type</strong>{" "}
            <RequiredIndicator />
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="-- select a temporary extension type --" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="1915(b)">1915(b)</SelectItem>
              <SelectItem value="1915(c)">1915(c)</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const TempExtensionApproveOrRenewNumber = () => {
  const { control, trigger } =
    useFormContext<z.infer<typeof defaultTempExtSchema>>();

  return (
    <FormField
      name="originalWaiverNumber"
      control={control}
      render={({ field }) => {
        return (
          <FormItem className="max-w-md">
            <FormLabel>
              <strong className="font-bold">
                Approved Initial or Renewal Waiver Number
              </strong>{" "}
              <RequiredIndicator />
            </FormLabel>
            <FormDescription>
              Enter the existing waiver number in the format it was approved,
              using a dash after the two character state abbreviation.
            </FormDescription>
            <FormControl>
              <Input
                {...field}
                onInput={(e) => {
                  trigger("authority");
                  if (e.target instanceof HTMLInputElement) {
                    e.target.value = e.target.value.toUpperCase();
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
