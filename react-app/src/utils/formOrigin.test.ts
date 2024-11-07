// formOrigin.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getFormOrigin, ORIGIN, DASHBOARD_ORIGIN, DETAILS_ORIGIN, SPA_SUBMISSION_ORIGIN, WAIVER_SUBMISSION_ORIGIN } from './formOrigin'; 
import { Authority } from 'shared-types/authority';
import { getDashboardTabForAuthority } from './crumbs'; 

// Mock the getDashboardTabForAuthority function
vi.mock('./crumbs', () => ({
  getDashboardTabForAuthority: vi.fn(),
}));

describe('getFormOrigin', () => {
  let originalLocation: Location;

  beforeEach(() => {
    // Store the original location object
    originalLocation = window.location;

    // Create a mock location object
    const mockLocation = {
      ...originalLocation,
      search: '',
      assign: vi.fn(),
      reload: vi.fn(),
      replace: vi.fn(),
    };

    // Use Object.defineProperty to replace window.location with the mock object
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore the original location object after each test
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
    vi.clearAllMocks(); // Clear mocks after each test
  });

  it('should return the correct pathname and search for DETAILS_ORIGIN', () => {
    window.location.search = `?${ORIGIN}=${DETAILS_ORIGIN}`;

    const authority: Authority = Authority.MED_SPA;
    const id = '12345';

    // Call the function
    const result = getFormOrigin({ id, authority });

  });

  it('should return the correct pathname and search for DASHBOARD_ORIGIN', () => {
    window.location.search = `?${ORIGIN}=${DASHBOARD_ORIGIN}`;
    
    const authority: Authority = Authority.CHIP_SPA;
    (getDashboardTabForAuthority as vi.Mock).mockReturnValue('someTab');

    const result = getFormOrigin({ authority });

    expect(result).toEqual({
      pathname: `/${DASHBOARD_ORIGIN}`,
      search: new URLSearchParams({ tab: 'someTab' }).toString(),
    });
  });

  it('should return the correct pathname for SPA_SUBMISSION_ORIGIN', () => {
    window.location.search = `?${ORIGIN}=${SPA_SUBMISSION_ORIGIN}`;

    const result = getFormOrigin();

    expect(result).toEqual({
      pathname: `/${DASHBOARD_ORIGIN}`,
      search: new URLSearchParams({ tab: SPA_SUBMISSION_ORIGIN }).toString(),
    });
  });

  it('should return the correct pathname for WAIVER_SUBMISSION_ORIGIN', () => {
    window.location.search = `?${ORIGIN}=${WAIVER_SUBMISSION_ORIGIN}`;

    const result = getFormOrigin();

    expect(result).toEqual({
      pathname: `/${DASHBOARD_ORIGIN}`,
      search: new URLSearchParams({ tab: WAIVER_SUBMISSION_ORIGIN }).toString(),
    });
  });

  it('should return the default pathname for unknown origin', () => {
    window.location.search = ''; // Simulating no origin

    const result = getFormOrigin();

    expect(result).toEqual({
      pathname: `/${DASHBOARD_ORIGIN}`,
    });
  });
});
