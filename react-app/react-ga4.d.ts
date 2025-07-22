/* eslint-disable @typescript-eslint/no-unused-vars */
import { initialize, send } from "react-ga4";

declare module "react-ga4" {
  export function event(options: UaEventOptions): void;
  export function initialize(trackingId: string, options?: any): void;
  export function send(event: any): void;
  export function set(options: any): void;

  // Add custom dimensions that would otherwise be blocked by typescript
  export type UaEventOptions = {
    state?: string; // state the event takes place for
    user_role?: string; // role of the logged in user
    [key: string]: any;
  };
}
