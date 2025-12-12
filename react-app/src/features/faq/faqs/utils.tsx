import { cn } from "@/utils";

export interface Template {
  title: string;
  text?: string;
  href: string;
  subtext?: string[];
  downloadName?: string;
}

export const helpDeskContact = {
  email: "OneMAC_Helpdesk@cms.hhs.gov",
  phone: "(833) 228-2540",
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 40);

export const handleSupportLinkClick = (type: string) => (e: React.MouseEvent<HTMLElement>) => {
  const text = e.currentTarget.textContent?.trim() || "unknown";
  window.gtag("event", `support_click_${type}_${slugify(text)}`, {
    event_category: "Support",
    event_label: text,
  });
};

export const PdfLink = ({
  href,
  title,
  text,
  label,
  downloadName,
  className = "underline hover:no-underline",
}: {
  href: string;
  title: string;
  text?: string;
  label: string;
  className?: string;
  downloadName?: string;
}) => (
  <a
    className={cn("text-primary", className)}
    href={href}
    download={downloadName ?? true}
    rel="noopener noreferrer"
    target="_blank"
    onClick={handleSupportLinkClick(label)}
  >
    {title}
    {text && `: ${text}`}
  </a>
);

export const PdfList = ({
  list,
  label,
  ulClassName = "list-disc pl-6 space-y-2",
}: {
  list: Template[];
  label: string;
  ulClassName?: string;
}) => (
  <ul className={ulClassName} role="list">
    {list.map((pdf) => (
      <li key={pdf.title}>
        <PdfLink
          href={pdf.href}
          title={pdf.title}
          text={pdf.text}
          label={label}
          downloadName={pdf.downloadName}
          className=""
        />
        {pdf.subtext && (
          <ul className="list-disc pl-7 space-y-1" role="list">
            {pdf.subtext.map((sub, index) => (
              <li key={index} className="text-sm text-gray-600">
                {sub}
              </li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
);
