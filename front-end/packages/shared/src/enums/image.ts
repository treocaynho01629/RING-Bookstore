import _minBy from "lodash-es/minBy";

/**
 * Get image source
 * @param {Record<number, string>} srcSet
 * @param {number} width
 * @returns {string | undefined}
 */
export const getImageSrc = (srcSet: Record<number, string>, width: number): string | undefined => {
  if (!srcSet) return undefined;
  const entries = Object.entries(srcSet).map(([key, value]) => ({
    size: Number(key),
    src: value,
  }));
  const dynamicSrc = _minBy(entries as Array<{ size: number; src: string }>, (item) => Math.abs(item.size - width));
  return dynamicSrc?.src;
};
