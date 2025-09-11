import { handleSupportLinkClick } from "../utils";

export const MedicaidSpaAttachments = () => (
  <>
    <p>
      SPA submission requirements can be found in regulation&nbsp;
      <a
        className="text-primary underline hover:no-underline "
        href="https://www.ecfr.gov/cgi-bin/text-idx?SID=7d639b87112e05a57ff40731d647bd05&mc=true&node=se42.4.430_112&rgn=div8"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleSupportLinkClick("general")}
      >
        42 C.F.R. §430.12.
      </a>
    </p>
    <p>Note: “*” indicates a required attachment.</p>
    <table className="faq-table  border-collapse border border-gray-300 w-full ">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
          <th className="border border-gray-300 px-4 py-2">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-300 px-4 py-2">
            <p>
              <span>CMS-179 Form*</span>
            </p>
          </td>
          <td className="border border-gray-300 px-4 py-2">
            CMS-179 template that contains specific information for SPA submission. The CMS-179
            template is required for all Alternative Benefit Plan and Premiums and Cost Sharing SPA
            submissions.
          </td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">SPA Pages*</td>
          <td className="border border-gray-300 px-4 py-2">
            Clean versions of the State Plan pages being amended
          </td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">Cover Letter</td>
          <td className="border border-gray-300 px-4 py-2">
            Cover letter to CMS that could outline SPA submission. Please address the cover letter
            to: Center for Medicaid &amp; CHIP Services (CMCS)
          </td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">
            Document Demonstrating Good-Faith Tribal Engagement
          </td>
          <td className="border border-gray-300 px-4 py-2">
            Emails forwarding tribal notice to tribal leaders and tribal contacts; and/or tribal
            face-to-face meeting agendas indicating SPA discussion
          </td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">Existing State Plan Page(s)</td>
          <td className="border border-gray-300 px-4 py-2">
            Current approved SPA page, could include track changes to reflect changes
          </td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">Public Notice</td>
          <td className="border border-gray-300 px-4 py-2">
            Notice to stakeholders and interested parties that outlines the changes being proposed
            by SPA, feedback received from PN, and copies of websites- notices, state register
            notices, or newspaper notices that includes the date notice was posted
          </td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">Standard Funding Questions (SFQs)</td>
          <td className="border border-gray-300 px-4 py-2">
            Word document of the funding questions required to be submitted with reimbursement SPAs
          </td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">Tribal Consultation</td>
          <td className="border border-gray-300 px-4 py-2">
            Document that outline the changes SPA is making and the impact that tribes can expect
            from the SPA
          </td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">Other</td>
          <td className="border border-gray-300 px-4 py-2">
            UPLs, reimbursement methodology spreadsheet, Copies of legislation, any document that
            will assist in the review of SPA
          </td>
        </tr>
      </tbody>
    </table>
  </>
);
