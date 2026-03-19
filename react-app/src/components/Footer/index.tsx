import { useMemo } from "react";
import { Link } from "react-router";
import { UserRoles } from "shared-types";
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

export const Footer = ({ email, address, showNavLinks }: Props) => {
  const shouldShowNavLinks = showNavLinks ?? true;
  const { data: user } = useGetUser();
  const { data: userDetailsData } = useGetUserDetails();
  const showUserManagement = useMemo(() => {
    const role = userDetailsData?.role;
    return ["systemadmin", "statesystemadmin", "cmsroleapprover", "helpdesk"].includes(role);
  }, [userDetailsData]);
  const showDashboard =
    user.user &&
    Object.values(UserRoles).some((role) => {
      return user.user.role === role;
    });
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
              {showDashboard && (
                <a
                  href="/dashboard"
                  className="underline font-bold"
                  onClick={() => {
                    sendGAEvent("home_footer_link", { link_name: "dashboard" });
                  }}
                >
                  <p>Dashboard</p>
                </a>
              )}

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
                  aria-label="Call the OneMAC Helpdesk"
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
                  aria-label="Email the OneMAC Helpdesk"
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
            <a
              href={`mailto:${email}`}
              className="font-bold underline"
              onClick={() => {
                sendGAEvent("home_help_email", null);
              }}
              aria-label="Email the OneMAC Helpdesk for help or feedback"
            >
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
