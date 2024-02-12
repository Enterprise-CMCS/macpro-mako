import { ReactElement, JSXElementConstructor } from "react";
import { PropsWithChildren } from "react";

interface Props {
  showModal: boolean;
  children: ReactElement<any, string | JSXElementConstructor<any>>;
}
export function Modal({ showModal, children }: PropsWithChildren<Props>) {
  return (
    <>
      {showModal ? (
        <>
          <div className="justify-center items-center flex fixed inset-0 z-50">
            <div className="relative w-auto my-2 mx-auto bg-white border-2 rounded-lg">
              <div className="relative p-6 flex-auto">{children}</div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
export * from "./ConfirmationModal";
