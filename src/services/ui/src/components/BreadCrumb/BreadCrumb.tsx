import { Link } from "react-router-dom";

type BreadCrumbProps = {
  to: string;
};

export const BreadCrumb = ({
  to,
  children,
}: React.PropsWithChildren<BreadCrumbProps>) => {
  return <Link to={to}>{children}</Link>;
};

export const BreadCrumbBar = ({ children }: React.PropsWithChildren) => {
  return <div className="flex flex-col lg:flex-row">{children}</div>;
};
