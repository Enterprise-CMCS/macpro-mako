import { Button } from "@/components/Inputs";
import { useLocation } from "react-router-dom";
import { Link } from "@/components/Routing";
import { PropsWithChildren, ReactElement } from "react";
import { SimplePageTitle } from "@/pages/create/create-options";
import { SimplePageContainer } from "@/components";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { optionCrumbsFromPath } from "@/pages/create/create-breadcrumbs";
import { FAQ_TAB } from "@/components/Routing/consts";
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
const MACProLogo = () => (
  <img src={"/images/logos/macpro.png"} alt={"MACPro system logo"} />
);
const MMDLLogo = () => (
  <img src={"/images/logos/mmdl.png"} alt={"MMDL system logo"} />
);
const FAQHelperText = () => (
  <span className="max-w-xl">
    <i>
      For additional information on where to submit, refer to the{" "}
      <Link
        className="text-sky-600 hover:text-sky-800 underline"
        target={FAQ_TAB}
        path="/faq"
        hash={"system"}
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
      <SimplePageTitle title={pageTitle} />
      <div className="flex flex-col items-center justify-center m-4 pt-4 pb-12">
        {image}
        {description}
        <a className="mb-8" href={buttonLink} target="_blank" rel="noreferrer">
          <Button className="landing-button">{buttonLabel}</Button>
        </a>
        <FAQHelperText />
      </div>
    </SimplePageContainer>
  );
};

export const MedicaidABPLandingPage = () => (
  <ExternalAppLandingPage
    pageTitle={
      "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing"
    }
    image={<MMDLLogo />}
    description={
      <LandingPageDescription>
        <p className="mb-4">
          <b>
            Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and
            Cost Sharing are managed within the{" "}
            <a
              className="text-sky-600 hover:text-sky-800 underline"
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
          The MMDL system allows states to apply for changes to their State
          plan, and access report on Medicaid program
          administration/implementation.
        </p>
      </LandingPageDescription>
    }
    buttonLabel={"Enter the MMDL system"}
    buttonLink={EXTERNAL_APP.MMDL}
  />
);

export const MedicaidEligibilityLandingPage = () => (
  <ExternalAppLandingPage
    pageTitle={
      "Medicaid Eligibility, Enrollment, Administration, and Health Homes"
    }
    image={<MACProLogo />}
    description={
      <LandingPageDescription>
        <p className="mb-4">
          <b>
            Medicaid Eligibility, Enrollment, Administration, and Health Homes
            SPA packages are submitted within the{" "}
            <a
              className="text-sky-600 hover:text-sky-800 underline"
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
          The MACPro system allows CMS and states to collaborate online to
          process certain types of Medicaid SPA submissions.
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
              className="text-sky-600 hover:text-sky-800 underline"
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
          The MMDL system allows states to apply for changes to their State
          plan, and access report on Medicaid program
          administration/implementation.
        </p>
      </LandingPageDescription>
    }
    buttonLabel={"Enter the MMDL system"}
    buttonLink={EXTERNAL_APP.MMDL}
  />
);
