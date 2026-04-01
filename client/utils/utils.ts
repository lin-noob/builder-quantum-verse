export const parseSerializedData = (value: unknown) => {
  if (!value) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"));
  } catch {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error("Failed to parse serialized wizard data:", error);
      return null;
    }
  }
};
