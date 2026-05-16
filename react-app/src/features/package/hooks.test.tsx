import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDetailsSidebarLinks } from "./hooks";

type SidebarLinksProbeProps = {
  onRender?: () => void;
};

const SidebarLinksProbe = ({ onRender }: SidebarLinksProbeProps) => {
  onRender?.();
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

  it("does not update sidebar links for unrelated mutations", async () => {
    const onRender = vi.fn();

    render(
      <div id="package_details_page">
        <SidebarLinksProbe onRender={onRender} />
        <div data-testid="mutation-target" />
      </div>,
    );

    expect(onRender).toHaveBeenCalledTimes(1);

    await act(async () => {
      screen.getByTestId("mutation-target").appendChild(document.createElement("span"));
      await Promise.resolve();
    });

    expect(onRender).toHaveBeenCalledTimes(1);
  });

  it("ignores administrative package changes outside the package details page", async () => {
    render(
      <div id="package_details_page">
        <SidebarLinksProbe />
      </div>,
    );

    const outsideSection = document.createElement("section");
    outsideSection.id = "administrative_package_changes";

    try {
      await act(async () => {
        document.body.appendChild(outsideSection);
        await Promise.resolve();
      });

      expect(screen.queryByText("Administrative Package Changes")).not.toBeInTheDocument();
    } finally {
      outsideSection.remove();
    }
  });
});
