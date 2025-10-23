export const WaiverCId = () => (
  <div className="space-y-2">
    <p>Waiver number must follow the format SS-####.R##.## or SS-#####.R##.## to include:</p>
    <ul className="list-disc pl-7 space-y-2" role="list">
      <li>SS = 2 character state abbreviation</li>
      <li>##### = 4 or 5 digit waiver initial number</li>
      <li>R## = renewal number (R01, R02, ...) (Use R00 for waivers without renewals)</li>
      <li>## = appendix K amendment number (01)</li>
    </ul>
    <p>
      State abbreviation is followed by a dash (-). All other sections are separated by periods (.).
      For example, the waiver number KY-0003.R02.02 is a waiver for the state of Kentucky, with a
      initial waiver number of 0003, the second renewal (R02) and the second appendix K amendment
      (02). Initial waivers without renewals should use “R00” as their renewal number.
    </p>
  </div>
);
