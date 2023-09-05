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
      />
      {showModal ? (
        <>
          <div className="tw-justify-center tw-items-center tw-flex tw-overflow-x-hidden tw-overflow-y-auto tw-fixed tw-inset-0 tw-z-50 tw-outline-none focus:tw-outline-none">
            <div className="tw-relative tw-w-auto tw-my-2 tw-mx-auto">
              {/*content*/}
              <div className="tw-border-0 tw-rounded-lg tw-shadow-lg tw-relative tw-flex tw-flex-col tw-w-full tw-bg-white tw-outline-none focus:tw-outline-none">
                {/*header*/}
                <div className="tw-flex tw-items-start tw-justify-between tw-p-5 tw-border-b tw-border-solid tw-border-slate-200 tw-rounded-t">
                  <UI.Typography size="lg" as="h2">
                    {title}
                  </UI.Typography>
                  <div className="tw-w-8 tw-cursor-pointer">
                    <XMarkIcon onClick={() => setShowModal(false)} />
                  </div>
                </div>
                {/*body*/}
                <div className="tw-relative tw-p-6 tw-flex-auto">
                  {children &&
                    cloneElement(children, {
                      callback: () => setShowModal(false),
                    })}
                </div>
              </div>
            </div>
          </div>
          <div className="tw-opacity-25 tw-fixed tw-inset-0 tw-z-40 tw-bg-black"></div>
        </>
      ) : null}
    </>
  );
}
