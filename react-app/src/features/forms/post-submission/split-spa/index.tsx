import { useMemo } from "react";
import { useParams } from "react-router";
import { CognitoUserAttributes } from "shared-types";
import { isCmsWriteUser } from "shared-utils";

import { useGetUser } from "@/api";
import {
  ActionForm,
  FormControl,
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

export const SplitSpaForm = () => {
  const { data: user } = useGetUser();
  const { authority, id } = useParams();

  const authorityType = useMemo(() => authority.replace("SPA", "").trim(), [authority]);

  return (
    // <div>
    //   <div>Id: {id}</div>
    //   <div>Authority: {authority}</div>
    //   <div>User: {JSON.stringify(user)}</div>
    // </div>
    <ActionForm
      schema={formSchemas["split-spa"]}
      title={`Split SPA ${authorityType} ${id}`}
      breadcrumbText="Create new split SPA(s)"
      formDescription={
        <span>
          <p className="font-semibold">Split this SPA into multiple records.</p>
          <br />
          When you split a SPA, all attachments from the original SPA will be copied into each new
          record.
        </span>
      }
      fields={({ control, setValue }) => (
        <>
          <div className="-mb-4">
            <p className="font-semibold">SPA ID</p>
            <div className="leading-[1.62]">{id}</div>
          </div>
          <div className="-mb-4">
            <p className="font-semibold">Type</p>
            <div className="leading-[1.62]">{authority}</div>
          </div>
          <FormField
            control={control}
            name="split"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-4">
                  <FormLabel className="font-semibold">
                    {`How many split records do you want to create from base SPA ${id}`}{" "}
                    <RequiredIndicator />
                  </FormLabel>
                  <FormLabel>
                    Each new record will automatically be named with the base SPA ID + suffix.
                  </FormLabel>
                </div>
                <FormControl>
                  <Select>
                    <SelectTrigger aria-label="Select number of splits">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2" key="2">
                        2
                      </SelectItem>
                      <SelectItem value="3" key="3">
                        3
                      </SelectItem>
                      <SelectItem value="4" key="4">
                        4
                      </SelectItem>
                      <SelectItem value="5" key="5">
                        5
                      </SelectItem>
                      <SelectItem value="6" key="6">
                        6
                      </SelectItem>
                      <SelectItem value="7" key="7">
                        7
                      </SelectItem>
                      <SelectItem value="8" key="8">
                        8
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </>
      )}
      documentPollerArgs={{ property: "spaIds", documentChecker: () => true }}
      additionalInformation={false}
      conditionsDeterminingUserAccess={[isCmsWriteUser]}
      showPreSubmissionMessage={false}
      showFAQFooter={false}
    />
  );
};
