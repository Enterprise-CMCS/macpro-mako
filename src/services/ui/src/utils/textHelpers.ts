export function removeUnderscoresAndCapitalize(str?: string): string | null {
  if (!str) return null;

  // Replace underscores with spaces
  const withoutUnderscores = str.replace(/_/g, " ");

  // Capitalize the first letter of every word
  const capitalized = withoutUnderscores
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Remove 's' from the end if it exists
  return capitalized.endsWith("s") ? capitalized.slice(0, -1) : capitalized;
}

export function convertCamelCaseToWords(input: string) {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space between lowercase and uppercase letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
    .trim(); // Remove any leading/trailing spaces
}
