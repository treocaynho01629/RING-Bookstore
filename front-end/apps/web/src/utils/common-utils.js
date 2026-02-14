export const createCategoryCrumbs = (cate) => {
  if (!cate) return [];
  return [...createCategoryCrumbs(cate?.parent), { label: cate.name, href: `/store/${cate.slug}?cate=${cate.id}` }];
};
