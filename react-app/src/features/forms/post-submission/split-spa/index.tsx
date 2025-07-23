import { useParams } from "react-router";

import {
  ActionForm,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  RequiredIndicator,
} from "@/components";
import { formSchemas } from "@/formSchemas";

export const SplitSpaForm = () => {
  const { authority, id } = useParams();
  return (
    <ActionForm
      schema={formSchemas["split-spa"]}
      title={`Split SPA ${authority} ${id}`}
      breadcrumbText={`Split ${authority} SPA`}
      fields={({ control, setValue }) => (
        <div className="flex flex-col">
          <FormLabel className="font-semibold" htmlFor="">
            {`Split SPA`}
          </FormLabel>
          {/* <FormField
          control={control}
            name
          /> */}
        </div>
      )}
      documentPollerArgs={{ property: "spaIds", documentChecker: () => true }}
    />
  );
};
