import { documentInitializer, LoadingSpinner } from "@/components";
import { useGetForm } from "@/api";
import { useReadOnlyUser } from "../../hooks/useReadOnlyUser";
import { WebformBody } from "./WebFormBody";
import { useParams } from "react-router-dom";

export function Webform() {
  const { id, version } = useParams<{ id: string; version: string }>();

  const { data, isLoading, error } = useGetForm(id as string, version);
  const readonly = useReadOnlyUser();
  const defaultValues = data ? documentInitializer(data) : {};
  const savedData = localStorage.getItem(`${id}v${version}`);

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
