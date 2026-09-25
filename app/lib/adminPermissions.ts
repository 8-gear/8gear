export const ADMIN_PAGES = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin' },
  { key: 'products', label: 'Products', href: '/admin/products' },
  { key: 'emails', label: 'Emails', href: '/admin/emails' },
  { key: 'orders', label: 'Orders', href: '/admin/orders' },
  { key: 'categories', label: 'Categories', href: '/admin/categories' },
  { key: 'reviews', label: 'Reviews', href: '/admin/reviews' },
  { key: 'leads', label: 'Checkout Leads', href: '/admin/leads' },
  { key: 'subscribers', label: 'Subscribers', href: '/admin/subscribers' },
  { key: 'users', label: 'Users', href: '/admin/users', superAdminOnly: true },
] as const;

export type AdminPageHref = (typeof ADMIN_PAGES)[number]['href'];

export function normalizeAdminPath(pathname: string) {
  const path = pathname.split('?')[0].split('#')[0];
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export function getAdminPageForPath(pathname: string): AdminPageHref | null {
  const path = normalizeAdminPath(pathname);
  const match = [...ADMIN_PAGES]
    .sort((a, b) => b.href.length - a.href.length)
    .find((page) =>
      page.href === '/admin'
        ? path === '/admin'
        : path === page.href || path.startsWith(`${page.href}/`)
    );
  return match?.href || null;
}

export function canAccessAdminPage(
  role: string | undefined,
  allowedPages: string[] | undefined,
  pathname: string
) {
  if (role === 'super_admin') return true;
  const page = getAdminPageForPath(pathname);
  if (!page) return false;
  if (page === '/admin') return true;
  const metadata = ADMIN_PAGES.find((item) => item.href === page);
  if (metadata && 'superAdminOnly' in metadata && metadata.superAdminOnly) return false;
  return Array.isArray(allowedPages) && allowedPages.includes(page);
}

export function cleanAllowedPages(value: unknown): AdminPageHref[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(
    ADMIN_PAGES.filter((page) => !('superAdminOnly' in page) || !page.superAdminOnly).map((page) => page.href)
  );
  return [...new Set(value.filter((item): item is AdminPageHref => typeof item === 'string' && allowed.has(item as AdminPageHref)))];
}
