import { ConfirmationModal } from "@/components";
import { ROUTES } from "@/routes";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

type FormModalController = {
  setSuccessModalOpen: Dispatch<SetStateAction<boolean>>;
  setCancelModalOpen: Dispatch<SetStateAction<boolean>>;
};
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
        navigate(ROUTES.DASHBOARD);
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
        navigate(ROUTES.DASHBOARD);
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

const ModalContext = createContext<FormModalController>({
  // Empty setters, react requires default values in context creation
  setSuccessModalOpen: (v: boolean) => ({}),
  setCancelModalOpen: (v: boolean) => ({}),
} as FormModalController);
export const useModalContext = () => useContext(ModalContext);
export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  return (
    <ModalContext.Provider
      value={{
        setSuccessModalOpen,
        setCancelModalOpen,
      }}
    >
      {children}
      <Success open={successModalOpen} setOpen={setSuccessModalOpen} />
      <Cancel open={cancelModalOpen} setOpen={setCancelModalOpen} />
    </ModalContext.Provider>
  );
};
