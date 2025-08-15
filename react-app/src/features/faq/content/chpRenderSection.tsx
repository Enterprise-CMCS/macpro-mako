import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { handleSupportLinkClick } from "./oneMACFAQContent";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export interface Template {
  title: string;
  text?: string;
  href: string;
  subtext?: string[];
}

export const renderSection = (
  title: string,
  templates: Template[],
  filterCondition: (template: Template) => boolean,
  ulClassName: string = "",
  download: boolean = false,
) => (
  <>
    <p>{title}</p>
    <ul className={cn("list-disc pl-6 space-y-2", ulClassName)}>
      {templates.filter(filterCondition).map((template) => (
        <li key={template.title}>
          {download ? (
            <a
              download={template.href}
              href={template.href}
              rel="noopener noreferrer"
              className="text-blue-600"
              onClick={handleSupportLinkClick("template")}
            >
              {template.title}: {template.text}
            </a>
          ) : (
            <a
              href={template.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600"
              onClick={handleSupportLinkClick("template")}
            >
              {template.title}: {template.text}
            </a>
          )}
          {template.subtext && template.subtext.length > 0 && (
            <ul className="list-disc pl-6 space-y-1">
              {template.subtext.map((sub, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {sub}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </>
);
