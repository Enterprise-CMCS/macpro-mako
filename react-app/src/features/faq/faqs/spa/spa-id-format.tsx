export const SpaIdFormat = () => (
  <div className="space-y-2">
    <p>
      Enter the State Plan Amendment transmittal number. Assign consecutive numbers on a calendar
      year basis (e.g., 20-0001-XXXX, 20-0002-XXXX, etc.).
    </p>
    <p>
      The Official Submission package SPA ID must follow the format SS-YY-#### OR SS-YY-####-XXXX to
      include:
    </p>
    <ul className="list-disc ml-7 space-y-2" role="list">
      <li>SS = 2 alpha character (State Abbreviation)</li>
      <li>YY = 2 numeric digits (Year)</li>
      <li>#### = 4 numeric digits (Serial number)</li>
      <li>XXXX = OPTIONAL, 1 to 4 characters alpha/numeric modifier (Suffix)</li>
    </ul>
  </div>
);
