export function parseSpecifications(value: string) {
  return value
    .split('\n')
    .map((line, index) => {
      const [key, ...rest] = line.split(':');
      return { key: key.trim(), value: rest.join(':').trim(), sortOrder: index + 1 };
    })
    .filter((item) => item.key && item.value);
}
