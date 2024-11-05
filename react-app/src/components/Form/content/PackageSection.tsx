import { getAuthorityLabel, getIdLabel } from "@/utils";
import { useParams } from "react-router-dom";
import { AuthorityUnion } from "shared-types";

export const PackageSection = () => {
  const { id, authority } = useParams<{
    id: string;
    authority: AuthorityUnion;
  }>();

  return (
    <section className="flex flex-col mb-8 space-y-8">
      <div>
        <p>{getIdLabel(authority)}</p>
        <p className="text-xl">{id}</p>
      </div>
      <div>
        <p>Authority</p>
        <p className="text-xl">{getAuthorityLabel(authority)}</p>
      </div>
    </section>
  );
};
