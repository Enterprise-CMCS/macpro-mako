import React from "react";
import ContactHelpDesk from "./contactHelpDesk";

const LeftNavigation: React.FC = () => {
  return (
    <div className="h-full w-64 bg-white p-4 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6">Topics</h2>
      <nav>
        <ul className="space-y-3">
          {[
            'Frequently asked questions (FAQs)',
            'General',
            'Package actions',
            'Templates & implementation guides',
            'Access & roles',
            'User profile',
            'Glossary'
          ].map((item) => (
            <li key={item}>
              <a href="#" className="flex items-center justify-between text-gray-700 hover:text-gray-900">
                <span>{item}</span>
                <ChevronDown className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <ContactHelpDesk />
    </div>
  );
};

export default LeftNavigation;
