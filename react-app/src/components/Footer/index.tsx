import { Link } from "react-router";
import { isStateUser } from "shared-utils";

import { useGetUser } from "@/api";
import { Alert, Button } from "@/components";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

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

export const Footer = ({ email, address, showNavLinks = false }: Props) => {
  const shouldShowNavLinks = showNavLinks ?? true;
  const { data: user } = useGetUser();
  const isStateHomepage = useFeatureFlag("STATE_HOMEPAGE_FLAG");

  return (
    <footer>
      {shouldShowNavLinks && (
        <section className="bg-[#f0f0f0] text-sm">
          <div className="grid grid-cols-12 gap-4 px-10 py-4 max-w-screen-xl mx-auto">
            <div className="col-span-6 flex gap-8">
              <a href="/" className="underline font-bold">
                <p>Home</p>
              </a>
              <a href="/dashboard" className="underline font-bold">
                <p>Dashboard</p>
              </a>
              {isStateHomepage && isStateUser(user.user) && (
                <a href="/latestupdates" className="underline font-bold">
                  <p>Latest Updates</p>
                </a>
              )}
              <a href="/faq" className="underline font-bold">
                <p>Support</p>
              </a>
            </div>
            <div className="col-span-6 flex gap-8 justify-end">
              <p>Help Desk:</p>
              <p>
                <a href="tel:(833) 228-2540" className="underline">
                  (833) 228-2540
                </a>
              </p>
              <p>
                <a href="mailto:OneMAC_Helpdesk@cms.hhs.gov" className="underline">
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
