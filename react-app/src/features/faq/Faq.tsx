import { useCallback, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  CardWithTopBorder,
  SubNavHeader,
} from "@/components";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

import { helpDeskContact, oneMACFAQContent } from "./content/oneMACFAQContent";

export const Faq = () => {
  const isFAQHidden = useFeatureFlag("TOGGLE_FAQ");

  const { id } = useParams<{ id: string }>();

  const [openItems, setOpenItems] = useState<string[]>([]);

  const expandAll = useCallback(() => {
    const allIds = [];
    oneMACFAQContent.forEach(({ qanda }) => {
      qanda.forEach(({ anchorText }) => allIds.push(anchorText));
    });
    setOpenItems(allIds);
  }, [setOpenItems]);

  useEffect(() => {
    if (id) {
      const element = document.getElementById(id);
      if (element) {
        setOpenItems([id]);
        window.scrollTo({
          top: element.offsetTop,
          behavior: "smooth",
        });
      }
    }
  }, [id]);

  // Get the flag value for hiding the MMDL banner.
  const isBannerHidden = useFeatureFlag("UAT_HIDE_MMDL_BANNER");
  const isUpdateNewLabel = useFeatureFlag("UPGRADE_NEW_LABEL");
  const isChipSpaDetailsEnabled = useFeatureFlag("CHIP_SPA_DETAILS");

  const chipSpaFAQ = isChipSpaDetailsEnabled
    ? {
        anchorText: "chip-spa-attachments",
        question: "What are the attachments for a CHIP SPA?",
        label: null,
        labelColor: null,
        answerJSX: (
          <>
            <p className="font-bold">CHIP SPA Attachment Types:</p>
            <p className="ml-12">Note: “*” indicates a required attachment.</p>
            <table className="faq-table ml-12 border-collapse border border-gray-300 w-full ">
              <tbody>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Current State Plan*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Current version of the CHIP state plan that details how the State operates its
                    CHIP program
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                    Amended State Plan Language*
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Track changes to <span className="underline">only</span> the currently approved
                    CHIP state plan pages that the State is proposing to amend
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Cover Letter*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Cover letter to CMS with an authorized signature that outlines the purpose of
                    the CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Budget Documents</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Updated 1-year budget if applicable of the State's planned expenditures if the
                    CHIP SPA submission has a significant impact on the approved budget
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Public Notice</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Process used by the State if applicable to accomplish involvement of the public
                    that occurred specifically for this CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Tribal Consultation</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Consultation process with Indian Tribes if applicable that occurred specifically
                    for this CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Other supporting document(s) needed to process the CHIP SPA submission
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="font-bold mt-12">CHIP Eligibility SPA Attachment Types:</p>
            <p className="ml-12">Note: “*” indicates a required attachment.</p>
            <table className="faq-eligibility-table ml-12 border-collapse border border-gray-300 w-full ">
              <tbody>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                    CHIP Eligibility Template*
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Amendment to the eligibility section of the CHIP state plan using a PDF template
                    repository, including statutory and regulatory background, required information,
                    and minimum review criteria
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Cover Letter*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Cover letter to CMS with an authorized signature that outlines the purpose of
                    the CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Current State Plan</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Current version of the CHIP state plan that details how the State operates its
                    CHIP program
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                    Amended State Plan Language
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Track changes to <span className="underline">only</span> the currently approved
                    CHIP state plan pages that the State is proposing to amend
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Budget Documents</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Updated 1-year budget if applicable of the State's planned expenditures if the
                    CHIP SPA submission has a significant impact on the approved budget
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Public Notice</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Process used by the State if applicable to accomplish involvement of the public
                    that occurred specifically for this CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Tribal Consultation</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Consultation process with Indian Tribes if applicable that occurred specifically
                    for this CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Other supporting document(s) needed to process the CHIP Eligibility SPA
                    submission
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      }
    : {
        anchorText: "chip-spa-attachments",
        question: "What are the attachments for a CHIP SPA?",
        answerJSX: (
          <>
            <p>Note: “*” indicates a required attachment.</p>
            <table className="faq-table border-collapse border border-gray-300 w-full ">
              <tbody>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
                  <th className="border border-gray-300 px-4 py-2">Description</th>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Current State Plan*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Current version of the CHIP state plan that details how the State operates its
                    CHIP program
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Amended State Plan Language*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Redline version of proposed changes to the existing CHIP state plan pages. State
                    to provide a redline version and a clean version of the CHIP state plan pages
                    being amended.
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Cover Letter*</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Cover letter to CMS with an authorized signature that outlines the purpose of
                    the CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Budget Documents</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Updated 1-year budget if applicable of the State's planned expenditures if the
                    CHIP SPA submission has a significant impact on the approved budget
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Public Notice</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Process used by the State if applicable to accomplish involvement of the public
                    that occurred specifically for this CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Tribal Consultation</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Consultation process with Indian Tribes if applicable that occurred specifically
                    for this CHIP SPA submission
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Other</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Other document(s) needed to process the CHIP SPA submission
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ),
      };

  const anchorsToHide = [
    "spa-admendments",
    "abp-spa-templates",
    "abp-implementation-guides-spa",
    "mpc-spa-templates",
    "mpc-spa-implementation-guides",
    "chip-spa-templates",
    "chip-spa-implentation-guides",
  ];

  const filteredFAQContent = oneMACFAQContent.map((section) => {
    if (section.sectionTitle === "State Plan Amendments (SPAs)") {
      const filteredQanda = isBannerHidden
        ? section.qanda.filter((qa) => !anchorsToHide.includes(qa.anchorText))
        : section.qanda;

      const existingQanda = filteredQanda.filter((qa) => qa.anchorText !== "chip-spa-attachments");

      // Find the correct index for chip-spa-attachments to appear before RAI question
      const raiIndex = existingQanda.findIndex(
        (qa) => qa.anchorText === "chip-spa-rai-attachments",
      );

      const updatedQanda = [
        ...existingQanda.slice(0, raiIndex),
        chipSpaFAQ,
        ...existingQanda.slice(raiIndex),
      ];

      return { ...section, qanda: updatedQanda };
    }
    return section;
  });

  if (isFAQHidden) {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Frequently Asked Questions</h1>
      </SubNavHeader>
      <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <div className="flex-1">
          <article className="mb-8">
            {/* BUTTON */}
            <Button
              onClick={expandAll}
              variant="outline"
              data-testid="expand-all"
              className="w-full xs:w-fit hover:bg-transparent mb-5"
            >
              Expand all to search with CTRL + F
            </Button>

            {/* FAQ */}
            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
              {filteredFAQContent.map(({ sectionTitle, qanda }) => (
                <article key={sectionTitle} className="mb-8">
                  <h2 className="text-2xl mb-4 text-primary">{sectionTitle}</h2>
                  {qanda.map(({ anchorText, answerJSX, question, label, labelColor }) => (
                    <AccordionItem
                      value={anchorText}
                      id={anchorText}
                      key={anchorText}
                      data-testid={anchorText}
                    >
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          {isUpdateNewLabel && label && (
                            <span
                              className={`text-white text-xs font-semibold px-2 py-0.5 rounded no-underline hover:no-underline ${
                                labelColor === "green"
                                  ? "bg-green-600"
                                  : labelColor === "blue"
                                    ? "bg-blue-600"
                                    : "bg-gray-500"
                              }`}
                            >
                              {label}
                            </span>
                          )}
                          <span className="hover:underline">{question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>{answerJSX}</AccordionContent>
                    </AccordionItem>
                  ))}
                </article>
              ))}
            </Accordion>
          </article>
        </div>
        <div>
          <CardWithTopBorder className="sticky top-5">
            <div className="p-4">
              <h3 className="text-lg text-bold mb-4">OneMAC Help Desk Contact Info</h3>
              <div>
                <b>Phone Number</b>
                <p className="mb-4 text-primary">
                  <a className="underline" href={`tel:${helpDeskContact.phone}`}>
                    {helpDeskContact.phone}
                  </a>
                </p>
                <b>Email</b>
                <p className="text-primary">
                  <a className="underline" href={`mailto:${helpDeskContact.email}`}>
                    {helpDeskContact.email}
                  </a>
                </p>
              </div>
            </div>
          </CardWithTopBorder>
        </div>
      </section>
    </>
  );
};
