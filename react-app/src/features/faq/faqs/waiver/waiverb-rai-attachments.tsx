export const WaiverBRaiAttachments = () => (
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
);
