export const FormalRequestWaiver = () => (
  <div className="w-full space-y-2">
    <p>When necessary, states will receive an RAI via email from CMS.</p>
    <ul className="ml-8 list-disc space-y-2">
      <li>The state will respond to the RAI through OneMAC.</li>
      <li>
        A Request for Additional Information (RAI) stops the 90-day clock, is a formal request for
        additional information from CMS.
      </li>
      <li>
        Packages pending an official RAI response from the state will have a Status of{" "}
        <b>RAI Issued.</b>
      </li>
    </ul>
    <p>To respond to a Waiver RAI, select the Waiver Tab view from the Package Dashboard.</p>
    <ul className="ml-8 list-disc space-y-2">
      <li>
        Select the link to the Waiver ID. Packages which are in need of an RAI response from the
        state will have a Status of <b>RAI Issued.</b>
      </li>
      <li>Then, under Package Actions, select the Respond to RAI link.</li>
      <li>
        After attaching any required files, you may include additional notes prior to clicking on
        the submit button.
      </li>
      <li>Check your entries, as you cannot edit the submission after you select Submit.</li>
    </ul>
  </div>
);
