export const WaiverExtensionIdFormat = () => (
  <div className="space-y-2">
    <p>
      Temporary extension numbers must follow the format SS-####.R##.TE## or SS-#####.R##.TE## to
      include:
    </p>
    <ul className="list-disc pl-7 space-y-2" role="list">
      <li>SS = 2 character state abbreviation</li>
      <li>####(#)= 4 or 5 digit initial waiver number</li>
      <li>R## = renewal number (R01, R02, ...) (Use R00 for waivers without renewals)</li>
      <li>TE## = temporary extension number, prefixed with a capital TE (TE01)</li>
    </ul>
    <p>
      State abbreviation is separated by dash (-) and later sections are separated by periods (.).
      For example, the waiver number KY-0003.R02.TE02 is a waiver for the state of Kentucky, with a
      initial waiver number of 0003, a second renewal (R02), and a second temporary extension (02).
      Initial waivers without renewals should use “R00” as their renewal number.
    </p>
  </div>
);
