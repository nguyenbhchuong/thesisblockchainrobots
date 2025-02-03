export const trimText = (text: string, maxChars: number) => {
  return text.substring(0, 11) + (text.length > maxChars ? "..." : "");
};
