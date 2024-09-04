import { documentInitializer, LoadingSpinner } from "@/components";
import { useGetForm } from "@/api";
import { useReadOnlyUser } from "../../hooks/useReadOnlyUser";
import { WebformBody } from "./WebFormBody";
import { useParams } from "react-router-dom";
import { getUserStateCodes } from "@/utils";
import { usePopulationData } from "@/api";
import { FULL_STATES } from "shared-types";
import { useUserContext } from "@/components";

export function Webform() {
  const { id, version } = useParams<{ id: string; version: string }>();

  const { data, isLoading, error } = useGetForm(id as string, version);
  const readonly = useReadOnlyUser();
  const defaultValues = data ? documentInitializer(data) : {};
  const savedData = localStorage.getItem(`${id}v${version}`);
  const userContext = useUserContext();
  const stateCodes = getUserStateCodes(userContext?.user);
  console.log(stateCodes);
  console.log(data);

  const stateNumericCodesString = stateCodes
    .map((code) => {
      return FULL_STATES.find((state) => state.value === code)?.code;
    })
    .filter((code) => code !== "00")
    ?.join();
  console.log(stateNumericCodesString);
  const { data: datas } = usePopulationData(stateNumericCodesString);

  console.log(datas);
  if (isLoading) return <LoadingSpinner />;
  if (error || !data) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
        {`There was an error loading ${id}`}
      </div>
    );
  }

  return (
    <WebformBody
      data={data}
      readonly={readonly}
      id={id}
      version={version}
      values={savedData ? JSON.parse(savedData) : defaultValues}
    />
  );
}
