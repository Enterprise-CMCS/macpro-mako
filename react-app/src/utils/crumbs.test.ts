// crumbs.test.ts
import { describe, it, expect, vi } from 'vitest';
import {
  getDashboardTabForAuthority,
  detailsAndActionsCrumbs,
  dashboardCrumb,
  detailsCrumb,
  actionCrumb,
} from './crumbs';
import { Action } from 'shared-types/actions';
import { BreadCrumbConfig } from "@/components";
import { Authority } from "shared-types/authority";


// Mocking `mapActionLabel` function, if needed, since we don't have implementation details
vi.mock('@/utils', () => ({
  mapActionLabel: (action: Action) => {
    switch (action) {
      case Action.RESPOND_TO_RAI:
        return "Respond to Formal RAI";
      case Action.WITHDRAW_RAI:
        return "Withdraw Formal RAI";
      default:
        return "Unknown Action";
    }
  },
}));

describe('getDashboardTabForAuthority', () => {
  it('should return "spas" for "CHIP SPA"', () => {
    const result = getDashboardTabForAuthority("CHIP SPA" as Authority);
    expect(result).toBe("spas");
  });

  it('should return "spas" for "Medicaid SPA"', () => {
    const result = getDashboardTabForAuthority("Medicaid SPA" as Authority);
    expect(result).toBe("spas");
  });

  it('should return "waivers" for "1915(b)"', () => {
    const result = getDashboardTabForAuthority("1915(b)" as Authority);
    expect(result).toBe("waivers");
  });

  it('should return "waivers" for "1915(c)"', () => {
    const result = getDashboardTabForAuthority("1915(c)" as Authority);
    expect(result).toBe("waivers");
  });

  it('should throw an error for an invalid authority', () => {
    expect(() => getDashboardTabForAuthority("Invalid Authority" as Authority)).toThrow("Invalid authority");
  });
});

describe('detailsAndActionsCrumbs', () => {
  const id = "12345";
  const authority = "CHIP SPA" as Authority;

  it('should return default breadcrumbs without actionType', () => {
    const result = detailsAndActionsCrumbs({ id, authority });
    expect(result).toEqual([
      dashboardCrumb(authority),
      detailsCrumb(id, authority),
    ]);
  });

  it('should return breadcrumbs including action crumb when actionType is provided', () => {
    const actionType = Action.RESPOND_TO_RAI;
    const result = detailsAndActionsCrumbs({ id, authority, actionType });
    expect(result).toEqual([
      dashboardCrumb(authority),
      detailsCrumb(id, authority),
      actionCrumb(actionType, id),
    ]);
  });
});

describe('dashboardCrumb', () => {
  it('should return correct breadcrumb with authority', () => {
    const result = dashboardCrumb("CHIP SPA" as Authority);
    expect(result).toEqual({
      displayText: "Dashboard",
      order: 1,
      default: true,
      to: "/dashboard?tab=spas",
    });
  });

  it('should return correct breadcrumb without authority', () => {
    const result = dashboardCrumb();
    expect(result).toEqual({
      displayText: "Dashboard",
      order: 1,
      default: true,
      to: "/dashboard",
    });
  });
});

describe('detailsCrumb', () => {
  it('should return the correct details breadcrumb', () => {
    const id = "12345";
    const authority = "CHIP SPA" as Authority;

    const result = detailsCrumb(id, authority);
    expect(result).toEqual({
      displayText: id,
      order: 2,
      to: `/details/${authority}/${id}`,
    });
  });
});

describe('actionCrumb', () => {
  it('should return the correct action breadcrumb', () => {
    const actionType = Action.RESPOND_TO_RAI;
    const id = "12345";
    const result = actionCrumb(actionType, id);

    expect(result).toEqual({
      displayText: "Respond to Formal RAI",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    });
  });
});
