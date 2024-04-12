import { BreadCrumbs, FAQFooter, SimplePageContainer } from "@/components";
import { detailsAndActionsCrumbs } from "@/features";
import { useParams } from "@/components/Routing";
import { getSetupFor } from "@/features/package-actions/lib";
import { ActionForm } from "@/features/package-actions/ActionForm";

export const ActionPage = () => {
  const { id, type, authority } = useParams("/action/:authority/:id/:type");
  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={detailsAndActionsCrumbs({
          id,
          action: type!,
        })}
      />
      <ActionForm setup={getSetupFor(type, authority)} />
      <FAQFooter />
    </SimplePageContainer>
  );
};
