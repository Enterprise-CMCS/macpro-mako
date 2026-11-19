import type { MouseEvent } from "react";
import { CE_ATTACHMENT_LABELS } from "shared-types";

const openFaqAnchor = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  const targetElement = document.getElementById(href.substring(1));
  if (!targetElement) return;

  targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
  const buttonElement = targetElement.querySelector("button");
  if (buttonElement?.dataset.state === "closed") {
    buttonElement.click();
  }
};

export const CentraAttachments = () => (
  <div className="space-y-2">
    <p>
      A Community Engagement Short-Term Hardship Exception requires at least one file across the
      attachment slots below. You can upload multiple files in each slot.
    </p>
    <table className="faq-table border-collapse border border-gray-300 w-full">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Attachment Name</th>
          <th className="border border-gray-300 px-4 py-2">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-300 px-4 py-2">{CE_ATTACHMENT_LABELS.ceTemplate}</td>
          <td className="border border-gray-300 px-4 py-2">
            Template for the Community Engagement Short-Term Hardship Exception request.
          </td>
        </tr>
        <tr>
          <td className="border border-gray-300 px-4 py-2">{CE_ATTACHMENT_LABELS.other}</td>
          <td className="border border-gray-300 px-4 py-2">
            Additional documents that support the request.
          </td>
        </tr>
      </tbody>
    </table>
    <p>
      Subsequent documents use the same attachment slots. Explain why the additional documents are
      being submitted before you submit them.
    </p>
    <p>
      Accepted file formats are listed in{" "}
      <a
        className="text-primary"
        href="#acceptable-file-formats"
        onClick={openFaqAnchor("#acceptable-file-formats")}
      >
        What are the kinds of file formats I can upload into OneMAC
      </a>
      .
    </p>
  </div>
);
