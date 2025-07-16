import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { isStateUser } from "shared-utils";

import { useGetUser, useGetUserDetails } from "@/api";
import { Alert, Button } from "@/components";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

type Props = {
  email: string;
  address: {
    street: string;
    state: string;
    city: string;
    zip: number;
  };
  showNavLinks?: boolean;
};

type MedSpaFooterProps = {
  onCancel: () => void;
  onSubmit: () => void;
  disabled: boolean;
};

export const Footer = ({ email, address, showNavLinks }: Props) => {
  const shouldShowNavLinks = showNavLinks ?? true;
  const { data: user } = useGetUser();
  const { data: userDetailsData } = useGetUserDetails();
  const showUserManagement = useMemo(() => {
    const role = userDetailsData?.role;
    return ["systemadmin", "statesystemadmin", "cmsroleapprover", "helpdesk"].includes(role);
  }, [userDetailsData]);
  const isStateHomepage = useFeatureFlag("STATE_HOMEPAGE_FLAG");

  return (
    <footer>
      {shouldShowNavLinks && (
        <section className="bg-[#f0f0f0] text-sm">
          <div className="grid grid-cols-12 gap-4 px-10 py-4 max-w-screen-xl mx-auto">
            <div className="col-span-6 flex gap-8">
              <a
                href="/"
                className="underline font-bold"
                onClick={() => {
                  sendGAEvent("home_footer_link", { link_name: "home" });
                }}
              >
                <p>Home</p>
              </a>
              <a
                href="/dashboard"
                className="underline font-bold"
                onClick={() => {
                  sendGAEvent("home_footer_link", { link_name: "dashboard" });
                }}
              >
                <p>Dashboard</p>
              </a>

              {showUserManagement && (
                <a href="/usermanagement" className="underline font-bold">
                  <p>User Management</p>
                </a>
              )}
              {isStateHomepage && isStateUser(user.user) && (
                <a
                  href="/latestupdates"
                  className="underline font-bold"
                  onClick={() => {
                    sendGAEvent("home_footer_link", { link_name: "latestupdates" });
                  }}
                >
                  <p>Latest Updates</p>
                </a>
              )}
              <a
                href="/faq"
                className="underline font-bold"
                onClick={() => {
                  sendGAEvent("home_footer_link", { link_name: "support" });
                }}
              >
                <p>Support</p>
              </a>
            </div>
            <div className="col-span-6 flex gap-8 justify-end">
              <p>Help Desk:</p>
              <p>
                <a
                  href="tel:(833) 228-2540"
                  className="underline"
                  onClick={() => {
                    sendGAEvent("home_help_phone", null);
                  }}
                >
                  (833) 228-2540
                </a>
              </p>
              <p>
                <a
                  href="mailto:OneMAC_Helpdesk@cms.hhs.gov"
                  className="underline"
                  onClick={() => {
                    sendGAEvent("home_help_email", null);
                  }}
                >
                  OneMAC_Helpdesk@cms.hhs.gov
                </a>
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="bg-sky-100">
        <div className="grid grid-cols-12 gap-4 px-10 py-4 max-w-screen-xl mx-auto">
          <img
            src="/MedicaidLogo.svg"
            alt="Logo for Medicaid"
            className="w-36 col-span-6 sm:col-span-6 justify-self-start self-center sm:justify-self-start sm:self-center"
          />
          <img
            className="max-w-36 col-span-6 sm:col-span-2 justify-self-end self-center"
            src="/DepartmentOfHealthLogo.svg"
            alt="Logo for Department of Health and Human Services"
          />
          <p className="col-span-12 sm:col-span-4">
            A federal government website managed and paid for by the U.S. Centers for Medicare and
            Medicaid Services and part of the MACPro suite.
          </p>
        </div>
      </section>

      <div className="w-full bg-primary">
        <div className="px-10 py-4 text-white text-[.8rem] flex flex-col items-center sm:flex-row max-w-screen-xl mx-auto">
          <div>
            Email{" "}
            <a href={`mailto:${email}`} className="font-bold underline">
              {email}
            </a>{" "}
            for help or feedback
          </div>
          <div className="flex-1"></div>
          <div>
            <span className="sm:block">{address.street} </span>
            <span className="sm:block">
              {address.city}, {address.state} {address.zip}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const FAQFooter = () => {
  const useChipForm = useFeatureFlag("CHIP_SPA_SUBMISSION");
  if (useChipForm) return null;

  return (
    <Alert
      variant={"infoBlock"}
      className="mb-8 items-center flex py-8 px-14 flex-row text-sm justify-center gap-24"
    >
      <p className="text-lg">Do you have questions or need support?</p>
      <Link to="/faq" target="_blank">
        <Button className="mx-4" size="lg">
          View FAQs
        </Button>
      </Link>
    </Alert>
  );
};

export const MedSpaFooter = ({ onCancel, onSubmit, disabled }: MedSpaFooterProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById("form-actions");
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      threshold: 0.1,
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 border-t border-gray-300 bg-white px-[24px]">
      <div className="flex justify-between items-center w-full py-3">
        {/* Left: Cancel */}
        <button
          onClick={onCancel}
          data-testid="cancel-action-form-footer"
          className="w-[93px] h-[48px] py-[12px] px-[20px] text-blue-700 font-semibold underline"
        >
          Cancel
        </button>

        {/* Right: Save / Save & Submit */}
        <div className="flex gap-[10px]">
          {/* Save */}
          <button
            type="button"
            onClick={() => {}}
            className="w-[128.36px] h-[46.58px] py-[12px] px-[20px] gap-[10px] rounded-[4px] border-[2px] border-blue-700 text-blue-700 bg-white font-semibold text-sm"
          >
            Save
          </button>

          {/* Save & Submit */}
          <button
            onClick={onSubmit}
            disabled={disabled}
            data-testid="submit-action-form-footer"
            className={`w-[181.75px] h-[46.58px] py-[12px] px-[20px] gap-[10px] rounded-[4px] font-semibold text-sm transition
    ${disabled ? "bg-gray-300 text-white cursor-not-allowed" : "bg-blue-700 text-white hover:bg-blue-800"}
  `}
          >
            Save & Submit
          </button>
        </div>
      </div>
    </div>
  );
};
