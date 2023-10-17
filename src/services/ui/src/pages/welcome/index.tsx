import * as C from "@/components";
import OneMacLogo from "@/assets/onemac_logo.svg";
import * as Heroicons from "@heroicons/react/24/outline";
import { QueryClient } from "@tanstack/react-query";
import { getUser } from "@/api/useGetUser";
import { Link } from "react-router-dom";
import { Button } from "@/components/Inputs";
import { ROUTES, FAQ_TARGET } from "@/routes";

export const loader = (queryClient: QueryClient) => {
  return async () => {
    if (!queryClient.getQueryData(["user"])) {
      return await queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: () => getUser(),
      });
    }
    return queryClient.getQueryData(["user"]);
  };
};

export const Welcome = () => {
  return (
    <>
      <div className="w-full bg-primary p-2 md:p-4">
        <div className="max-w-screen-xl flex flex-col sm:flex-row sm:items-center gap-4 mx-auto p-4 lg:px-8">
          <img
            src={OneMacLogo}
            alt="One Mac Logo"
            className="p-4 min-w-[400px]"
          />
          <p className="text-center text-white/90 font-light text-xl font-sans">
            Welcome to the official submission system for paper-based state plan
            amendments (SPAs) and section 1915 waivers.
          </p>
        </div>
      </div>
      {/* End Hero Section */}
      {/* Two Column Main Layout */}
      <main className="max-w-screen-xl mx-auto p-4 lg:px-8">
        <div className="flex flex-col justify-center gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">State Users</h3>
            <div className="flex flex-col md:flex-row gap-12">
              <C.HowItWorks>
                <C.Step
                  icon={
                    <Heroicons.ArrowRightOnRectangleIcon className="min-w-[32px] w-8 h-8" />
                  }
                  title="Login with IDM"
                  content="Login with your IDM username and password to access your SPA and Waiver dashboard."
                />
                <C.Step
                  icon={
                    <Heroicons.DocumentArrowUpIcon className="min-w-[32px] w-8 h-8" />
                  }
                  title="Attach your documents"
                  content="Select a submission type and attach required documents relevant to your SPA and/or Waiver submission."
                />
                <C.Step
                  icon={
                    <Heroicons.EnvelopeIcon className="min-w-[32px] w-8 h-8" />
                  }
                  title="Receive an email confirmation"
                  content="After you submit, you will receive an email confirmation that your submission was successful, marking the start of the 90-day review process."
                />
              </C.HowItWorks>
              <div className="flex-grow">
                <h4 className="font-bold text-xl mb-4">
                  Submission Types include:
                </h4>
                <ul className="flex flex-col gap-4">
                  <li>
                    <p>
                      Amendments to your Medicaid and CHIP State Plans (not
                      submitted through MACPro, MMDL or WMS).
                    </p>
                  </li>
                  <li>
                    <p>
                      Official state responses to formal requests for additional
                      information (RAIs) for SPAs (not submitted through
                      MACPro).
                    </p>
                  </li>
                  <li>
                    <p>
                      Section 1915(b) waiver submissions (those not submitted
                      through WMS).
                    </p>
                  </li>
                  <li>
                    <p>
                      Section 1915(c) Appendix K amendments (which cannot be
                      submitted through WMS).
                    </p>
                  </li>
                  <li>
                    <p>
                      Official state responses to formal requests for additional
                      information (RAIs) for Section 1915(b) waiver actions (in
                      addition to submitting waiver changes in WMS, if
                      applicable).
                    </p>
                  </li>
                  <li>
                    <p>
                      State requests for Temporary Extensions for section
                      1915(b) and 1915(c) waivers.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">CMS Users</h3>
            <div className="flex flex-col md:flex-row gap-8">
              <C.HowItWorks>
                <C.Step
                  icon={
                    <Heroicons.DocumentArrowUpIcon className="min-w-[32px] w-8 h-8" />
                  }
                  title="Receive an email for submission notification"
                  content="After a state adds a submission to OneMAC, you will receive an email notification that a submission was made requiring your review and the submission is on the clock."
                />
                <C.Step
                  icon={
                    <Heroicons.ArrowRightOnRectangleIcon className="min-w-[32px] w-8 h-8" />
                  }
                  title="Login with EUA"
                  content="Login with your EUA username and password to access the SPA and Waiver dashboard."
                />
                <C.Step
                  icon={
                    <Heroicons.EnvelopeIcon className="min-w-[32px] w-8 h-8" />
                  }
                  title="Review your assigned submission"
                  content="Search the submission ID from the email and click on the submission to view and review details and attachments."
                />
              </C.HowItWorks>
              <div>
                <h4 className="font-bold text-xl mb-4">
                  Submission Types include:
                </h4>
                <ul className="flex flex-col gap-4">
                  <li>
                    <p>Amendments to your Medicaid and CHIP State Plans.</p>
                  </li>
                  <li>
                    <p>
                      Official state responses to formal requests for additional
                      information (RAIs) for SPAs.
                    </p>
                  </li>
                  <li>
                    <p>Section 1915(b) waiver submissions.</p>
                  </li>
                  <li>
                    <p>Section 1915(c) Appendix K amendments.</p>
                  </li>
                  <li>
                    <p>
                      Official state responses to formal requests for additional
                      information (RAIs) for Section 1915(b) waiver actions.
                    </p>
                  </li>
                  <li>
                    <p>
                      State requests for Temporary Extensions for section
                      1915(b) and 1915(c) waivers.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <section>
        <div className="flex justify-around items-center text-xl py-10 px-10 py-4 max-w-screen-xl mx-auto">
          <h4>Do you have questions or need support?</h4>
          <Button asChild>
            <Link to={ROUTES.FAQ} target={FAQ_TARGET}>
              View FAQ
            </Link>
          </Button>
        </div>
      </section>
      ;
    </>
  );
};
