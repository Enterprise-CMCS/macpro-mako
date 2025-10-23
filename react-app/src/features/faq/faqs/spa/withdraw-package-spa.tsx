export const WithdrawPackageSpa = () => (
  <div className="w-full space-y-2">
    <p>
      A state can withdraw a submission package if it is in the Under Review or RAI Issued status.
      However, please note that once withdrawn, a submission package cannot be resubmitted to CMS.{" "}
      <b>Completing this action will conclude the review of this SPA package.</b>
    </p>
    <p>There are two methods you can use to withdraw a submission package:</p>
    <ul className="ml-8 list-disc space-y-2" role="list">
      <li>
        In OneMAC, Locate and select the link to the SPA ID. Then, under Package Actions, select the
        Withdraw Package link.
      </li>
      <li>
        Alternatively, the Withdraw Package action can be accessed by selecting the three dots icon
        in the Actions column on the Package Dashboard. Then, select Withdraw Package from the
        drop-down list.
      </li>
    </ul>
    <p>
      A warning message will appear letting you know that if the package is withdrawn, it cannot be
      resubmitted and this action will conclude the review of this package.
    </p>
    <p>Select Yes, withdraw package to complete the task.</p>
  </div>
);
