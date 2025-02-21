import React from "react";

const ContactHelpDesk: React.FC = () => {
  return (
   <div className="mt-8 border-2 border-blue-600 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-2">Not finding the information you need?</h3>
        <div className="space-y-2">
            <p className="font-medium">Contact the Help Desk</p>
            <p>Email: <a href="mailto:OneMAC_Helpdesk@CMS.hhs.gov" className="text-blue-600 hover:underline">OneMAC_Helpdesk@CMS.hhs.gov</a></p>
            <p>Leave a message at <a href="tel:(883) 228-2540" className="hover:underline">(883) 228-2540</a></p>
        </div>
    </div>
  );
};

export default ContactHelpDesk;
