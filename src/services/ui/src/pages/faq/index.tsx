import React, { useEffect, useState } from "react";
import PageTitleBar from "../../components/PageTitleBar/PageTitleBar";
import { helpDeskContact } from "../../lib/faq/helpDeskContact";
import { oneMACFAQContent } from "../../lib/faq/faqContent";

import { Accordion, AccordionItem } from "@cmsgov/design-system";

export const FAQ = () => {
  const [hash, setHash] = useState(window.location.hash.replace("#", ""));

  const hashHandler = () => {
    setHash((prev: any) => {
      const newHash = window.location.hash.replace("#", "");
      if (prev !== newHash) {
        return newHash;
      }
      return prev;
    });
  };

  window.addEventListener("hashchange", hashHandler);

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(`${hash}-button`);
      if (el) {
        el.scrollIntoView();
        el.focus();
        el.click();
      }
    }
    return () => {
      window.removeEventListener("hashchange", hashHandler);
    };
  }, [hash]);

  const renderFAQ = () => {
    return oneMACFAQContent.map((section, index) => (
      <div key={index} className="faq-section">
        <h2 className="topic-title">{section.sectionTitle}</h2>
        <Accordion>
          {section.qanda.map((questionAnswer, i) => (
            <div key={i}>
              <AccordionItem
                id={questionAnswer.anchorText}
                heading={questionAnswer.question}
                buttonClassName="accordion-button"
                contentClassName="accordion-content"
              >
                {questionAnswer.answerJSX}
              </AccordionItem>
              <hr></hr>
            </div>
          ))}
        </Accordion>
      </div>
    ));
  };

  const infoDetails = [
    {
      label: "Phone Number",
      linkType: "phone",
      infoValue: helpDeskContact.phone,
    },
    { label: "Email", linkType: "mailto", infoValue: helpDeskContact.email },
  ];

  const renderInfo = () => {
    return (
      <dl>
        {infoDetails.map((detail, i) => (
          <div key={i} className="faq-info-wrapper">
            <dt>{detail.label}</dt>
            <dd>
              <a href={`${detail.linkType}:${detail.infoValue}`}>
                {detail.infoValue}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    );
  };

  return (
    <div>
      <PageTitleBar heading="Frequently Asked Questions" />
      <div className="form-container" id="top">
        <div className="faq-card">
          <aside id="faq-contact-info-box">
            <div className="faq-border-box"></div>
            <div className="faq-info-box">
              <h2>OneMAC Help Desk Contact Info</h2>
              {renderInfo()}
            </div>
          </aside>
          <div className="faq-left-column">{renderFAQ()}</div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
