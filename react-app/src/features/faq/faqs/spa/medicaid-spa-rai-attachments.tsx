export const MedicaidSpaRaiAttachments = () => (
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
          <td className="border border-gray-300 px-4 py-2">RAI Response Letter*</td>
          <td className="border border-gray-300 px-4 py-2">
            Letter responding to RAI questions, any updated SPA pages, and other documentation
            requested by CMS in the RAI
          </td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">Other</td>
          <td className="border border-gray-300 px-4 py-2">
            Additional document(s) needed to process the Medicaid SPA RAI submission
          </td>
        </tr>
      </tbody>
    </table>
  </>
);
