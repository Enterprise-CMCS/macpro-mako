import * as React from "react";
import { useParams } from "react-router";
import { isCmsWriteUser } from "shared-utils";

import {
  ActionForm,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  Input,
  RequiredIndicator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { formSchemas } from "@/formSchemas";

import { SplitSpaIdsForm } from "./SplitSpaIdsForm";

const SPLIT_COUNT_START = 2;
const SPLIT_COUNT_END = 8;

const SPLIT_COUNT_OPTIONS = [...Array(SPLIT_COUNT_END - SPLIT_COUNT_START + 1).keys()].map(
  (x) => `${x + SPLIT_COUNT_START}`,
);

export const SplitSpaForm = () => {
  const { authority, id } = useParams();
  const [splitCount, setSplitCount] = React.useState<number>();

  const authorityType = React.useMemo(() => authority.replace("SPA", "").trim(), [authority]);

  return (
    <ActionForm
      schema={formSchemas["split-spa"]}
      title={`Split SPA ${authorityType} ${id}`}
      breadcrumbText="Create new split SPA(s)"
      defaultValues={{
        spaIds: [],
      }}
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
      fields={({ control }) => (
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
            name="splitCount"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-4 mb-2">
                  <FormLabel className="font-semibold">
                    How many split records do you want to create from base SPA {id}?{" "}
                    <RequiredIndicator />
                  </FormLabel>
                  <FormDescription>
                    Each new record will automatically be named with the base SPA ID + suffix.
                  </FormDescription>
                </div>
                <div className="max-w-sm">
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
                        {SPLIT_COUNT_OPTIONS.map((index) => (
                          <SelectItem value={index} key={index}>
                            {index}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          <SplitSpaIdsForm control={control} spaId={id} splitCount={splitCount} />
          {splitCount && (
            <FormField
              control={control}
              name="requestor"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col gap-y-2">
                    <FormLabel className="font-bold">
                      These packages were added to OneMAC per request from <RequiredIndicator />
                    </FormLabel>
                    <FormDescription className="italic text-gray-500 text-sm">
                      CMS person who request this action on behalf of the state
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Input
                      className="max-w-sm"
                      value={field.value}
                      onChange={field.onChange}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </>
      )}
      submitButtonLabel="Confirm & Split SPA"
      documentPollerArgs={{ property: "spaIds", documentChecker: () => true }}
      additionalInformation={false}
      conditionsDeterminingUserAccess={[isCmsWriteUser]}
      showPreSubmissionMessage={false}
      showFAQFooter={false}
    />
  );
};
