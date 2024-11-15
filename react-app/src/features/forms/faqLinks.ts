export const getFAQLinkForAttachments = (eventName: string) => {
  const faqLinks = new Map<string, string>([
    ["new-medicaid-submission", "/faq/medicaid-spa-attachments"],
    ["new-chip-submission", "/faq/chip-spa-attachments"],
    ["respond-to-rai-medicaid", "/faq/medicaid-spa-rai-attachments"],
    ["respond-to-rai-waiver", "/faq/waiverb-rai-attachments"],
    ["respond-to-rai-chip", "/faq/chip-spa-rai-attachments"],
    ["app-k", "/faq/appk-attachments"],
    ["capitated-amendment", "/faq/waiverb-attachments"],
    ["capitated-initial", "/faq/waiverb-attachments"],
    ["capitated-renewal", "/faq/waiverb-attachments"],
    ["contracting-amendment", "/faq/waiverb-attachments"],
    ["contracting-initial", "/faq/waiverb-attachments"],
    ["contracting-renewal", "/faq/waiverb-attachments"],
    ["temporary-extension", "/faq/temporary-extensions-b-attachments"],
  ]);

  return faqLinks.get(eventName) ?? "/faq";
};
