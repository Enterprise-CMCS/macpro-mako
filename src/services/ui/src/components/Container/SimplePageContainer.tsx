import { PropsWithChildren } from "react";

export const SimplePageContainer = ({ children }: PropsWithChildren) => (
  <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">{children}</div>
);
