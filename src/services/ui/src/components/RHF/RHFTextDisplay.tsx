import { cn } from "@/utils";
import { Link } from "react-router-dom";
import { RHFTextField } from "shared-types";

interface RHFTextDisplayProps {
  text: RHFTextField;
}

export const RHFTextDisplay = (props: RHFTextDisplayProps) => {
  if (!Array.isArray(props.text)) return props.text;

  return (
    <>
      {...props.text?.map((t) => {
        if (typeof t === "string") return <>{t}</>;
        const orderedList = t?.listType === "ordered";

        switch (t?.type) {
          case "br":
            return (
              <>
                <span className="block pb-2"> {t.text} </span>
              </>
            );
          case "brWrap":
            return (
              <>
                <br /> {t.text} <br />
              </>
            );
          case "bold":
            return <b className={t.classname}>{t.text}</b>;
          case "italic":
            return <i className={t.classname}>{t.text}</i>;
          case "link":
            return (
              <Link
                to={t.link ?? "/"}
                className={cn("cursor-pointer text-blue-600 ml-0", t.classname)}
              >
                {t.text}
              </Link>
            );
          case "list":
            return (
              <>
                {orderedList && (
                  <ol>
                    {t?.list?.map((l, j) => {
                      return (
                        <li key={`listItem.${j}.${l.text}`}>
                          <RHFTextDisplay text={[l]} />
                        </li>
                      );
                    })}
                  </ol>
                )}
                {!orderedList && (
                  <ul>
                    {t?.list?.map((l, j) => {
                      return (
                        <li key={`listItem.${j}.${l.text}`}>
                          <RHFTextDisplay text={[l]} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            );
          default:
            return <span className={t.classname}>{t.text}</span>;
        }
      })}
    </>
  );
};
