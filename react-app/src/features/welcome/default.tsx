import * as Heroicons from "@heroicons/react/24/outline";
import { Link } from "react-router";

import * as C from "@/components";
import { Button } from "@/components";
import { CardWithTopBorder } from "@/components";
import { FAQ_TAB } from "@/consts";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useHideBanner } from "@/hooks/useHideBanner";
import { cn } from "@/utils";

const USER_GUIDE_DOWNLOADS = {
  cms: "/onboarding/OneMACCMSUserGuide.pdf",
  state: "/onboarding/OneMACStateUserGuide.pdf",
} as const;

type ResourceLink =
  | {
      text: string;
      to: string;
      downloadHref?: string;
    }
  | {
      text: string;
      href: string;
    };

interface ResourceSection {
  id: string;
  title: string;
  links: ResourceLink[];
}

const resourceSections: ResourceSection[] = [
  {
    id: "medicaid-spa-templates",
    title: "Medicaid SPA templates",
    links: [
      {
        text: "Medicaid Alternative Benefit Plan (ABP)",
        to: "/faq/abp-spa-templates",
      },
      {
        text: "Medicaid Premiums and Cost Sharing",
        to: "/faq/mpc-spa-templates",
      },
    ],
  },
  {
    id: "medicaid-spa-implementation-guides",
    title: "Medicaid SPA implementation guides",
    links: [
      {
        text: "Medicaid Alternative Benefit Plan (ABP)",
        to: "/faq/abp-spa-templates",
      },
      {
        text: "Medicaid Premiums and Cost Sharing",
        to: "/faq/mpc-spa-templates",
      },
    ],
  },
  {
    id: "chip-spa-templates",
    title: "CHIP SPA templates",
    links: [
      {
        text: "CHIP eligibility",
        to: "/faq/chip-spa-templates",
      },
    ],
  },
  {
    id: "chip-spa-implementation-guides",
    title: "CHIP SPA implementation guides",
    links: [
      {
        text: "CHIP eligibility",
        to: "/faq/chip-spa-templates",
      },
    ],
  },
  {
    id: "additional-templates-and-tools",
    title: "Additional templates and tools",
    links: [
      {
        text: "Medicaid SPA toolkit (Medicaid.gov)",
        href: "https://www.medicaid.gov/resources-for-states/spa-and-1915-waiver-processing/medicaid-spa-processing-tools-for-states",
      },
      {
        text: "CHIP SPA toolkit (Medicaid.gov)",
        href: "https://www.medicaid.gov/resources-for-states/spa-and-1915-waiver-processing/chip-spa-processing-tools-for-states",
      },
      {
        text: "1915 Waiver toolkit (Medicaid.gov)",
        href: "https://www.medicaid.gov/resources-for-states/spa-and-1915-waiver-processing/1915-waiver-processing-tools-for-states",
      },
    ],
  },
  {
    id: "user-guides",
    title: "User guides",
    links: [
      {
        text: "State user guide",
        to: "/faq/onboarding-materials",
        downloadHref: USER_GUIDE_DOWNLOADS.state,
      },
      {
        text: "CMS user guide",
        to: "/faq/onboarding-materials",
        downloadHref: USER_GUIDE_DOWNLOADS.cms,
      },
    ],
  },
];

const downloadFile = (href: string) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = "";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const Welcome = () => {
  const isSectionHidden = useHideBanner();
  const showResources = useFeatureFlag("HOMEPAGE_RESOURCES");

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
      {/* End Hero Section */}
      {/* Two Column Main Layout */}
      <div className="max-w-screen-xl mx-auto p-4 lg:px-8">
        <div
          className={cn(
            "grid items-start gap-8",
            showResources ? "lg:grid-cols-2" : "lg:grid-cols-1",
          )}
        >
          <section
            className={cn(
              isSectionHidden ? "hidden" : "block",
              showResources ? "min-w-0" : "m-auto w-full max-w-[767px]",
            )}
          >
            <h2 className="text-2xl font-bold">New and notable</h2>
            <CardWithTopBorder className="">
              <div className="space-y-8 py-5 pl-6 pr-6 md:pr-20">
                <article className="space-y-2">
                  <h3 className="font-bold">Saving draft packages</h3>
                  <p>
                    New functionality has been added to OneMAC allowing state users to save a draft
                    version of new submission packages. This allows states to begin working on their
                    new packages, save their work, and come back to them later to complete and
                    submit the SPA or Waiver action to CMS. Full details are available in the OneMAC
                    State User Guide.
                  </p>
                  <Link
                    to="/faq/onboarding-materials"
                    target={FAQ_TAB}
                    className="inline-block underline text-[#0071bc]"
                    onClick={() => downloadFile(USER_GUIDE_DOWNLOADS.state)}
                  >
                    Access state user guide
                  </Link>
                </article>
                <article className="space-y-2">
                  <h3 className="font-bold">Updated CS 18 SPA form</h3>
                  <p>
                    The CS 18 CHIP eligibility SPA template and implementation guide have been
                    updated in OneMAC to include compliance attestations for changes made by section
                    71109 of the Working Families Tax Cut (WFTC) legislation effective October 1,
                    2026. These updates to the CS 18 will be effective starting July 7, 2026.
                  </p>
                </article>
                <article className="space-y-2">
                  <h3 className="font-bold">Updated CS 31 SPA form</h3>
                  <p>
                    The CS 31 CHIP eligibility SPA template and implementation guide have been
                    updated in OneMAC to include policies for targeted low-income pregnant women.
                    These updates will be effective starting March 19, 2026.
                  </p>
                  <Link
                    to="/faq/chip-spa-templates"
                    target={FAQ_TAB}
                    className="inline-block underline text-[#0071bc]"
                  >
                    Access SPA templates and implementation guides
                  </Link>
                </article>
              </div>
            </CardWithTopBorder>
          </section>
          {showResources && (
            <section className="min-w-0">
              <h2 className="text-2xl font-bold">Resources</h2>
              <CardWithTopBorder className="">
                <div className="space-y-6 py-5 pl-6 pr-6 md:pr-20">
                  {resourceSections.map(({ id, title, links }) => (
                    <section key={title} aria-labelledby={`${id}-heading`}>
                      <h3 id={`${id}-heading`} className="font-bold">
                        {title}
                      </h3>
                      <ul className="list-disc pl-6 mt-2 space-y-1 text-[#0071bc]" role="list">
                        {links.map((link) => (
                          <li key={`${title}-${link.text}`}>
                            {"href" in link ? (
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                {link.text}
                              </a>
                            ) : (
                              <Link
                                to={link.to}
                                target={FAQ_TAB}
                                className="underline"
                                onClick={
                                  link.downloadHref
                                    ? () => downloadFile(link.downloadHref as string)
                                    : undefined
                                }
                              >
                                {link.text}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </CardWithTopBorder>
            </section>
          )}
        </div>
        <div className="flex flex-col justify-center gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">State users</h2>
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
                <h3 className="font-bold text-xl mb-4">Submission types include:</h3>
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
          <div>
            <h2 className="text-2xl font-bold mb-4">CMS users</h2>
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
                <h3 className="font-bold text-xl mb-4">Submission types include:</h3>
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
