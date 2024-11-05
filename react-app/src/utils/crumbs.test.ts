// crumbs.test.ts
import { describe, it, expect} from 'vitest';
import { Authority } from 'shared-types/authority';
import { Action } from 'shared-types/actions'; 
import {
  getDashboardTabForAuthority,
  detailsAndActionsCrumbs,
  dashboardCrumb,
  detailsCrumb,
  actionCrumb,
} from './crumbs';



describe('crumbs', () => {
    describe('getDashboardTabForAuthority', () => {
        it('should return "spas" for CHIP SPA', () => {
          const result = getDashboardTabForAuthority(Authority.CHIP_SPA);
          expect(result).toBe('spas');
        });
      
        it('should return "spas" for Medicaid SPA', () => {
          const result = getDashboardTabForAuthority(Authority.MED_SPA);
          expect(result).toBe('spas');
        });
      
        it('should return "waivers" for 1915(b)', () => {
          const result = getDashboardTabForAuthority(Authority["1915b"]);
          expect(result).toBe('waivers');
        });
      
        it('should return "waivers" for 1915(c)', () => {
          const result = getDashboardTabForAuthority(Authority["1915c"]);
          expect(result).toBe('waivers');
        });
      
        it('should throw an error for invalid authority', () => {
          expect(() => getDashboardTabForAuthority("invalid" as Authority)).toThrow("Invalid authority");
        });
    });

  describe('detailsAndActionsCrumbs', () => {
    const id = "12345";
    const authority = Authority.CHIP_SPA;

    it('should return the default breadcrumbs without action type', () => {
      const result = detailsAndActionsCrumbs({ id, authority });
      expect(result).toEqual([
        dashboardCrumb(authority),
        detailsCrumb(id, authority),
      ]);
    });

    it('should return the breadcrumbs including action crumb when actionType is provided', () => {
      const actionType: Action = Action.RESPOND_TO_RAI; // Use an actual Action value
      const result = detailsAndActionsCrumbs({ id, authority, actionType });
      expect(result).toEqual([
        dashboardCrumb(authority),
        detailsCrumb(id, authority),
        actionCrumb(actionType, id),
      ]);
    });
  });

  describe('dashboardCrumb', () => {
    it('should return correct breadcrumb for authority', () => {
      const result = dashboardCrumb(Authority.CHIP_SPA);
      expect(result).toEqual({
        displayText: "Dashboard",
        order: 1,
        default: true,
        to: "/dashboard?tab=spas",
      });
    });

    it('should return correct breadcrumb for no authority', () => {
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
      const authority = Authority.CHIP_SPA;

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
      const actionType: Action = Action.RESPOND_TO_RAI; // Use an actual Action value
      const id = "12345";

      const result = actionCrumb(actionType, id);
      expect(result).toEqual({
        displayText: "Respond to Formal RAI",
        order: 3,
        to: `/actions/${id}/${actionType}`,
      });
    });
  });
});
