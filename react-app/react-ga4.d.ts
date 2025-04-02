// lib/react-ga4.d.ts
// import 'react-ga4'; // Import the module you're augmenting
import { event as gaEvent } from 'react-ga4';

declare module 'react-ga4' {
  export function event(options: UaEventOptions): void;
  export type UaEventOptions = {
    state?: string;  // Add your custom dimension here, like `state`
    user_role?: string;  // Add user_roles or other custom properties
    [key: string]: any;  // Allow other arbitrary properties for custom dimensions
  }
}

