import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Button, Input } from "@/components/Inputs";
import { Modal } from "@/components/Modal";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
export const WithdrawPackage: React.FC = () => {
  const navigate = useNavigate();
  const [withdrawModal, setModalWithdraw] = useState<boolean>(false);
  const [withdrawData, setwithdrawData] = useState<{
    withdraw_document?: any;
    withdraw_comment?: string;
  }>({
    withdraw_document: null,
    withdraw_comment: "",
  });
  const navigateBack = (): void => {
    navigate(-1);
  };
  const { id } = useParams<{
    id: string;
    type: string;
  }>();

  const onHandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = event.target;
    if (event.target.files && event.target.files[0]) {
      setwithdrawData({ ...withdrawData, withdraw_document: files });
    } else if (name === "withdraw_comment") {
      setwithdrawData({ ...withdrawData, withdraw_comment: value });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
  };

  return (
    <>
      <div>
        <div className="bg-[#E0F2FE] px-14 py-5 flex  items-center">
          <ChevronLeftIcon
            className="h-[25px] w-[30px] fill-primary font-semibold  text-primary cursor-pointer"
            onClick={navigateBack}
          />
          <h1 className="font-semibold mx-3">{id}</h1>
        </div>

        <div className="px-14  py-5 ">
          <div className="my-4">
            <h1 className="text-xl font-bold ">
              WithDraw Medicaid SPA Package
            </h1>
          </div>
          <div className="py-5 max-w-lg">
            <p>
              Complete this form to withdrawn a package. Once complete you will
              not be able to resubmit tis package.CMS will be notified and will
              use this content to review your request. if CMS needs any
              additional information.they will follow up by email
            </p>
          </div>
          <div className="my-10">
            <p className="font-semibold">SPA-ID</p>
            <p className="text-sm">{id}</p>
          </div>
          <div className="my-10">
            <p className="font-semibold">Type</p>
            <p className="text-sm">Medicaid SPA</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="py-5 max-w-xl">
              <p className="font-semibold">
                Expylain your need for withdrawal or Upload supporting
                documentation.
              </p>
              <div className="my-3">
                <input
                  placeholder="submitting withdrawal"
                  className="flex h-40 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  height={30}
                  onChange={onHandleChange}
                  name="withdraw_comment"
                />
              </div>
              <p className="text-sm">
                Once you submit this form,a confirmation email is sent to you
                and to CMS.CMS will use this content to review your package.if
                CMS needs any additional information,they will follow up by
                email
              </p>

              <div className="mt-8">
                <Input
                  type="file"
                  accept=".pdf,.docx,.jpg,.png"
                  name="withdraw_document"
                  onChange={onHandleChange}
                />
                <p className="text-sm">
                  Maximum file size of 80MB.you can add multiple files. we
                  accept the following file types
                </p>
                <p className="font-semibold"> .pdf, .docx, .jpg, .png</p>
              </div>
            </div>
            <div className="my-3  flex flex-row ">
              <div className="mx-3">
                <Button onClick={navigateBack} variant="outline" title="Submit">
                  Cancel
                </Button>{" "}
                <Button
                  disabled={
                    !withdrawData.withdraw_comment &&
                    !withdrawData.withdraw_document
                  }
                  onClick={() => {
                    setModalWithdraw(true);
                  }}
                >
                  Submit
                </Button>
              </div>
              <div>
                <Modal showModal={withdrawModal}>
                  <div className="flex  flex-col  w-auto  items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                    <div className="flex justify-between w-full">
                      <h2 className="text-xl font-bold mb-3">
                        Withdraw Package ?
                      </h2>
                      <div className="w-8 cursor-pointer">
                        <XMarkIcon onClick={() => setModalWithdraw(false)} />
                      </div>
                    </div>

                    <p className="w-10/12">{`You are about to withdraw ${id}. Once complete you will not be able to resubmit this package. CMS will be notified`}</p>
                    <div className="my-8">
                      <Button className="mx-3">Yes ,withdraw package</Button>
                      <Button
                        onClick={() => {
                          setModalWithdraw(false);
                        }}
                        className="mx-3"
                        variant={"ghost"}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Modal>
              </div>
            </div>
          </form>
        </div>
        <div></div>
      </div>
    </>
  );
};
