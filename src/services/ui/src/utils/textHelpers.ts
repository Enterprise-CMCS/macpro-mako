export function removeUnderscoresAndCapitalize(
  str: string | null
): string | null {
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
