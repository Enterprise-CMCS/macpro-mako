import { LoadingSpinner, useNavigate } from "@/components";
import * as Inputs from "@/components";

import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useOriginPath } from "@/utils";

export const SubmitAndCancelBtnSection = () => {
  const form = useFormContext();
  const navigate = useNavigate();
  const originPath = useOriginPath();

  const modal = Inputs.useModalContext();
  const cancelOnAccept = useCallback(() => {
    modal.setModalOpen(false);
    navigate(originPath ? { path: originPath } : { path: "/dashboard" });
  }, []);

  return (
    <>
      {(form.formState.isSubmitting || form.formState.isSubmitSuccessful) && (
        <div className="p-4">
          <LoadingSpinner />
        </div>
      )}

      {Object.keys(form.formState.errors).length !== 0 && (
        <Inputs.Alert className="mb-6 " variant="destructive">
          Missing or malformed information. Please see errors above.
        </Inputs.Alert>
      )}

      <div className="flex gap-2 justify-end ">
        <Inputs.Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="px-12"
        >
          Submit
        </Inputs.Button>
        <Inputs.Button
          type="button"
          variant="outline"
          onClick={() => {
            modal.setContent({
              header: "Stop form submission?",
              body: "All information you've entered on this form will be lost if you leave this page.",
              acceptButtonText: "Yes, leave form",
              cancelButtonText: "Return to form",
            });
            modal.setOnAccept(() => cancelOnAccept);
            modal.setModalOpen(true);
          }}
        >
          Cancel
        </Inputs.Button>
      </div>
    </>
  );
};
