import React from "react";
import ContactHelpDesk from "./contactHelpDesk";

const LeftNavigation: React.FC = () => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Topics</h2>
      <ul className="space-y-2">
        <li className="font-semibold">Frequently asked questions (FAQs)</li>
        <li className="font-semibold">General</li>
        <li className="font-semibold">Package actions</li>
        <li className="font-semibold">Templates & implementation guides</li>
        <li className="font-semibold">Access & roles</li>
        <li className="font-semibold">User profile</li>
        <li className="font-semibold">Glossary</li>
      </ul>
      <ContactHelpDesk />
    </div>
  );
};

export default LeftNavigation;
