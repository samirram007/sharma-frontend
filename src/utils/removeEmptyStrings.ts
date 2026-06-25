// export const removeEmptyStrings = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== ''));
export const removeEmptyStrings = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== '' && v !== null)
  );
export const upperCaseFirstLetter = (str: string) => {
  if (!str) return
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const lowerCaseFirstLetter = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const capitalizeWords = (str: string) => str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(); });

export const capitalizeAllWords = (str: string) => str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(); });

export const upperCase = (str: string) => str.toUpperCase();

export const lowerCase = (str: string) => str.toLowerCase();
export const fallbackText = (str: string) => {
  if (!str || typeof str !== "string") return ""; // Handle empty or invalid input

  const words = str.trim().split(/\s+/); // Split by spaces, trimming extra spaces
  if (words.length === 1) {
    return words[0][0].toUpperCase(); // Single word: return the first letter
  }

  const firstLetter = words[0][0].toUpperCase();
  const lastLetter = words[words.length - 1][0].toUpperCase();

  return firstLetter + lastLetter;
};


export const date_format = (value: string | Date) => {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export function toSentenceCase(input: string): string {
  if (typeof input !== "string" || !input.trim()) {
    return input;
  }

  const normalized = input
    // camelCase & PascalCase → space separated
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // snake_case & kebab-case → space separated
    .replace(/[_-]+/g, " ")
    // normalize spacing
    .trim()
    .toLocaleLowerCase();

  return normalized.charAt(0).toLocaleUpperCase() + normalized.slice(1);
}

