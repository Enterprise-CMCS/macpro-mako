export enum SeatoolSpwStatusEnum {
  Pending = 1,
  PendingRAI = 2,
  PendingOffTheClock = 3,
  Approved = 4,
  Disapproved = 5,
  Withdrawn = 6,
  Terminated = 7,
  PendingConcurrence = 8,
  Unsubmitted = 9,
  PendingFinance = 10,
  PendingApproval = 11,
  // These are for placeholder statuses. Seatool expects a number returned for the zod object.
  WithdrawalRequested = 12,
  FormalRAIResponseWithdrawalRequested = 13,
  Submitted = 14,
}
// seatool authorities and authority ids.
export const SEATOOL_SPW_STATUS: { [key: string]: string } = {
  "1": "Pending",
  "2": "Pending-RAI",
  "3": "Pending-Off the Clock",
  "4": "Approved",
  "5": "Disapproved",
  "6": "Withdrawn",
  "7": "Terminated",
  "8": "Pending-Concurrence",
  "9": "Unsubmitted",
  "10": "Pending-Finance",
  "11": "Pending-Approval",
  // These are for our placeholder statuses.  Seatool expects a number returned for the zod object.
  "12": "Withdrawal Requested",
  "13": "Formal RAI Response - Withdrawal Requested",
  "14": "Submitted",
};
