import { ConfirmationModal } from "@/components";

import { Dispatch, PropsWithChildren, SetStateAction, useState } from "react";
import { createContextProvider } from "@/utils";
import { useNavigate } from "@/components/Routing";

type ModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const Success = ({ open, setOpen }: ModalProps) => {
  const navigate = useNavigate();
  return (
    <ConfirmationModal
      open={open}
      onAccept={() => {
        setOpen(false);
        navigate({ path: "/dashboard" });
      }}
      onCancel={() => setOpen(false)}
      title="Submission Successful"
      body={
        <p>
          Please be aware that it may take up to a minute for your submission to
          show in the Dashboard.
        </p>
      }
      cancelButtonVisible={false}
      acceptButtonText="Go to Dashboard"
    />
  );
};

const Cancel = ({ open, setOpen }: ModalProps) => {
  const navigate = useNavigate();
  return (
    <ConfirmationModal
      open={open}
      onAccept={() => {
        setOpen(false);
        navigate({ path: "/dashboard" });
      }}
      onCancel={() => setOpen(false)}
      cancelButtonText="Return to Form"
      acceptButtonText="Yes"
      title="Are you sure you want to cancel?"
      body={
        <p>If you leave this page you will lose your progress on this form</p>
      }
    />
  );
};

const Error = ({ open, setOpen }: ModalProps) => {
  return (
    <ConfirmationModal
      open={open}
      onAccept={() => {
        setOpen(false);
      }}
      onCancel={() => setOpen(false)}
      title="Submission Error"
      body={
        <p>
          An error occurred during issue.
          <br />
          You may close this window and try again, however, this likely requires
          support.
          <br />
          <br />
          Please contact the{" "}
          <a
            href="mailto:OneMAC_Helpdesk@cms.hhs.gov"
            className="text-blue-500"
          >
            helpdesk
          </a>
        </p>
      }
      cancelButtonVisible={false}
      acceptButtonText="Exit to Package Details"
    />
  );
};

const useFormModalControllers = () => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  return {
    cancelModalOpen,
    setCancelModalOpen,
    successModalOpen,
    setSuccessModalOpen,
    errorModalOpen,
    setErrorModalOpen,
  };
};

export const [ModalContextProvider, useModalContext] = createContextProvider<
  ReturnType<typeof useFormModalControllers>
>({
  name: "Submission Form Modal Context",
  errorMessage:
    "This component requires the `ModalProvider` wrapper to make use of modal UIs.",
});
export const ModalProvider = ({ children }: PropsWithChildren) => {
  const context = useFormModalControllers();
  return (
    <ModalContextProvider value={context}>
      {children}
      <Success
        open={context.successModalOpen}
        setOpen={context.setSuccessModalOpen}
      />
      <Cancel
        open={context.cancelModalOpen}
        setOpen={context.setCancelModalOpen}
      />
      <Error
        open={context.errorModalOpen}
        setOpen={context.setErrorModalOpen}
      />
    </ModalContextProvider>
  );
};
