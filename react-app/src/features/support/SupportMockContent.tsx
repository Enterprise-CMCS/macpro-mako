import { FILE_TYPES } from "shared-types/uploads";

export type QuestionAnswer = {
  anchorText: string;
  question: string;
  answerJSX: JSX.Element;
  statusLabel?: "New" | "Updated";
};

type FAQContent = {
  sectionTitle: string;
  qanda: QuestionAnswer[];
};

export const helpDeskContact = {
  email: "OneMAC_Helpdesk@cms.hhs.gov",
  phone: "(833) 228-2540",
};

export const oneMACStateFAQContent: FAQContent[] = [
  {
    sectionTitle: "Frequently asked questions (FAQs)",
    qanda: [
      {
        anchorText: "state-sub",
        question: "Should I use OneMAC for my state's submission?",
        statusLabel: "New",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "official",
        question: "Is what I submit in OneMAC considered the official state submission?",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "confirm-email",
        question: "What should I do if I don’t get a confirmation email?",
        statusLabel: "Updated",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "tempext-submitted",
        question:
          "Why does the status of my temporary extension request continue to show as “submitted”?",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "General",
    qanda: [
      {
        anchorText: "search-id",
        question: "Search for package ID or submitter name",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "dash-view",
        question: "Customize your dashboard view",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "view-pkg",
        question: "View submission package",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "file-types",
        question: "Accepted file types",
        answerJSX: (
          <section>
            <p>
              We accept the following file formats under 80 MB in size.{" "}
              <i>Unfortunately, we are unable to accept .zip or compressed files.</i>
            </p>
            <h3 className="text-bold pt-4 pb-4">Acceptable File Formats</h3>
            <table className="table-auto border-collapse border border-gray-300 w-full ">
              <tbody>
                {FILE_TYPES.map(({ extension, description }, index) => (
                  <tr key={index}>
                    <td className="pr-8 text-bold  border border-gray-300 px-4 py-2 ">
                      {extension}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ),
      },
      {
        anchorText: "status",
        question: "Package statuses",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "browsers",
        question: "Supported browsers",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "Package actions",
    qanda: [
      {
        anchorText: "submit-spa",
        question: "Submit new SPA or waiver",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "rai-respond",
        question: "Respond to RAI",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "withdraw-rai",
        question: "Withdraw RAI response",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "withdraw-pkg",
        question: "Withdraw package",
        answerJSX: (
          <section>
            <p>
              We accept the following file formats under 80 MB in size.{" "}
              <i>Unfortunately, we are unable to accept .zip or compressed files.</i>
            </p>
            <h3 className="text-bold pt-4 pb-4">Acceptable File Formats</h3>
            <table className="table-auto border-collapse border border-gray-300 w-full ">
              <tbody>
                {FILE_TYPES.map(({ extension, description }, index) => (
                  <tr key={index}>
                    <td className="pr-8 text-bold  border border-gray-300 px-4 py-2 ">
                      {extension}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ),
      },
      {
        anchorText: "waiver-te",
        question: "Request temporary extension for a waiver",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "waiver-amend",
        question: "Add amendment for 1915(b) waiver",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "Templates & implementation guides",
    qanda: [
      {
        anchorText: "abp-spa",
        question: "Medicaid Alternative Benefit Plan (ABP) SPA templates",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "abp-spa-2",
        question: "Medicaid Alternative Benefit Plan (ABP) SPA implementation guides",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "mpc-spa",
        question: "Medicaid Premiums and Cost Sharing (MPC) SPA templates",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "mpc-spa2",
        question: "Medicaid Premiums and Cost Sharing (MPC) SPA implementation guides",
        answerJSX: (
          <section>
            <p>
              We accept the following file formats under 80 MB in size.{" "}
              <i>Unfortunately, we are unable to accept .zip or compressed files.</i>
            </p>
            <h3 className="text-bold pt-4 pb-4">Acceptable File Formats</h3>
            <table className="table-auto border-collapse border border-gray-300 w-full ">
              <tbody>
                {FILE_TYPES.map(({ extension, description }, index) => (
                  <tr key={index}>
                    <td className="pr-8 text-bold  border border-gray-300 px-4 py-2 ">
                      {extension}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ),
      },
      {
        anchorText: "chip-eligibil",
        question: "CHIP eligibility SPA templates",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "chip-eligibil2",
        question: "CHIP eligibility SPA implementation guides",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "Access & Roles",
    qanda: [
      {
        anchorText: "onemac-roles",
        question: "OneMAC user roles",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "request-role-onemac",
        question: "Request role in OneMAC",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "request-role-change-onemac",
        question: "Request role change in OneMAC",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "approve-deny-role-request",
        question: "Approve or deny role request (state system Administrator users)",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "idm-instructions-onemac",
        question: "IDM instructions for OneMAC users (PDF)",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "onemac-idm-guide-pdf",
        question: "OneMAC IDM guide (PDF)",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "User profile",
    qanda: [
      {
        anchorText: "view-profile",
        question: "View your user profile",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "add-phone-number",
        question: "Add phone number to your profile",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "add-access-state-submit",
        question: "Add access to a state as State Submitter",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "remove-access-state-submit",
        question: "Remove access to a state as a State Submitter",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "Glossary",
    qanda: [
      {
        anchorText: "approved-glossary",
        question: "Approved",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "disapproved-glossary",
        question: "Disapproved",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "rai-issued-glossary",
        question: "RAI issued",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "under-review-glossary",
        question: "Under review",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
];

export const oneMACCMSContent: FAQContent[] = [
  {
    sectionTitle: "Frequently asked questions (FAQs)",
    qanda: [
      {
        anchorText: "state-sub",
        question: "Should I use OneMAC for my state's submission?",
        statusLabel: "New",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "official",
        question: "Is what I submit in OneMAC considered the official state submission?",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "confirm-email",
        question: "What should I do if I don’t get a confirmation email?",
        statusLabel: "Updated",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "tempext-submitted",
        question:
          "Why does the status of my temporary extension request continue to show as “submitted”?",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "Internal Resources",
    qanda: [
      {
        anchorText: "sop-1",
        question: "SOP 1",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "sop-2",
        question: "SOP 2",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "General",
    qanda: [
      {
        anchorText: "search-id",
        question: "Search for package ID or submitter name",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "dash-view",
        question: "Customize your dashboard view",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "view-pkg",
        question: "View submission package",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "file-types",
        question: "Accepted file types",
        answerJSX: (
          <section>
            <p>
              We accept the following file formats under 80 MB in size.{" "}
              <i>Unfortunately, we are unable to accept .zip or compressed files.</i>
            </p>
            <h3 className="text-bold pt-4 pb-4">Acceptable File Formats</h3>
            <table className="table-auto border-collapse border border-gray-300 w-full ">
              <tbody>
                {FILE_TYPES.map(({ extension, description }, index) => (
                  <tr key={index}>
                    <td className="pr-8 text-bold  border border-gray-300 px-4 py-2 ">
                      {extension}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ),
      },
      {
        anchorText: "status",
        question: "Package statuses",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "browsers",
        question: "Supported browsers",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "Package actions",
    qanda: [
      {
        anchorText: "submit-spa",
        question: "Submit new SPA or waiver",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "rai-respond",
        question: "Respond to RAI",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "withdraw-rai",
        question: "Withdraw RAI response",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "withdraw-pkg",
        question: "Withdraw package",
        answerJSX: (
          <section>
            <p>
              We accept the following file formats under 80 MB in size.{" "}
              <i>Unfortunately, we are unable to accept .zip or compressed files.</i>
            </p>
            <h3 className="text-bold pt-4 pb-4">Acceptable File Formats</h3>
            <table className="table-auto border-collapse border border-gray-300 w-full ">
              <tbody>
                {FILE_TYPES.map(({ extension, description }, index) => (
                  <tr key={index}>
                    <td className="pr-8 text-bold  border border-gray-300 px-4 py-2 ">
                      {extension}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ),
      },
      {
        anchorText: "waiver-te",
        question: "Request temporary extension for a waiver",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "waiver-amend",
        question: "Add amendment for 1915(b) waiver",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "Templates & implementation guides",
    qanda: [
      {
        anchorText: "abp-spa",
        question: "Medicaid Alternative Benefit Plan (ABP) SPA templates",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "abp-spa-2",
        question: "Medicaid Alternative Benefit Plan (ABP) SPA implementation guides",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "mpc-spa",
        question: "Medicaid Premiums and Cost Sharing (MPC) SPA templates",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "mpc-spa2",
        question: "Medicaid Premiums and Cost Sharing (MPC) SPA implementation guides",
        answerJSX: (
          <section>
            <p>
              We accept the following file formats under 80 MB in size.{" "}
              <i>Unfortunately, we are unable to accept .zip or compressed files.</i>
            </p>
            <h3 className="text-bold pt-4 pb-4">Acceptable File Formats</h3>
            <table className="table-auto border-collapse border border-gray-300 w-full ">
              <tbody>
                {FILE_TYPES.map(({ extension, description }, index) => (
                  <tr key={index}>
                    <td className="pr-8 text-bold  border border-gray-300 px-4 py-2 ">
                      {extension}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ),
      },
      {
        anchorText: "chip-eligibil",
        question: "CHIP eligibility SPA templates",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "chip-eligibil2",
        question: "CHIP eligibility SPA implementation guides",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "Access & Roles",
    qanda: [
      {
        anchorText: "onemac-roles",
        question: "OneMAC user roles",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "request-role-onemac",
        question: "Request role in OneMAC",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "request-role-change-onemac",
        question: "Request role change in OneMAC",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "approve-deny-role-request",
        question: "Approve or deny role request (state system Administrator users)",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "idm-instructions-onemac",
        question: "IDM instructions for OneMAC users (PDF)",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "onemac-idm-guide-pdf",
        question: "OneMAC IDM guide (PDF)",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "User profile",
    qanda: [
      {
        anchorText: "view-profile",
        question: "View your user profile",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "add-phone-number",
        question: "Add phone number to your profile",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "add-access-state-submit",
        question: "Add access to a state as State Submitter",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "remove-access-state-submit",
        question: "Remove access to a state as a State Submitter",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
  {
    sectionTitle: "Glossary",
    qanda: [
      {
        anchorText: "approved-glossary",
        question: "Approved",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "disapproved-glossary",
        question: "Disapproved",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "rai-issued-glossary",
        question: "RAI issued",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
      {
        anchorText: "under-review-glossary",
        question: "Under review",
        answerJSX: (
          <section>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>
        ),
      },
    ],
  },
];
