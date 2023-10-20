import { PropsWithChildren } from "react";

export const SimplePageContainer = ({
  children,
  width = "xl",
}: PropsWithChildren<{
  width?: "xl" | "lg";
}>) => (
  <div className={`max-w-screen-${width} mx-auto px-4 lg:px-8`}>{children}</div>
);
