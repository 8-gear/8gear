export type CategoryReference = { _id: unknown; name: string; slug?: string; aliases?: string[] };
export function categoryUrl(categoryId?: string, listing = false) {
  return `/category${categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''}${listing ? '#category-listing' : ''}`;
}
const normalize = (value: string) => value.trim().toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Never guess when a legacy value matches multiple categories.
export function resolveCategory<T extends CategoryReference>(categories: T[], id?: string | null, legacy?: string | null, slug?: string | null): T | undefined {
  if (id) return categories.find(category => String(category._id) === id);
  if (slug) {
    const matches = categories.filter(category => category.slug === slug || category.aliases?.includes(slug));
    return matches.length === 1 ? matches[0] : undefined;
  }
  if (!legacy || legacy === 'all') return undefined;
  const matches = categories.filter(category => [category.name, category.slug, ...(category.aliases || [])].some(value => value && normalize(value) === normalize(legacy)));
  return matches.length === 1 ? matches[0] : undefined;
}
