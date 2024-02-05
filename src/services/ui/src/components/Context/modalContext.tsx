import { PropsWithChildren, useState } from "react";
import { createContextProvider } from "@/utils";
import { ConfirmationModal } from "@/components";
import { Route } from "@/components/Routing/types";
import { useNavigate } from "@/components/Routing";

const useModalController = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [acceptPath, setAcceptPath] = useState<Route>("/dashboard");
  const [content, setContent] = useState<SubmissionAlert>({
    header: "No header given",
    body: "No body given",
  });
  return {
    content,
    setContent,
    acceptPath,
    setAcceptPath,
    modalOpen,
    setModalOpen,
  };
};

export const [ModalContextProvider, useModalContext] = createContextProvider<
  ReturnType<typeof useModalController>
>({
  name: "Submission Form Modal Context",
  errorMessage:
    "This component requires the `ModalProvider` wrapper to make use of modal UIs.",
});

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const context = useModalController();
  const navigate = useNavigate();
  return (
    <ModalContextProvider value={context}>
      {children}
      <ConfirmationModal
        open={context.modalOpen}
        onAccept={() => {
          context.setModalOpen(false);
          navigate({ path: context.acceptPath as Route });
        }}
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
