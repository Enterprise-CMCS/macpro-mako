export const WithdrawWaiverRaiResponse = () => (
  <div className="w-full space-y-2">
    <p>
      If a state wishes to withdraw a Formal RAI Response, the state must first contact their CMS
      Point of Contact so the action can be enabled.
    </p>
    <ul className="list-disc ml-7" role="list">
      <li>
        As a CMS user, log in to OneMAC and select the link to the Waiver number from the dashboard
      </li>
      <li>
        Then, under Package Actions, select the Enable Formal RAI Response Withdraw link, and then
        Select Submit.
      </li>
    </ul>
    <p>
      After receiving confirmation from your CMS Point of Contact that the Withdraw Formal RAI
      Response feature has been enabled, locate and select the Medicaid Waiver submission package.
    </p>
    <p>
      The package status remains as Under Review and a substatus of Withdraw Formal RAI Response
      Enabled will be reflected below the status for the SPA or waiver submission package.
    </p>
    <p>
      <b>
        Note: These submissions will remain on the clock until the package action has been taken.
      </b>
    </p>
    <ul className="list-disc ml-7 space-y-2" role="list">
      <li>
        On the Formal RAI Response Withdraw form, upload any supporting documentation and fill out
        the Additional Information section explaining your need to withdraw the Formal RAI Response
        (all required information is marked with an asterisk).
      </li>
      <li>
        Select Submit.
        <ul className="list-disc ml-12" role="list">
          <li>
            You will receive a confirmation message asking if you are sure that you want to withdraw
            the Formal RAI Response. Select Yes, withdraw response.
          </li>
        </ul>
      </li>
    </ul>
  </div>
);
