export const sortByItemNamePredicate = (a: Item, b: Item): number => {
  if (a.name === null && b.name === null) return 0;
  if (a.name === null) return -1;
  if (b.name === null) return 1;

  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;

  return 0;
};
