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

describe('getDashboardTabForAuthority', () => {
  it('should return "spas" for "CHIP SPA"', () => {
    const result = getDashboardTabForAuthority("CHIP SPA" as any);
    expect(result).toBe("spas");
  });

  it('should return "spas" for "Medicaid SPA"', () => {
    const result = getDashboardTabForAuthority("Medicaid SPA" as any);
    expect(result).toBe("spas");
  });

  it('should return "waivers" for "1915(b)"', () => {
    const result = getDashboardTabForAuthority("1915(b)" as any);
    expect(result).toBe("waivers");
  });

  it('should return "waivers" for "1915(c)"', () => {
    const result = getDashboardTabForAuthority("1915(c)" as any);
    expect(result).toBe("waivers");
  });

  it('should throw an error for an invalid authority', () => {
    expect(() => getDashboardTabForAuthority("Invalid Authority" as any)).toThrow("Invalid authority");
  });
});

describe('detailsAndActionsCrumbs', () => {
  const id = "12345";
  const authority = "CHIP SPA" as any;

  it('should return default breadcrumbs without actionType', () => {
    const expectedBreadcrumbs = [
      dashboardCrumb(authority),
      detailsCrumb(id, authority),
    ];
    const result = detailsAndActionsCrumbs({ id, authority });
    expect(result).toEqual(expectedBreadcrumbs);
  });

  it('should return breadcrumbs including action crumb when actionType is provided', () => {
    const actionType = Action.RESPOND_TO_RAI;
    const expectedBreadcrumbs = [
      dashboardCrumb(authority),
      detailsCrumb(id, authority),
      actionCrumb(actionType, id),
    ];
    const result = detailsAndActionsCrumbs({ id, authority, actionType });
    expect(result).toEqual(expectedBreadcrumbs);
  });
});

describe('dashboardCrumb', () => {
  it('should return correct breadcrumb with authority', () => {
    const result = dashboardCrumb("CHIP SPA" as any);
    const expected = {
      displayText: "Dashboard",
      order: 1,
      default: true,
      to: "/dashboard?tab=spas",
    };
    expect(result).toEqual(expected);
  });

  it('should return correct breadcrumb without authority', () => {
    const result = dashboardCrumb();
    const expected = {
      displayText: "Dashboard",
      order: 1,
      default: true,
      to: "/dashboard",
    };
    expect(result).toEqual(expected);
  });
});

describe('detailsCrumb', () => {
  it('should return the correct details breadcrumb', () => {
    const id = "12345";
    const authority = "CHIP SPA" as any;
    const result = detailsCrumb(id, authority);
    const expected = {
      displayText: id,
      order: 2,
      to: `/details/${authority}/${id}`,
    };
    expect(result).toEqual(expected);
  });
});

describe('actionCrumb', () => {
  it('should return the correct action breadcrumb', () => {
    const actionType = Action.RESPOND_TO_RAI;
    const id = "12345";
    const result = actionCrumb(actionType, id);
    const expected = {
      displayText: "Respond to Formal RAI",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    };
    expect(result).toEqual(expected);
  });
});

