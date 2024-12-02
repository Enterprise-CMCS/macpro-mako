export const renderSection = (
    title: string,
    templates: any[],
    filterCondition: (template: any) => boolean,
    ulClassName: string = ""
  ): JSX.Element => (
    <>
      <p>{title}</p>
      <ul className={`list-disc pl-6 space-y-2 ${ulClassName}`}>
        {templates.filter(filterCondition).map((template) => (
          <li key={template.title}>
            <a
              href={template.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600"
            >
              {template.title}: {template.text}
            </a>
          </li>
        ))}
      </ul>
    </>
  );