import { OsMainSourceItem } from "shared-types";

export const AdditionalInfo = ({
  additionalInformation,
}: {
  additionalInformation: OsMainSourceItem["additionalInformation"];
}) => {
  return (
    <div className="flex flex-col gap-4">
      <p>{additionalInformation || "None"}</p>
    </div>
  );
};
