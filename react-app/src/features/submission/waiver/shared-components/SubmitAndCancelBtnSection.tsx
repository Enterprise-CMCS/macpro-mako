import { Button } from "@/components";
import { userPrompt } from "@/components";
import { useNavigate, useParams } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { getFormOrigin } from "@/utils";
import { Authority } from "shared-types";

interface buttonProps {
  confirmWithdraw?: () => void;
  enableSubmit?: boolean;
}

export const SubmitAndCancelBtnSection = ({
  confirmWithdraw,
  enableSubmit,
}: buttonProps) => {
  const form = useFormContext();
  const navigate = useNavigate();
  const { id, authority } = useParams<{ id: string; authority: Authority }>();

  const acceptAction = () => {
    const origin = getFormOrigin({ id, authority });
    navigate(origin);
  };

  // adding this so we can overwrite the disable submit functionality
  //      specifically for enable/disable RAI withdrawl
  const disableSubmit = useMemo(() => {
    if (enableSubmit) return false;
    else return !form.formState.isValid;
  }, [form.formState.isValid]);

  return (
    <section className="flex justify-end gap-2 p-4 ml-auto">
      <Button
        className="px-12"
        type={confirmWithdraw ? "button" : "submit"}
        onClick={confirmWithdraw ? confirmWithdraw : () => null}
        disabled={disableSubmit}
      >
        Submit
      </Button>
      <Button
        className="px-12"
        onClick={() => {
          userPrompt({
            header: "Stop form submission?",
            body: "All information you've entered on this form will be lost if you leave this page.",
            acceptButtonText: "Yes, leave form",
            cancelButtonText: "Return to form",
            onAccept: acceptAction,
            areButtonsReversed: true,
          });
        }}
        variant={"outline"}
        type="reset"
      >
        Cancel
      </Button>
    </section>
  );
};
