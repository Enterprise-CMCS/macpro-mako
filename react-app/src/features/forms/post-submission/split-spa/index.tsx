import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { isCmsWriteUser } from "shared-utils";

import {
  ActionForm,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  // Input,
  RequiredIndicator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { formSchemas } from "@/formSchemas";

import { SplitSpaIdInput } from "./SplitSpaIdInput";

const SPLIT_COUNT_START = 2;
const SPLIT_COUNT_END = 8;

const DEFAULT_SUFFIXES = {
  2: "A",
  3: "B",
  4: "C",
  5: "D",
  6: "E",
  7: "F",
  8: "G",
};

export const SplitSpaForm = () => {
  const { authority, id } = useParams();
  const [splitCount, setSplitCount] = useState<number>();

  const authorityType = useMemo(() => authority.replace("SPA", "").trim(), [authority]);

  return (
    <ActionForm
      schema={formSchemas["split-spa"]}
      title={`Split SPA ${authorityType} ${id}`}
      breadcrumbText="Create new split SPA(s)"
      formDescription={
        <span>
          <p className="font-semibold">Split this SPA into multiple records.</p>
          <br />
          <p>
            When you split a SPA, all attachments from the original SPA will be copied into each new
            record.
          </p>
        </span>
      }
      fields={({ control, getValues }) => {
        console.log({ getValues: getValues() });
        return (
          <>
            <section className="flex flex-col space-y-8">
              <div>
                <p className="font-bold">SPA ID</p>
                <p className="text-xl">{id}</p>
              </div>
              <div>
                <p className="font-bold">Type</p>
                <p className="text-xl">{authority}</p>
              </div>
            </section>
            <FormField
              control={control}
              name="split"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col gap-4 mb-2">
                    <FormLabel className="font-semibold">
                      {`How many split records do you want to create from base SPA ${id}?`}{" "}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormLabel>
                      Each new record will automatically be named with the base SPA ID + suffix.
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSplitCount(parseInt(value));
                      }}
                      defaultValue={`${field.value}`}
                    >
                      <SelectTrigger aria-label="Select number of splits">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(SPLIT_COUNT_END - SPLIT_COUNT_START + 1).keys()]
                          .map((x) => `${x + SPLIT_COUNT_START}`)
                          .map((index) => (
                            <SelectItem value={index} key={index}>
                              {index}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            {splitCount && (
              <section className="flex flex-col space-y-2">
                <div className="font-bold">SPAs after split</div>
                {[...Array(splitCount).keys()]
                  .map((x) => x + 1)
                  .map((index) => (
                    <FormField
                      control={control}
                      name={`spaIds.${index}`}
                      key={`spaIds-${index}`}
                      render={({ field }) => (
                        <FormItem className="max-w-sm">
                          <FormControl>
                            <div className="items-center flex leading-[2.25]">
                              <span className="font-bold mr-4">{index}.</span>
                              <SplitSpaIdInput
                                spaId={id}
                                suffix={DEFAULT_SUFFIXES[index]}
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
              </section>
            )}
          </>
        );
      }}
      submitButtonLabel="Confirm & Split SPA"
      documentPollerArgs={{ property: "spaIds", documentChecker: () => true }}
      additionalInformation={false}
      conditionsDeterminingUserAccess={[isCmsWriteUser]}
      showPreSubmissionMessage={false}
      showFAQFooter={false}
    />
  );
};
