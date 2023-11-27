import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Alert, LoadingSpinner } from "@/components";
import { ROUTES } from "@/routes";
import { Action, ItemResult } from "shared-types";
import { Button } from "@/components/Inputs";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { useToggleRaiWithdraw } from "@/api/useToggleRaiWithdraw";
import { PackageActionForm } from "@/pages/actions/PackageActionForm";
import { ConfirmationModal } from "@/components/Modal/ConfirmationModal";
import { useSubmissionService } from "@/api/submissionService";
import { buildActionUrl } from "@/lib";
import { useGetUser } from "@/api/useGetUser";

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
  const { id, type } = useParams<{ id: string; type: Action }>();
  const { data: user } = useGetUser();

  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);

  // const {
  //   mutate: toggleRaiWithdraw,
  //   isLoading: isToggling,
  //   isSuccess: toggleSucceeded,
  //   error: toggleError,
  // } = useToggleRaiWithdraw(id!, type!);
  const { mutate, isLoading, isSuccess, error } = useSubmissionService<{
    id: string;
  }>({
    data: { id: id! },
    endpoint: buildActionUrl(type!),
    user,
  });
  const ACTION_WORD = useMemo(
    () => (type === Action.ENABLE_RAI_WITHDRAW ? "Enable" : "Disable"),
    [type]
  );

  useEffect(() => {
    if (isSuccess) setSuccessModalOpen(true);
  }, [isSuccess]);

  if (!item) return <Navigate to={ROUTES.DASHBOARD} />; // Prevents optional chains below
  return (
    <>
      {isLoading && <LoadingSpinner />}
      <Intro action={ACTION_WORD} />
      <PackageInfo item={item} />
      {error && (
        <Alert className="mb-4 max-w-2xl" variant="destructive">
          <strong>ERROR {ACTION_WORD}ing RAI Response Withdraw: </strong>
          {error.response.data.message}
        </Alert>
      )}
      <div className="flex gap-2">
        <Button onClick={() => mutate()}>Submit</Button>
        <Button onClick={() => setCancelModalOpen(true)} variant="outline">
          Cancel
        </Button>
      </div>
      {/* Success Modal */}
      <ConfirmationModal
        open={successModalOpen}
        onAccept={() => {
          setSuccessModalOpen(false);
          navigate(`/details?id=${id}`);
        }}
        onCancel={() => setSuccessModalOpen(false)} // Should be made optional
        cancelButtonVisible={false} // Should be made optional
        title={`Formal RAI Response Withdraw Successfully ${ACTION_WORD}d`}
        body={
          <p>
            Please be aware that it may take up to a minute for changes to show
            up on the Dashboard and Details pages.
          </p>
        }
        acceptButtonText="Go to Package Details"
      />

      {/* Cancel Modal */}
      <ConfirmationModal
        open={cancelModalOpen}
        onAccept={() => {
          setCancelModalOpen(false);
          navigate(`/details?id=${id}`);
        }}
        onCancel={() => setCancelModalOpen(false)}
        cancelButtonText="Return to Form"
        acceptButtonText="Leave Page"
        title="Are you sure you want to cancel?"
        body={
          <p>If you leave this page you will lose your progress on this form</p>
        }
      />
    </>
  );
};

export const ToggleRaiResponseWithdraw = () => (
  <PackageActionForm>
    <ToggleRaiResponseWithdrawForm />
  </PackageActionForm>
);
