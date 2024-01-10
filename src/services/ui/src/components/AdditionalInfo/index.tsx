import { opensearch } from "shared-types";

export const AdditionalInfo = ({
  additionalInformation,
}: {
  additionalInformation: opensearch.main.Document["additionalInformation"];
}) => {
  return (
    <div className="flex flex-col gap-4">
      <p>
        {additionalInformation ||
          "No additional information has been submitted"}
      </p>
    </div>
  );
};
