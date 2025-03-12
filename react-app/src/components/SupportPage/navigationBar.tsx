import React from "react";
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "@/components";
import ContactHelpDesk from "./contactHelpDesk";

const LeftNavigation: React.FC = () => {
  return (
    <div className="w-full bg-white pr-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 font-serif">Topics</h2>
      <Accordion type="multiple">
        {[
          "General",
          "Package actions",
          "Implementation guides",
          "Access & roles",
          "User profile",
          "Glossary",
        ].map((item) => (
          <AccordionItem value={item} key={item} className="border-none">
            <AccordionTrigger className="text-gray-700 hover:text-gray-900 py-2">
              <div className="font-semibold">{item}</div>
            </AccordionTrigger>
            <AccordionContent></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <ContactHelpDesk />
    </div>
  );
};

export default LeftNavigation;
