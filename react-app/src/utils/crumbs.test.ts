import { describe, it, expect} from 'vitest';
import {
  getDashboardTabForAuthority,
  detailsAndActionsCrumbs,
  dashboardCrumb,
  detailsCrumb,
  actionCrumb,
} from './crumbs';
import { Action } from 'shared-types/actions';

describe('getDashboardTabForAuthority', () => {
   //test for authority  
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
    let actionType = Action.DISABLE_RAI_WITHDRAW;
    let id = "12345";
    let result = actionCrumb(actionType, id);
    let expected = {
      displayText: "Disable Formal RAI Response Withdraw",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    };
    actionType = Action.ENABLE_RAI_WITHDRAW;
    id = "12345";
    result = actionCrumb(actionType, id);
    expected = {
      displayText: "Enable Formal RAI Response Withdraw",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    };
    actionType = Action.RESPOND_TO_RAI;
    id = "12345";
    result = actionCrumb(actionType, id);
    expected = {
      displayText: "Respond to Formal RAI",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    };
    expect(result).toEqual(expected);
 
    expect(result).toEqual(expected);
    actionType = Action.WITHDRAW_PACKAGE;
    id = "12345";
    result = actionCrumb(actionType, id);
    expected = {
      displayText: "Withdraw Package",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    };
    expect(result).toEqual(expected);
    actionType = Action.WITHDRAW_RAI;
    id = "12345";
    result = actionCrumb(actionType, id);
    expected = {
      displayText: "Withdraw Formal RAI Response",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    };
    expect(result).toEqual(expected);
    actionType = Action.TEMP_EXTENSION;
    id = "12345";
    result = actionCrumb(actionType, id);
    expected = {
      displayText: "Request Temporary Extension",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    };
    expect(result).toEqual(expected);
    actionType = Action.AMEND_WAIVER;
    id = "12345";
    result = actionCrumb(actionType, id);
    expected = {
      displayText: "Add Amendment",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    };
    expect(result).toEqual(expected);
    actionType = Action.UPDATE_ID;
    id = "12345";
    result = actionCrumb(actionType, id);
    expected = {
      displayText: "Update ID",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    };
    expect(result).toEqual(expected);
    actionType = Action.UPLOAD_SUBSEQUENT_DOCUMENTS;
    id = "12345";
    result = actionCrumb(actionType, id);
    expected = {
      displayText: "Upload Subsequent Documents",
      order: 3,
      to: `/actions/${id}/${actionType}`,
    };
    expect(result).toEqual(expected);
  });
});
