import { useState } from "react";
import { Link } from "react-router";

import { LatestUpdates } from "@/components/Banner/latestUpdates";
import { Welcome } from "@/features/welcome/default";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

export const StateWelcome = () => {
  const [activeTab, setActiveTab] = useState("medicaid");

  const tabConfig = [
    {
      id: "medicaid",
      label: "Medicaid SPA",
      content:
        "Submit all Medicaid SPAs here, except for Medicaid eligibility, enrollment, administration, and health home SPAs, which can be submitted in MACPro System without logging in separately.",
      buttonText: "New Medicaid SPA",
      link: "/new-submission/spa/medicaid",
    },
    {
      id: "chip",
      label: "CHIP SPA",
      content: "Submit a new CHIP state plan amendment.",
      buttonText: "New CHIP SPA",
      link: "/new-submission/spa/chip/",
    },
    {
      id: "waiverB",
      label: "1915(b) waiver",
      content:
        "Submit a new 1915(b)(4) FFS selective contracting waiver or 1915(b) comprehensive (capacitated) waiver authority, amendment, or renewal.",
      buttonText: "New 1915(b) waiver",
      link: "/new-submission/waiver/b",
    },
    {
      id: "waiverC",
      label: "1915(c) waiver",
      content: "Submit section 1915(c) Appendix K amendments not handled in WMS.",
      buttonText: "New 1915(c) waiver",
      link: "/new-submission/waiver/app-k",
    },
    {
      id: "extension",
      label: "Request temporary waiver extension",
      content: "Submit a new temporary extension request for a 1915(b) or 1915(c) waiver.",
      buttonText: "New request",
      link: "/new-submission/waiver/temporary-extensions",
    },
  ];

  const cards = [
    {
      id: 1,
      title: "MACPro System",
      content: "Medicaid & CHIP Program System",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      buttonText: "Go to MACPro System",
      buttonLink: "https://macpro.cms.gov/suite",
    },
    {
      id: 2,
      title: "WMS",
      content: "Waiver Management System",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      buttonText: "Go to WMS",
      buttonLink: "https://wms-mmdl.cms.gov/WMS/faces/portal.jsp",
    },
    {
      id: 3,
      title: "MMDL",
      content: "Medicaid Model Data Lab",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      buttonText: "Go to MMDL",
      buttonLink: "https://wms-mmdl.cms.gov/MMDL/faces/portal.jsp",
    },
  ];

  const renderCard = (card: (typeof cards)[number]) => (
    <div key={card.id} className="w-full md:w-[616px]">
      <div className="min-h-[229px] border rounded-[3px] bg-white flex flex-col justify-between">
        <div className="pl-[24px] pr-4 pt-4">
          <h3 className="font-bold text-lg mb-[16px]">{card.title}</h3>
          <p className="font-semibold text-sm text-gray-800 mb-[16px]">{card.content}</p>
          <p className="text-sm text-gray-600">{card.body}</p>
        </div>
        <div className="pl-[24px] mt-[16px] mb-[24px]">
          <a
            href={card.buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-bold border-2 border-[#0071BC] text-[#0071BC] px-4 py-2 rounded hover:bg-[#0071BC] hover:text-white transition-colors duration-200"
          >
            {card.buttonText}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto pt-[80px] px-[24px] xl:px-[102px]">
      <div className="flex flex-col lg:flex-row gap-x-[48px] w-full px-6">
        {/* Left: New Submission */}
        <div className="max-w-[700px] flex-1 relative">
          <h2 className="text-[48px] font-merriweather font-bold text-[#3D4551] leading-[100%] mb-[32px]">
            New submission
          </h2>

          {/* Wrap the tab content in a relative container */}
          <div className="w-full min-h-[495px] bg-white rounded border-[#DFE1E2] p-[24px] relative">
            {/* Divider */}
            <div className="hidden lg:block absolute top-0 bottom-0 right-[-24px] w-[1px] border border-[#DFE1E2]" />

            {/* Tabs */}
            <div className="flex flex-col gap-[24px]">
              {tabConfig.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <div key={tab.id} onClick={() => setActiveTab(tab.id)} className="cursor-pointer">
                    <div className="flex items-center">
                      <div
                        className={`w-[6px] h-[39px] rounded-[5px] shadow-md flex-shrink-0 ${
                          isActive ? "bg-[#3D4551]" : "bg-transparent hover:bg-[#3D4551]"
                        }`}
                      />
                      <div
                        className={`pl-3 font-open-sans text-[24px] leading-[1.62] ${
                          isActive ? "text-[#0071BC] font-bold" : "text-[#3D4551] font-normal"
                        }`}
                      >
                        {tab.label}
                      </div>
                    </div>

                    {isActive && (
                      <div className="pl-[24px] pt-[8px]">
                        <p className="max-w-[677px] w-full font-open-sans text-[18px] text-[#212121] leading-[1.62] mb-4">
                          {tab.content}
                          {tab.id === "medicaid" && (
                            <a href="#" className="underline ml-1 text-blue-700">
                              Learn how.
                            </a>
                          )}
                        </p>
                        <Link to={tab.link}>
                          <button className="w-fit h-[38px] bg-[#0071BC] text-white px-4 py-2 rounded-md text-sm font-semibold">
                            {tab.buttonText}
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: View Existing Packages */}
        <div className="flex-1 max-w-[561px] px-4">
          <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] leading-[100%] font-merriweather font-bold text-[#3D4551]">
            {" "}
            View existing package
          </h2>
          <div className="w-full h-[202px] border border-dashed border-[#DFE1E2] rounded flex items-center justify-center text-[#9CA3AF] mb-8 mt-8">
            Search for package (placeholder)
          </div>

          {/* Horizontal "or" line */}
          <div className="flex items-center w-full mb-8">
            <div className="flex-grow border-t border-[#DFE1E2]" />
            <span className="mx-4 text-sm text-[#9CA3AF]">or</span>
            <div className="flex-grow border-t border-[#DFE1E2]" />
          </div>

          {/* Browse Dashboard Placeholder */}
          <div className="w-full h-[142px] border border-[#DFE1E2] rounded-[4px] flex items-center justify-center text-[#9CA3AF]">
            Browse dashboard (placeholder)
          </div>
        </div>
      </div>

      {/* Latest Updates Banner */}
      <div className="mt-[56px] mx-auto w-full h-auto min-h-[228px] border-[2px] border-gray-300 rounded-[3px] bg-gray-100 px-[24px] py-[24px] flex flex-col gap-[16px]">
        <LatestUpdates />
      </div>

      {/* Access Header */}
      <div className="pt-[56px] pb-[25px] pl-[24px]">
        <h2 className="text-2xl font-semibold">Access more SPA and waiver systems</h2>
      </div>

      {/* Cards Section */}
      <div className="w-full h-auto py-[8px] pr-[143px] pb-[87px]">
        <div className="flex flex-col gap-y-[40px]">
          <div className="flex flex-col md:flex-row gap-[40px]">
            {cards[0] && renderCard(cards[0])}
            {cards[1] && renderCard(cards[1])}
          </div>
          {cards[2] && (
            <div className="flex flex-col md:flex-row gap-[40px]">
              {renderCard(cards[2])}
              {/* Optionally add an empty div to balance the row if you want spacing */}
              <div className="hidden md:block md:w-[616px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StateWelcomeWrapper = () => {
  const isStateHomepageEnabled = useFeatureFlag("STATE_HOMEPAGE_FLAG");
  return <>{isStateHomepageEnabled ? <StateWelcome /> : <Welcome />}</>;
};

export default StateWelcomeWrapper;
