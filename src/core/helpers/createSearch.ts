import slugify from "slugify";

// export const createSearch = (str: string) => {
//   return slugify(str, {
//     replacement: " ",
//     lower: true,
//     strict: true,
//     locale: "vi"
//   });
// };

export const createSearch = (str: string) => {
  const slug = slugify(str, {
    replacement: " ",
    lower: true,
    strict: true,
    locale: "vi",
  });
  const pattern = slug.replace(/\s+/g, ".*");

  return pattern;
};