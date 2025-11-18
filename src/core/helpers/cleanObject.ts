export const cleanObject = (obj: any) => {
  const result = { ...obj };
  Object.keys(result).forEach((key) => {
    if (result[key] === "") result[key] = null;
  });
  return result;
}