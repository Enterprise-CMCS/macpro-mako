import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Alert, LoadingSpinner, SimplePageContainer } from "@/components";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { ROUTES } from "@/routes";
import { Action, ItemResult } from "shared-types";
import { Button } from "@/components/Inputs";
import { useGetItem, useGetPackageActions } from "@/api";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { useMemo } from "react";
import { useToggleRaiWithdraw } from "@/api/useToggleRaiWithdraw";
import { DETAILS_AND_ACTIONS_CRUMBS } from "@/pages/actions/actions-breadcrumbs";

// Keeps aria stuff and classes condensed
const SectionTemplate = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex flex-col my-8">
    <label id="package-id-label">{label}</label>
    <span className="text-xl" aria-labelledby="package-id-label">
      {value}
    </span>
  </div>
);

const Intro = ({ action }: { action: "Enable" | "Disable" }) => (
  <div className="max-w-2xl">
    <h1 className="text-2xl font-semibold mt-4 mb-2">
      {action} Formal RAI Response Withdraw Details
    </h1>
    <p>
      {action === "Enable" &&
        "Once you submit this form, the most recent Formal RAI Response for this package will be able to be withdrawn by the state. "}
      {action === "Disable" &&
        "Once you submit this form, you will disable the previous Formal RAI Response Withdraw - Enabled action. The State will not be able to withdraw the Formal RAI Response. "}
      <strong>
        If you leave this page, you will lose your progress on this form.
      </strong>
    </p>
  </div>
);

const PackageInfo = ({ id, item }: { id: string; item: ItemResult }) => (
  <>
    <section>
      <SectionTemplate label={"Package ID"} value={id} />
      <SectionTemplate
        label={"Type"}
        value={
          removeUnderscoresAndCapitalize(item._source.planType) ||
          "No package type found"
        }
      />
    </section>
  </>
);

export const EnableRaiResponseWithdraw = () => {
  const navigate = useNavigate();
  const { id, type } = useParams<{
    id: string;
    type: Action;
  }>();
  const {
    data: item,
    isLoading: itemIsLoading,
    error: itemError,
  } = useGetItem(id!);
  const {
    data: actions,
    isLoading: actionsAreLoading,
    error: actionsError,
  } = useGetPackageActions(id!);
  const {
    mutate: toggleRaiWithdraw,
    isLoading: isToggling,
    isSuccess: toggleSucceeded,
    error: toggleError,
  } = useToggleRaiWithdraw(id!, type!);
  const ACTION_WORD = useMemo(
    () => (type === Action.ENABLE_RAI_WITHDRAW ? "Enable" : "Disable"),
    [type]
  );
  // TODO: Hook into endpoint

  if (itemIsLoading || actionsAreLoading || isToggling)
    return <LoadingSpinner />;
  return !id || !type ? (
    <Navigate to={ROUTES.DASHBOARD} />
  ) : toggleSucceeded ? (
    <Navigate
      to={`/details?id=${id}`}
      state={{
        callout: {
          heading: `Formal RAI Response Withdraw action has been ${ACTION_WORD.toLowerCase()}d`,
          body: `You have successfully ${ACTION_WORD.toLowerCase()}d the Formal RAI Response Withdraw action for the State.`,
        },
      }}
    />
  ) : (
    <SimplePageContainer>
      <BreadCrumbs
        options={DETAILS_AND_ACTIONS_CRUMBS({ id: id, action: type })}
      />
      {itemError && (
        <Alert className="my-2 max-w-2xl" variant="destructive">
          <strong>ERROR fetching item: </strong>
          {itemError.response.data.message}
        </Alert>
      )}
      {actionsError && (
        <Alert className="my-2 max-w-2xl" variant="destructive">
          <strong>ERROR fetching actions: </strong>
          {actionsError.response.data.message}
        </Alert>
      )}
      {!actionsError && !actions?.actions.includes(type) && (
        <Alert className="my-2 max-w-2xl" variant="destructive">
          <strong>ERROR: </strong>
          You cannot perform {type} on this package.
        </Alert>
      )}
      {!actionsError && !itemError && actions.actions.includes(type) && (
        <>
          <Intro action={ACTION_WORD} />
          <PackageInfo id={id} item={item} />
          {toggleError && (
            <Alert className="mb-4 max-w-2xl" variant="destructive">
              <strong>ERROR {ACTION_WORD}ing RAI Response Withdraw: </strong>
              {toggleError.response.data.message}
            </Alert>
          )}
          <div className="flex gap-2">
            <Button onClick={() => toggleRaiWithdraw()}>Submit</Button>
            <Button onClick={() => navigate(-1)} variant="outline">
              Cancel
            </Button>
          </div>
        </>
      )}
    </SimplePageContainer>
  );
};
