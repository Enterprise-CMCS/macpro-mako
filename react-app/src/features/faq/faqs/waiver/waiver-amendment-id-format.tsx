export const WaiverAmendmentIdFormat = () => (
  <div className="space-y-2">
    <p>
      1915(b) Waiver Amendment must follow the format SS-####.R##.## or SS-#####.R##.## to include:
    </p>
    <ul className="list-disc pl-7 space-y-2" role="list">
      <li>SS = 2 character state abbreviation</li>
      <li>####(#)= 4 or 5 digit initial waiver number</li>
      <li>R## = renewal number (R01, R02, ...)</li>
      <li>## = amendment number (01)</li>
    </ul>
    <p>
      State abbreviation is separated by dash (-) and later sections are separated by periods (.).
      For example, the waiver number KY-0003.R02.02 is a waiver for the state of Kentucky, with a
      initial waiver number of 0003, a second renewal (R02), and a second amendment (02). Amendments
      for initial waivers without renewals should use “R00” as their renewal number.
    </p>
  </div>
);
