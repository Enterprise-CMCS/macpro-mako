import React from "react";

const ContactHelpDesk: React.FC = () => {
  return (
    <div className="mt-6 p-4 border border-gray-300 rounded-lg">
      <p className="font-semibold">Not finding the information you need?</p>
      <p className="text-sm mt-2">
        <span className="font-semibold">Contact the Help Desk</span>
        <br />
        Email: <a href="mailto:OneMAC_Helpdesk@CMS.hhs.gov" className="text-blue-600">OneMAC_Helpdesk@CMS.hhs.gov</a>
        <br />
        Leave a message at <span className="font-semibold">(883) 228-2540</span>
      </p>
    </div>
  );
};

export default ContactHelpDesk;
