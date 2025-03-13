export const getId = (val) => {
  if (val == null) return null;
  return typeof val === "object" ? val.id : val;
};
