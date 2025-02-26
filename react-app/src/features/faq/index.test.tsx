// my-test-file.js

import { render, screen } from '@testing-library/react';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { expect, vi, test } from "vitest";
import { Faq } from './index';  

// Mock the `useLDClient` hook from LaunchDarkly
vi.mock('launchdarkly-react-client-sdk', () => ({
    useLDClient: vi.fn(),
  }));

test('should render legacy faq when flag is false', () => {
// mock return false for toggleFaq flag
  (useLDClient as jest.Mock).mockReturnValue({
    allFlags: vi.fn().mockReturnValue({
      toggleFaq: false,
    }),
  });

  render(<Faq />);

  expect(screen.getByText('OneMAC Help Desk Contact Info')).toBeInTheDocument();
});

test('should render new faq when flag is true', () => {
// mock return true for toggleFaq flag
  (useLDClient as jest.Mock).mockReturnValue({
    allFlags: vi.fn().mockReturnValue({
      toggleFaq: true, 
    }),
  });

  render(<Faq />);

  expect(screen.getByText('New FAQ')).toBeInTheDocument();
});
