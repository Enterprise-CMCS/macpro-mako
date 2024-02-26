import { PropsWithChildren, useState } from "react";
import { createContextProvider } from "@/utils";
import { ConfirmationModal } from "@/components";

type SubmissionAlert = {
  header: string;
  body: string;
  cancelButtonText?: string;
  acceptButtonText?: string;
};
const useModalController = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [onAccept, setOnAccept] = useState<VoidFunction>(() => void {});
  const [content, setContent] = useState<SubmissionAlert>({
    header: "No header given",
    body: "No body given",
  });
  return {
    content,
    setContent,
    onAccept,
    setOnAccept,
    modalOpen,
    setModalOpen,
  };
};

export const [ModalContextProvider, useModalContext] = createContextProvider<
  ReturnType<typeof useModalController>
>({
  name: "Modal Context",
  errorMessage:
    "This component requires the `ModalProvider` wrapper to make use of modal UIs.",
});

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const context = useModalController();
  return (
    <ModalContextProvider value={context}>
      {children}
      <ConfirmationModal
        open={context.modalOpen}
        onAccept={context.onAccept}
        onCancel={() => context.setModalOpen(false)}
        cancelButtonVisible={context.content.cancelButtonText !== undefined}
        acceptButtonVisible={context.content.acceptButtonText !== undefined}
        cancelButtonText={context.content.cancelButtonText}
        acceptButtonText={context.content.acceptButtonText}
        title={context.content.header}
        body={context.content.body}
      />
    </ModalContextProvider>
  );
};
