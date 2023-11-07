import { Navigate, useParams } from "react-router-dom";
import { Alert, LoadingSpinner, SimplePageContainer } from "@/components";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { BREAD_CRUMB_CONFIG_PACKAGE_DETAILS } from "@/components/BreadCrumb/bread-crumb-config";
import { ROUTES } from "@/routes";
import { Action, ItemResult } from "shared-types";
import { Button } from "@/components/Inputs";
import { useGetItem, useGetPackageActions } from "@/api";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { useMemo } from "react";
import { useToggleRaiWithdraw } from "@/api/useToggleRaiWithdraw";

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
    <h1 className="text-2xl font-semibold mt-8 mb-2">
      {action} RAI Response Withdraw
    </h1>
    {action === "Enable" && (
      <p>
        Once you submit this form, the most recent Formal RAI Response for this
        package will be able to be withdrawn by the state.{" "}
        <b>If you leave this page, you will lose your progress on this form.</b>
      </p>
    )}
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
    error: toggleError,
  } = useToggleRaiWithdraw(id!, type!);
  const ACTION_WORD = useMemo(
    () => (type === Action.ENABLE_RAI_WITHDRAW ? "Enable" : "Disable"),
    [type]
  );
  // TODO: Hook into endpoint

  if (itemIsLoading || actionsAreLoading) return <LoadingSpinner />;
  return !id || !type ? (
    <Navigate to={ROUTES.DASHBOARD} />
  ) : (
    <SimplePageContainer>
      <BreadCrumbs
        options={BREAD_CRUMB_CONFIG_PACKAGE_DETAILS({ id: id, action: type })}
      />
      {itemError && (
        <Alert variant="destructive">
          <b>ERROR fetching item: </b>
          {itemError.response.data.message}
        </Alert>
      )}
      {actionsError && (
        <Alert variant="destructive">
          <b>ERROR fetching actions: </b>
          {actionsError.response.data.message}
        </Alert>
      )}
      {!actionsError && !actions?.actions.includes(type) && (
        <Alert variant="destructive">
          <b>ERROR: </b>
          You cannot perform {type} on this package.
        </Alert>
      )}
      {!actionsError && !itemError && actions.actions.includes(type) && (
        <>
          <Intro action={ACTION_WORD} />
          <PackageInfo id={id} item={item} />
          <div className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>{ACTION_WORD} RAI Response Withdraw</Button>
          </div>
        </>
      )}
    </SimplePageContainer>
  );
};
