import { PropsWithChildren, ReactElement } from "react";
import { Link, useLocation } from "react-router";

import { BreadCrumbs, Button, optionCrumbsFromPath, SimplePageContainer } from "@/components";
import { FAQ_TAB } from "@/consts";
import { SimplePageTitle } from "@/features";

export enum EXTERNAL_APP {
  MAC_PRO = "https://www.medicaid.gov/resources-for-states/medicaid-and-chip-program-macpro-portal/index.html#MACPro",
  MMDL = "https://wms-mmdl.cms.gov/MMDL/faces/portal.jsp",
}

export interface ExternalAppLandingPageConfig {
  pageTitle: string;
  image: ReactElement;
  description: ReactElement;
  buttonLabel: string;
  buttonLink: EXTERNAL_APP;
}

const MACProLogo = () => <img src="/macpro.png" alt="MACPro system logo" />;
const MMDLLogo = () => <img src={"/mmdl.png"} alt={"MMDL system logo"} />;

const FAQHelperText = () => (
  <span className="max-w-xl">
    <i>
      For additional information on where to submit, refer to the{" "}
      <Link
        to="/faq/crosswalk-system"
        target={FAQ_TAB}
        rel="noopener noreferrer"
        className="text-blue-900 underline flex items-center"
      >
        Crosswalk from Paper-based State Plan to MACPro and MMDL
      </Link>{" "}
      document in our FAQ section.
    </i>
  </span>
);

const LandingPageDescription = ({ children }: PropsWithChildren) => (
  <section className="my-8 max-w-xl">{children}</section>
);

/** Config-driven template to build landing pages that link to another site / app. */
const ExternalAppLandingPage = ({
  pageTitle,
  image,
  description,
  buttonLabel,
  buttonLink,
}: ExternalAppLandingPageConfig) => {
  const location = useLocation();
  return (
    <SimplePageContainer>
      <BreadCrumbs options={optionCrumbsFromPath(location.pathname)} />
      {/* TODO: Replace simple page title bar with breadcrumbs */}
      <SimplePageTitle title={pageTitle} />
      <div className="flex flex-col items-center justify-center m-4 pt-4 pb-12">
        {image}
        {description}
        <a className="mb-8" href={buttonLink} target="_blank" rel="noreferrer">
          <Button className="landing-button" aria-label={buttonLabel}>
            {buttonLabel}
          </Button>
        </a>
        <FAQHelperText />
      </div>
    </SimplePageContainer>
  );
};

export const MedicaidABPLandingPage = () => (
  <ExternalAppLandingPage
    pageTitle={"Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing"}
    image={<MMDLLogo />}
    description={
      <LandingPageDescription>
        <p className="mb-4">
          <b>
            Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing are
            managed within the{" "}
            <a
              className="text-sky-700 hover:text-sky-800 underline"
              href={EXTERNAL_APP.MMDL}
              target="_blank"
              rel="noreferrer"
            >
              Medicaid Model Data Lab (MMDL)
            </a>
            .
          </b>
        </p>
        <p>
          The MMDL system allows states to apply for changes to their State plan, and access report
          on Medicaid program administration/implementation.
        </p>
      </LandingPageDescription>
    }
    buttonLabel={"Enter the MMDL system"}
    buttonLink={EXTERNAL_APP.MMDL}
  />
);

export const MedicaidEligibilityLandingPage = () => (
  <ExternalAppLandingPage
    pageTitle={"Medicaid Eligibility, Enrollment, Administration, and Health Homes"}
    image={<MACProLogo />}
    description={
      <LandingPageDescription>
        <p className="mb-4">
          <b>
            Medicaid Eligibility, Enrollment, Administration, and Health Homes SPA packages are
            submitted within the{" "}
            <a
              className="text-sky-700 hover:text-sky-800 underline"
              href={EXTERNAL_APP.MAC_PRO}
              target="_blank"
              rel="noreferrer"
            >
              MACPro system
            </a>
            .
          </b>
        </p>
        <p>
          The MACPro system allows CMS and states to collaborate online to process certain types of
          Medicaid SPA submissions.
        </p>
      </LandingPageDescription>
    }
    buttonLabel={"Enter the MACPro system"}
    buttonLink={EXTERNAL_APP.MAC_PRO}
  />
);
export const CHIPEligibilityLandingPage = () => (
  <ExternalAppLandingPage
    pageTitle={"CHIP Eligibility SPAs"}
    image={<MMDLLogo />}
    description={
      <LandingPageDescription>
        <p className="mb-4">
          <b>
            CHIP Eligibility SPAs are managed within the{" "}
            <a
              className="text-sky-700 hover:text-sky-800 underline"
              href={EXTERNAL_APP.MMDL}
              target="_blank"
              rel="noreferrer"
            >
              Medicaid Model Data Lab (MMDL)
            </a>
            .
          </b>
        </p>
        <p>
          The MMDL system allows states to apply for changes to their State plan, and access report
          on Medicaid program administration/implementation.
        </p>
      </LandingPageDescription>
    }
    buttonLabel={"Enter the MMDL system"}
    buttonLink={EXTERNAL_APP.MMDL}
  />
);
