import React from "react";

const ContactHelpDesk = () => {
  return (
    <div className="mt-8 bg-gradient-to-t from-cyan-400 to-primary rounded-sm p-[3px]">
      <span className="flex flex-col w-full bg-white p-5">
        <h3 className="text-lg font-bold mb-2 font-serif">Not finding the information you need?</h3>
        <div className="text-sm">
          <p className="font-bold">Contact the Help Desk</p>
          <div className="text-xs break-words whitespace-normal m-0">
            <p>Business hours are 9am - 5pm ET</p>
            <p>
              Email:{" "}
              <a
                href="mailto:OneMAC_Helpdesk@CMS.hhs.gov"
                className="text-blue-600 hover:underline"
              >
                OneMAC_Helpdesk@CMS.hhs.gov
              </a>{" "}
            </p>
            <p>
              Leave a message at{" "}
              <a href="tel:(883) 228-2540" className="text-blue-600 hover:underline">
                (883) 228-2540
              </a>
            </p>
          </div>
        </div>
      </span>
    </div>
  );
};

export default ContactHelpDesk;
