import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDetailsSidebarLinks } from "./hooks";

const SidebarLinksProbe = () => {
  const links = useDetailsSidebarLinks();

  return (
    <ul>
      {links.map((link) => (
        <li key={link.id}>{link.displayName}</li>
      ))}
    </ul>
  );
};

describe("useDetailsSidebarLinks", () => {
  it("always includes package details and package activity links", () => {
    render(<SidebarLinksProbe />);

    expect(screen.getByText("Package Details")).toBeInTheDocument();
    expect(screen.getByText("Package Activity")).toBeInTheDocument();
  });

  it("adds the administrative package changes link when that section is present", async () => {
    render(
      <>
        <SidebarLinksProbe />
        <section id="administrative_package_changes" />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByText("Administrative Package Changes")).toBeInTheDocument();
    });
  });
});
