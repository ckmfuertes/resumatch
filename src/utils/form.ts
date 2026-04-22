export function parseFormData(formData: FormData) {
  const data: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;

    // Handle empty strings as null
    if (value === "") {
      data[key] = null;
      continue;
    }

    // Keep other values as strings
    data[key] = value;
  }

  return data;
}
