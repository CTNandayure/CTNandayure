// A cleared optional field arrives as '' (or null): store it as null so it gets
// removed instead of failing validation as an empty value.
export const blankToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;
