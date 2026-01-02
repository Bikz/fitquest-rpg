export const compareVersions = (a: string, b: string) => {
  const normalize = (value: string) =>
    value
      .split(".")
      .map((part) => Number(part))
      .map((num) => (Number.isNaN(num) ? 0 : num));

  const aParts = normalize(a);
  const bParts = normalize(b);
  const length = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < length; i += 1) {
    const left = aParts[i] ?? 0;
    const right = bParts[i] ?? 0;
    if (left > right) return 1;
    if (left < right) return -1;
  }

  return 0;
};
