export const WaiverRenewalIdFormat = () => (
  <div className="space-y-2">
    <p>
      1915(b) Waiver Renewal must follow the format SS-####.R##.00 or SS-#####.R##.00 to include:
    </p>
    <ul className="list-disc pl-7 space-y-2" role="list">
      <li>SS = 2 character state abbreviation</li>
      <li>####(#)= 4 or 5 digit initial waiver number</li>
      <li>R## = renewal number (R01, R02, ...)</li>
      <li>00 = amendment number (00 for renewals)</li>
    </ul>
    <p>
      State abbreviation is separated by dash (-) and later sections are separated by periods (.).
      For example, the waiver number KY-0003.R02.00 is a waiver for the state of Kentucky, with a
      initial waiver number of 0003, a second renewal (R02), and no amendment number (00).
    </p>
  </div>
);
