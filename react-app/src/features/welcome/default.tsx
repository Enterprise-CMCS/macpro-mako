import * as Heroicons from "@heroicons/react/24/outline";
import { useState } from "react";
import { Link } from "react-router";

import * as C from "@/components";
import { Button } from "@/components";
import { CardWithTopBorder } from "@/components";
import { FAQ_TAB } from "@/consts";
import { useHideBanner } from "@/hooks/useHideBanner";

export const Welcome = () => {
  const isSectionHidden = useHideBanner();
  const [activeTab, setActiveTab] = useState("medicaid");

  const tabConfig = [
    {
      id: "medicaid",
      label: "Medicaid SPA",
      content:
        "Submit all Medicaid SPAs here, except for Medicaid eligibility, enrollment, administration, and health home SPAs, which can be submitted in MACPro System without logging in separately.",
      buttonText: "New Medicaid SPA",
    },
    {
      id: "chip",
      label: "CHIP SPA",
      content: "Submit a new CHIP state plan amendment.",
      buttonText: "New CHIP SPA",
    },
    {
      id: "waiverB",
      label: "1915(b) waiver",
      content:
        "Submit a new 1915(b)(4) FFS selective contracting waiver or 1915(b) comprehensive (capacitated) waiver authority, amendment, or renewal.",
      buttonText: "New 1915(b) waiver",
    },
    {
      id: "waiverC",
      label: "1915(c) waiver",
      content: "Submit section 1915(c) Appendix K amendments not handled in WMS.",
      buttonText: "New 1915(c) waiver",
    },
    {
      id: "extension",
      label: "Request temporary waiver extension",
      content: "Submit a new temporary extension request for a 1915(b) or 1915(c) waiver.",
      buttonText: "New request",
    },
  ];

  return (
    <>
      <div className="w-full bg-primary p-2 md:p-4">
        <div className="max-w-screen-xl flex flex-col sm:flex-row sm:items-center gap-4 mx-auto p-4 lg:px-8">
          <h1>
            <img src="/onemac-logo.png" alt="onemac" className="p-4 min-w-[400px]" />
          </h1>
          <p className="text-center text-white/100 font-light text-xl font-sans">
            Welcome to the official submission system for paper-based state plan amendments (SPAs)
            and section 1915 waivers.
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto p-4 lg:px-8">
        {!isSectionHidden && (
          <div className="m-auto max-w-[767px]">
            <h2 className="text-2xl font-bold">New and Notable</h2>
            <CardWithTopBorder>
              <p className="py-5 pl-6 pr-20">
                <span className="font-bold text-[#0071bc]">
                  MMDL SPA forms available in OneMAC:
                </span>{" "}
                Medicaid Alternative Benefit Plan, Premium and Cost Sharing, and CHIP Eligibility
                SPA templates and implementation guides are now available in OneMAC. New submissions
                for these SPA types are submitted through the OneMAC system effective [add date].{" "}
                <Link
                  to="/faq/spa-admendments"
                  target={FAQ_TAB}
                  className="underline text-[#0071bc]"
                >
                  Learn more
                </Link>
              </p>
            </CardWithTopBorder>
          </div>
        )}

        {/* New Submission Section */}
        <div className="w-full flex justify-start px-[102px] pt-[80px]">
          <div className="w-[712px]">
            <h2 className="text-[48px] font-merriweather font-bold text-[#3D4551] leading-[100%] mb-[32px]">
              New submission
            </h2>

            <div className="w-full min-h-[495px] bg-white rounded border-[#DFE1E2] p-[16px]">
              {/* Tabs stacked with content underneath */}
              <div className="flex flex-col gap-[24px]">
                {tabConfig.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-[6px] h-[39px] rounded-[5px] shadow-md flex-shrink-0 ${
                            isActive ? "bg-[#3D4551]" : "bg-transparent"
                          }`}
                        ></div>
                        <div
                          className={`pl-3 font-open-sans font-bold text-[24px] leading-[1.62] ${
                            isActive ? "text-[#0071BC]" : "text-[#3D4551]"
                          }`}
                        >
                          {tab.label}
                        </div>
                      </div>

                      {isActive && (
                        <div className="pl-[24px] pt-[8px]">
                          <p className="font-open-sans text-[18px] text-[#212121] leading-[1.62] mb-4">
                            {tab.content}
                            {tab.id === "medicaid" && (
                              <a href="#" className="underline ml-1 hover:text-blue-700">
                                Learn how.
                              </a>
                            )}
                          </p>
                          <button className="w-fit h-[38px] bg-[#0071BC] text-white px-4 py-2 rounded-md text-sm font-semibold">
                            {tab.buttonText}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* STATE USERS */}
        <div className="flex flex-col justify-center gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">State Users</h2>
            <div className="flex flex-col md:flex-row gap-12">
              <C.HowItWorks>
                <C.Step
                  icon={<Heroicons.ArrowRightOnRectangleIcon className="min-w-[32px] w-8 h-8" />}
                  title="Login with IDM"
                  content="Login with your IDM username and password to access your SPA and Waiver dashboard."
                />
                <C.Step
                  icon={<Heroicons.DocumentArrowUpIcon className="min-w-[32px] w-8 h-8" />}
                  title="Attach your documents"
                  content="Select a submission type and attach required documents relevant to your SPA and/or Waiver submission."
                />
                <C.Step
                  icon={<Heroicons.EnvelopeIcon className="min-w-[32px] w-8 h-8" />}
                  title="Receive an email confirmation"
                  content="After you submit, you will receive an email confirmation that your submission was successful, marking the start of the 90-day review process."
                />
              </C.HowItWorks>
              <div className="flex-grow">
                <h3 className="font-bold text-xl mb-4">Submission Types include:</h3>
                <ul className="flex flex-col gap-4">
                  <li>
                    <p>
                      Amendments to your Medicaid and CHIP State Plans (not submitted through
                      MACPro, MMDL or WMS).
                    </p>
                  </li>
                  <li>
                    <p>
                      Official state responses to formal requests for additional information (RAIs)
                      for SPAs (not submitted through MACPro).
                    </p>
                  </li>
                  <li>
                    <p>Section 1915(b) waiver submissions (those not submitted through WMS).</p>
                  </li>
                  <li>
                    <p>
                      Section 1915(c) Appendix K amendments (which cannot be submitted through WMS).
                    </p>
                  </li>
                  <li>
                    <p>
                      Official state responses to formal requests for additional information (RAIs)
                      for Section 1915(b) waiver actions (in addition to submitting waiver changes
                      in WMS, if applicable).
                    </p>
                  </li>
                  <li>
                    <p>
                      State requests for Temporary Extensions for section 1915(b) and 1915(c)
                      waivers.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CMS USERS */}
          <div>
            <h2 className="text-2xl font-bold mb-4">CMS Users</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <C.HowItWorks>
                <C.Step
                  icon={<Heroicons.DocumentArrowUpIcon className="min-w-[32px] w-8 h-8" />}
                  title="Receive an email for submission notification"
                  content="After a state adds a submission to OneMAC, you will receive an email notification that a submission was made requiring your review and the submission is on the clock."
                />
                <C.Step
                  icon={<Heroicons.ArrowRightOnRectangleIcon className="min-w-[32px] w-8 h-8" />}
                  title="Login with EUA"
                  content="Login with your EUA username and password to access the SPA and Waiver dashboard."
                />
                <C.Step
                  icon={<Heroicons.EnvelopeIcon className="min-w-[32px] w-8 h-8" />}
                  title="Review your assigned submission"
                  content="Search the submission ID from the email and click on the submission to view and review details and attachments."
                />
              </C.HowItWorks>
              <div>
                <h3 className="font-bold text-xl mb-4">Submission Types include:</h3>
                <ul className="flex flex-col gap-4">
                  <li>
                    <p>Amendments to your Medicaid and CHIP State Plans.</p>
                  </li>
                  <li>
                    <p>
                      Official state responses to formal requests for additional information (RAIs)
                      for SPAs.
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
                      Official state responses to formal requests for additional information (RAIs)
                      for Section 1915(b) waiver actions.
                    </p>
                  </li>
                  <li>
                    <p>
                      State requests for Temporary Extensions for section 1915(b) and 1915(c)
                      waivers.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Footer */}
      <section>
        <div className="flex justify-around items-center text-xl px-10 py-2 max-w-screen-xl mx-auto">
          <h4>Do you have questions or need support?</h4>
          <Link to="/faq" target={FAQ_TAB}>
            <Button>View FAQs</Button>
          </Link>
        </div>
      </section>
    </>
  );
};
