import slugify from "slugify";

export const createSearch = (str: string) => {
  return slugify(str, {
    replacement: " ",
    lower: true,
    strict: true,
    locale: "vi"
  });
};