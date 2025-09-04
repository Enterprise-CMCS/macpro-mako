export const InitialWaiverIdFormat = () => (
  <div className="space-y-2">
    <p>
      1915(b) Initial Waiver numbers must follow the format SS-####.R00.00 or SS-#####.R00.00 to
      include:
    </p>
    <ul className="list-disc pl-7 space-y-2">
      <li>SS = 2 character state abbreviation</li>
      <li>##### = 4 or 5 digit initial waiver number</li>
      <li>R00 = initial number</li>
      <li>00 = amendment number (00 for initial)</li>
    </ul>
    <p>
      State abbreviation is separated by dash (-) and later sections are separated by periods (.).
      For example, the waiver number KY-0003.R00.00 is a waiver for the state of Kentucky, with an
      initial waiver number of 0003, no renewal number (R00), and no amendment number (00).
    </p>
  </div>
);
