import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components";
import { Contact } from 'lucide-react';
import ContactHelpDesk from './contactHelpDesk';

const LeftNavigation: React.FC = () => {
  return (
    <div className="h-full w-64 bg-white p-4 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6">Topics</h2>
      <Accordion type="multiple">
        {[
          'Frequently asked questions (FAQs)',
          'General',
          'Package actions',
          'Templates & implementation guides',
          'Access & roles',
          'User profile',
          'Glossary'
        ].map((item) => (
          <AccordionItem value={item} key={item}>
            <AccordionTrigger className="text-gray-700 hover:text-gray-900 py-2">
              {item}
            </AccordionTrigger>
            <AccordionContent>
              {/* Content for each section can be added here */}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <ContactHelpDesk />
    </div>
  );
};

export default LeftNavigation;