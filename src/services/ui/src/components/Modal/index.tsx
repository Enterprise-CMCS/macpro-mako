import {
  useState,
  cloneElement,
  ReactElement,
  JSXElementConstructor,
} from "react";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { PropsWithChildren } from "react";

interface Props {
  buttonText: string;
  title: string;
  children: ReactElement<any, string | JSXElementConstructor<any>>;
}
export function Modal({
  buttonText,
  title,
  children,
}: PropsWithChildren<Props>) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <UI.Button
        buttonText={buttonText}
        type="button"
        onClick={() => setShowModal(true)}
        aria-label="Close Modal"
      />
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-2 mx-auto">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <UI.Typography size="lg" as="h2">
                    {title}
                  </UI.Typography>
                  <div className="w-8 cursor-pointer">
                    <XMarkIcon onClick={() => setShowModal(false)} />
                  </div>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  {children &&
                    cloneElement(children, {
                      callback: () => setShowModal(false),
                    })}
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
