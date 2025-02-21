import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';

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
      
      <div className="mt-8 border-2 border-blue-600 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-2">Not finding the information you need?</h3>
        <div className="space-y-2">
          <p className="font-medium">Contact the Help Desk</p>
          <p>Email: <a href="mailto:OneMAC_Helpdesk@CMS.hhs.gov" className="text-blue-600 hover:underline">OneMAC_Helpdesk@CMS.hhs.gov</a></p>
          <p>Leave a message at <a href="tel:(883) 228-2540" className="hover:underline">(883) 228-2540</a></p>
        </div>
      </div>
    </div>
  );
};

export default LeftNavigation;