// For @Transform on text inputs, so that validators see the value without the surrounding spaces
export const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);
