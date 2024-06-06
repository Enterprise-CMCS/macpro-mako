import { LoadingSpinner, useModalContext, Button } from "@/components";
import * as Inputs from "@/components";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { useMemo } from "react";

interface buttonProps {
  loadingSpinner?: boolean;
  showAlert?: boolean;
  confirmWithdraw?: () => void;
  cancelNavigationLocation?: string;
  enableSubmit?: boolean;
}

export const SubmitAndCancelBtnSection = ({
  loadingSpinner,
  showAlert,
  confirmWithdraw,
  cancelNavigationLocation,
  enableSubmit,
}: buttonProps) => {
  const form = useFormContext();
  const modal = useModalContext();
  const navigate = useNavigate();

  const acceptAction = () => {
    modal.setModalOpen(false);
    if (cancelNavigationLocation) {
      navigate(cancelNavigationLocation);
    } else {
      navigate(-1);
    }
  };

  // adding this so we can overwrite the disable submit functionality
  //      specifically for enable/disable RAI withdrawl
  const disableSubmit = useMemo(() => {
    if (enableSubmit) return false;
    else return !form.formState.isValid;
  }, [form.formState.isValid]);

  return (
    <>
      {loadingSpinner && form.formState.isSubmitting && (
        <div className="p-4">
          <LoadingSpinner />
        </div>
      )}

      {showAlert && Object.keys(form.formState.errors).length !== 0 && (
        <Inputs.Alert className="mb-6 " variant="destructive">
          Missing or malformed information. Please see errors above.
        </Inputs.Alert>
      )}

      <section className="flex justify-end gap-2 p-4 ml-auto">
        <Button
          className="px-12"
          type={confirmWithdraw ? "button" : "submit"}
          onClick={confirmWithdraw ? () => confirmWithdraw() : () => null}
          disabled={disableSubmit}
        >
          Submit
        </Button>
        <Button
          className="px-12"
          onClick={() => {
            modal.setContent({
              header: "Stop form submission?",
              body: "All information you've entered on this form will be lost if you leave this page.",
              acceptButtonText: "Yes, leave form",
              cancelButtonText: "Return to form",
            });
            modal.setOnAccept(() => acceptAction);
            modal.setModalOpen(true);
          }}
          variant={"outline"}
          type="reset"
        >
          Cancel
        </Button>
      </section>
    </>
  );
};
