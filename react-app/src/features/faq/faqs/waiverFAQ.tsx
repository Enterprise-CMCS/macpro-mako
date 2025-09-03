import { handleSupportLinkClick } from "./utils";

export const waiverContent = [
  {
    anchorText: "initial-waiver-id-format",
    question: "What format is used to enter a 1915(b) Initial Waiver number?",
    answerJSX: (
      <div className="space-y-2">
        <p>
          1915(b) Initial Waiver numbers must follow the format SS-####.R00.00 or SS-#####.R00.00 to
          include:
        </p>
        <ul className="list-disc pl-7 space-y-2">
          <li>SS = 2 character state abbreviation</li>
          <li>##### = 4 or 5 digit initial waiver number</li>
          <li>R00 = initial number</li>
          <li>00 = amendment number (00 for initial)</li>
        </ul>
        <p>
          State abbreviation is separated by dash (-) and later sections are separated by periods
          (.). For example, the waiver number KY-0003.R00.00 is a waiver for the state of Kentucky,
          with an initial waiver number of 0003, no renewal number (R00), and no amendment number
          (00).
        </p>
      </div>
    ),
  },
  {
    anchorText: "waiver-renewal-id-format",
    question: "What format is used to enter a 1915(b) Waiver Renewal number?",
    answerJSX: (
      <div className="space-y-2">
        <p>
          1915(b) Waiver Renewal must follow the format SS-####.R##.00 or SS-#####.R##.00 to
          include:
        </p>
        <ul className="list-disc pl-7 space-y-2">
          <li>SS = 2 character state abbreviation</li>
          <li>####(#)= 4 or 5 digit initial waiver number</li>
          <li>R## = renewal number (R01, R02, ...)</li>
          <li>00 = amendment number (00 for renewals)</li>
        </ul>
        <p>
          State abbreviation is separated by dash (-) and later sections are separated by periods
          (.). For example, the waiver number KY-0003.R02.00 is a waiver for the state of Kentucky,
          with a initial waiver number of 0003, a second renewal (R02), and no amendment number
          (00).
        </p>
      </div>
    ),
  },
  {
    anchorText: "waiver-amendment-id-format",
    question: "What format is used to enter a 1915(b) Waiver Amendment number?",
    answerJSX: (
      <div className="space-y-2">
        <p>
          1915(b) Waiver Amendment must follow the format SS-####.R##.## or SS-#####.R##.## to
          include:
        </p>
        <ul className="list-disc pl-7 space-y-2">
          <li>SS = 2 character state abbreviation</li>
          <li>####(#)= 4 or 5 digit initial waiver number</li>
          <li>R## = renewal number (R01, R02, ...)</li>
          <li>## = amendment number (01)</li>
        </ul>
        <p>
          State abbreviation is separated by dash (-) and later sections are separated by periods
          (.). For example, the waiver number KY-0003.R02.02 is a waiver for the state of Kentucky,
          with a initial waiver number of 0003, a second renewal (R02), and a second amendment (02).
          Amendments for initial waivers without renewals should use “R00” as their renewal number.
        </p>
      </div>
    ),
  },
  {
    anchorText: "waiver-id-help",
    question: "Who can I contact to help me figure out the correct 1915(b) Waiver Number?",
    answerJSX: (
      <p>
        Email{" "}
        <a
          className="text-blue-600 underline hover:no-underline"
          href="mailto:MCOGDMCOActions@cms.hhs.gov"
          onClick={handleSupportLinkClick("general")}
        >
          MCOGDMCOActions@cms.hhs.gov
        </a>{" "}
        to get support with determining the correct 1915(b) Waiver Number.
      </p>
    ),
  },
  {
    anchorText: "waiver-c-id",
    question: "What format is used to enter a 1915(c) waiver number?",
    answerJSX: (
      <div className="space-y-2">
        <p>Waiver number must follow the format SS-####.R##.## or SS-#####.R##.## to include:</p>
        <ul className="list-disc pl-7 space-y-2">
          <li>SS = 2 character state abbreviation</li>
          <li>##### = 4 or 5 digit waiver initial number</li>
          <li>R## = renewal number (R01, R02, ...) (Use R00 for waivers without renewals)</li>
          <li>## = appendix K amendment number (01)</li>
        </ul>
        <p>
          State abbreviation is followed by a dash (-). All other sections are separated by periods
          (.). For example, the waiver number KY-0003.R02.02 is a waiver for the state of Kentucky,
          with a initial waiver number of 0003, the second renewal (R02) and the second appendix K
          amendment (02). Initial waivers without renewals should use “R00” as their renewal number.
        </p>
      </div>
    ),
  },
  {
    anchorText: "waiverb-attachments",
    question: "What attachments are needed to submit a 1915(b) waiver action?",
    answerJSX: (
      <>
        <p>
          The regulations at 42 C.F.R. §430.25, 431.55 and 42 C.F.R. §441.301 describe the
          requirements for submitting section 1915(b) and 1915(c) waivers.
        </p>
        <table className="faq-table border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                1915(b)(4) FFS Selective Contracting (Streamlined) waiver application pre-print
                (Initial, Renewal, Amendment)
              </td>
              <td className="border border-gray-300 px-4 py-2">
                State submission of the 1915(b)(4) Waiver Fee-for-Service Selective Contracting
                Program preprint narrative (Sections A, B, and C)
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                1915(b) Comprehensive (Capitated) Waiver Application Pre-print (Initial, Renewal,
                Amendment)
              </td>
              <td className="border border-gray-300 px-4 py-2">
                State submission of the 1915(b) preprint narrative (Sections A, B, C and D) (non-FFS
                Selective Contracting Waiver programs)
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                1915(b) Comprehensive (Capitated) Waiver Cost effectiveness spreadsheets (Initial,
                Renewal, Amendment)
              </td>
              <td className="border border-gray-300 px-4 py-2">
                Appendix D Cost Effectiveness Demonstration for 1915(b) Waivers only (not applicable
                to 1915(b)(4) Fee-for-Service Selective Contracting programs)
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                1915(b)(4) FFS Selective Contracting (Streamlined) and 1915(b) Comprehensive
                (Capitated) Waiver Independent Assessment (first two renewals only)
              </td>
              <td className="border border-gray-300 px-4 py-2">
                State submission of the findings from the Independent Assessment of their 1915(b)
                waiver program
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                Tribal Consultation (Initial, Renewal, Amendment)
              </td>
              <td className="border border-gray-300 px-4 py-2">
                Document that outlines the changes the waiver action is making and the impact that
                tribes can expect from the waiver action
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Other</td>
              <td className="border border-gray-300 px-4 py-2">
                {`Any other documents or spreadsheets that are supplemental to
                    the state's waiver application`}
              </td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    anchorText: "waiverb-rai-attachments",
    question:
      "What are the attachments for a 1915(b) Waiver and 1915(c) Appendix K response to Request for Additional Information (RAI)?",
    answerJSX: (
      <>
        <p>
          <span>Note: “*” indicates a required attachment.</span>
        </p>
        <table className="faq-table border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Waiver RAI Response Letter*</td>
              <td className="border border-gray-300 px-4 py-2">
                Official response to CMS to support RAI inquiries for the Waiver submission
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Other</td>
              <td className="border border-gray-300 px-4 py-2">
                {`Any other documents or spreadsheets that are supplemental to
                    the state's response to RAI`}
              </td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    anchorText: "waiver-extension-id-format",
    question: "What format is used to enter a 1915(b) or 1915(c) Temporary Extension number?",
    answerJSX: (
      <div className="space-y-2">
        <p>
          Temporary extension numbers must follow the format SS-####.R##.TE## or SS-#####.R##.TE##
          to include:
        </p>
        <ul className="list-disc pl-7 space-y-2">
          <li>SS = 2 character state abbreviation</li>
          <li>####(#)= 4 or 5 digit initial waiver number</li>
          <li>R## = renewal number (R01, R02, ...) (Use R00 for waivers without renewals)</li>
          <li>TE## = temporary extension number, prefixed with a capital TE (TE01)</li>
        </ul>
        <p>
          State abbreviation is separated by dash (-) and later sections are separated by periods
          (.). For example, the waiver number KY-0003.R02.TE02 is a waiver for the state of
          Kentucky, with a initial waiver number of 0003, a second renewal (R02), and a second
          temporary extension (02). Initial waivers without renewals should use “R00” as their
          renewal number.
        </p>
      </div>
    ),
  },
  {
    anchorText: "waiver-extension-status",
    question:
      "Why does the status of my Temporary Extension Request continue to show as 'Submitted'?",
    answerJSX: (
      <p>
        Temporary Extensions Requests will only show a status of ‘Submitted’ in the OneMAC system at
        this time. Their status does not update regardless of where that request is in the
        Submission Review process.
      </p>
    ),
  },
  {
    anchorText: "temporary-extensions-b-attachments",
    question: "What are the attachments for a 1915(b) Waiver - Request for Temporary Extension?",
    answerJSX: (
      <>
        <p>Note: “*” indicates a required attachment.</p>
        <table className="faq-table border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Waiver Extension Request*</td>
              <td className="border border-gray-300 px-4 py-2">
                A formal letter addressed to Carrie Smith, Deputy Director of the Disabled and
                Elderly Health Program Group (DEHPG), requesting a temporary extension beyond the
                current approved waiver period.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Other</td>
              <td className="border border-gray-300 px-4 py-2">
                Supplemental documents for the Waiver Extension Request
              </td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    anchorText: "temporary-extensions-c-attachments",
    question: "What are the attachments for a 1915(c) Waiver - Request for Temporary Extension?",
    answerJSX: (
      <>
        <p>Note: “*” indicates a required attachment.</p>
        <table className="faq-table border-collapse border border-gray-300 w-full ">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Waiver Extension Request*</td>
              <td className="border border-gray-300 px-4 py-2">
                A formal letter addressed to George Failla, Director of the Division of HCBS
                Operations & Oversight requesting a temporary extension beyond the current approved
                waiver period.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Other</td>
              <td className="border border-gray-300 px-4 py-2">
                Supplemental documents for the Waiver Extension Request
              </td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    anchorText: "appk",
    question: "Can I submit Appendix K amendments in OneMAC?",
    answerJSX: <p>Yes, you can submit Appendix K amendments in the 1915(c) Appendix K form.</p>,
  },
  {
    anchorText: "appk-attachments",
    question: "What are the attachments for a 1915(c) Appendix K Waiver?",
    answerJSX: (
      <>
        <p>
          The regulations at 42 C.F.R. §430.25, 431.55 and 42 C.F.R. §441.301 describe the
          requirements for submitting section 1915(b) and 1915(c) waivers.
        </p>
        <p>Note: “*” indicates a required attachment.</p>
        <table className="faq-table border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                1915(c) Appendix K Amendment Waiver Template*
              </td>
              <td className="border border-gray-300 px-4 py-2">
                Official amendments to 1915(c) waiver programs addressing or in response to
                Disasters or Emergencies.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">Other</td>
              <td className="border border-gray-300 px-4 py-2">
                Supplemental documents for the 1915(c) Appendix K waiver amendment
              </td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    anchorText: "formal-request-waiver",
    question:
      "How do I submit a Formal Request for Additional Information (RAI) Response for a Waiver?",
    answerJSX: (
      <div className="w-full space-y-2">
        <p>When necessary, states will receive an RAI via email from CMS.</p>
        <ul className="ml-8 list-disc space-y-2">
          <li>The state will respond to the RAI through OneMAC.</li>
          <li>
            A Request for Additional Information (RAI) stops the 90-day clock, is a formal request
            for additional information from CMS.
          </li>
          <li>
            Packages pending an official RAI response from the state will have a Status of{" "}
            <b>RAI Issued.</b>
          </li>
        </ul>
        <p>To respond to a Waiver RAI, select the Waiver Tab view from the Package Dashboard.</p>
        <ul className="ml-8 list-disc space-y-2">
          <li>
            Select the link to the Waiver ID. Packages which are in need of an RAI response from the
            state will have a Status of <b>RAI Issued.</b>
          </li>
          <li>Then, under Package Actions, select the Respond to RAI link.</li>
          <li>
            After attaching any required files, you may include additional notes prior to clicking
            on the submit button.
          </li>
          <li>Check your entries, as you cannot edit the submission after you select Submit.</li>
        </ul>
      </div>
    ),
  },
  {
    anchorText: "withdraw-waiver-rai-response",
    question: "How do I Withdraw a Formal RAI Response for a Medicaid Waiver?",
    answerJSX: (
      <div className="w-full space-y-2">
        <p>
          If a state wishes to withdraw a Formal RAI Response, the state must first contact their
          CMS Point of Contact so the action can be enabled.
        </p>
        <ul className="list-disc ml-7">
          <li>
            As a CMS user, log in to OneMAC and select the link to the Waiver number from the
            dashboard
          </li>
          <li>
            Then, under Package Actions, select the Enable Formal RAI Response Withdraw link, and
            then Select Submit.
          </li>
        </ul>
        <p>
          After receiving confirmation from your CMS Point of Contact that the Withdraw Formal RAI
          Response feature has been enabled, locate and select the Medicaid Waiver submission
          package.
        </p>
        <p>
          The package status remains as Under Review and a substatus of Withdraw Formal RAI Response
          Enabled will be reflected below the status for the SPA or waiver submission package.
        </p>
        <p>
          <b>
            Note: These submissions will remain on the clock until the package action has been
            taken.
          </b>
        </p>
        <ul className="list-disc ml-7 space-y-2">
          <li>
            On the Formal RAI Response Withdraw form, upload any supporting documentation and fill
            out the Additional Information section explaining your need to withdraw the Formal RAI
            Response (all required information is marked with an asterisk).
          </li>
          <li>
            Select Submit.
            <ul className="list-disc ml-12">
              <li>
                You will receive a confirmation message asking if you are sure that you want to
                withdraw the Formal RAI Response. Select Yes, withdraw response.
              </li>
            </ul>
          </li>
        </ul>
      </div>
    ),
  },
  {
    anchorText: "withdraw-package-waiver",
    question: "How do I Withdraw a Package for a Waiver?",
    answerJSX: (
      <div className="w-full space-y-2">
        <p>
          A state can withdraw a submission package if it is in the Under Review or RAI Issued
          status. However, please note that once withdrawn, a submission package cannot be
          resubmitted to CMS.{" "}
          <b>Completing this action will conclude the review of this Waiver package.</b>
        </p>
        <p>There are two methods you can use to withdraw a submission package:</p>
        <ul className="list-disc ml-7 space-y-2">
          <li>
            In OneMAC, Locate and select the link to the Waiver ID. Then, under Package Actions,
            select the Withdraw Package link.
          </li>
          <li>
            Alternatively, the Withdraw Package action can be accessed by selecting the three dots
            icon in the Actions column on the Package Dashboard. Then, select Withdraw Package from
            the drop-down list.
          </li>
        </ul>
        <p>
          A warning message will appear letting you know that if the package is withdrawn, it cannot
          be resubmitted and this action will conclude the review of this package.
        </p>
        <p>Select Yes, withdraw package to complete the task.</p>
      </div>
    ),
  },
];
