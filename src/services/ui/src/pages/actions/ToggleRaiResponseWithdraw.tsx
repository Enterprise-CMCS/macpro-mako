import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Alert, LoadingSpinner } from "@/components";
import { ROUTES } from "@/routes";
import { Action, ItemResult } from "shared-types";
import { Button } from "@/components/Inputs";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { useMemo, useState } from "react";
import { useToggleRaiWithdraw } from "@/api/useToggleRaiWithdraw";
import { PackageActionForm } from "@/pages/actions/PackageActionForm";
import { useQueryClient } from "@tanstack/react-query";

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

const PackageInfo = ({ item }: { item: ItemResult }) => (
  <>
    <section>
      <SectionTemplate label={"Package ID"} value={item._id} />
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

const ToggleRaiResponseWithdrawForm = ({ item }: { item?: ItemResult }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { id, type } = useParams<{ id: string; type: Action }>();
  const [awaitingNav, setAwaitingNav] = useState(false);
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

  if (!item) return <Navigate to={ROUTES.DASHBOARD} />; // Prevents optional chains below
  if (isToggling || awaitingNav) return <LoadingSpinner />;
  if (toggleSucceeded) {
    // Clear actions for package from cache
    qc.invalidateQueries(["actions", id]).then(() => {
      setAwaitingNav(true); // Triggers LoadingSpinner
      // Debounce back nav to give the data pipeline time to update
      setTimeout(() => {
        // Go back to package details and render success alert
        navigate(`/details?id=${id}`, {
          state: {
            callout: {
              heading: `Formal RAI Response Withdraw action has been ${ACTION_WORD.toLowerCase()}d`,
              body: `You have successfully ${ACTION_WORD.toLowerCase()}d the Formal RAI Response Withdraw action for the State.`,
            },
          },
        });
      }, 2000);
    });
  }
  return (
    <>
      <Intro action={ACTION_WORD} />
      <PackageInfo item={item} />
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
  );
};

export const ToggleRaiResponseWithdraw = () => (
  <PackageActionForm>
    <ToggleRaiResponseWithdrawForm />
  </PackageActionForm>
);
