import { OsMainSourceItem } from "shared-types";

export const AdditionalInfo = ({
  additionalInformation,
}: {
  additionalInformation: OsMainSourceItem["additionalInformation"];
}) => {
  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      <p>{additionalInformation || "None"}</p>
    </div>
  );
};
