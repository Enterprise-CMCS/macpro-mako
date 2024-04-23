import { Button, useModalContext } from "@/components";
import { useNavigation, useNavigate } from "react-router-dom";

/** Action form submission buttons. Use the `confirmWithdraw` prop when performing
 * a destructive action like a withdrawal. */
export const SubmissionButtons = ({
  confirmWithdraw,
}: {
  confirmWithdraw?: () => void;
}) => {
  const { state } = useNavigation();
  const modal = useModalContext();
  const navigate = useNavigate();

  const acceptAction = () => {
    modal.setModalOpen(false);
    navigate(-1);
  };

  return (
    <section className="space-x-2 mb-8">
      {confirmWithdraw && (
        <Button
          type={"button"}
          onClick={() => confirmWithdraw()}
          disabled={state === "submitting"}
        >
          Submit
        </Button>
      )}
      {!confirmWithdraw && (
        <Button type={"submit"} disabled={state === "submitting"}>
          Submit
        </Button>
      )}
      <Button
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
        disabled={state === "submitting"}
      >
        Cancel
      </Button>
    </section>
  );
};
