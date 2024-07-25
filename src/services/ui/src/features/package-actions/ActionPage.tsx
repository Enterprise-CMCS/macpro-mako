import { BreadCrumbs, FAQFooter, SimplePageContainer } from "@/components";
import { useParams } from "@/components/Routing";
import { getSetupFor } from "@/features/package-actions/lib";
import { ActionForm } from "@/features/package-actions/ActionForm";
import { detailsAndActionsCrumbs } from "@/utils";

export const ActionPage = () => {
  const { id, type, authority } = useParams("/action/:authority/:id/:type");

  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={detailsAndActionsCrumbs({
          id,
          authority,
          actionType: type,
        })}
      />
      <ActionForm setup={getSetupFor(type, authority)} />
      <FAQFooter />
    </SimplePageContainer>
  );
};
