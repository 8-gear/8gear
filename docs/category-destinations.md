# Category destinations

Promotional banners use database ID URLs hardcoded directly in the banner components, for example `/category?categoryId=6a65dfd4c52b57a1a991f913#category-listing`. They perform no destination API reads or database migrations. The existing listing category request resolves the ID to the current category name. Fleece points to Fleece Cargo; Denim to Riding Jeans; Chinos to Riding Chinos; Cargos to Riding Cargos. These IDs were read from the configured database.

Admin → Categories displays the database ID on category cards and in a read-only input when editing. Category creation and editing no longer use slugs. Product slugs remain in use for product detail URLs.

Historical category slug values remain in the database solely to support old URLs. Legacy `?cat=` links resolve by name or retained aliases when unambiguous. All newly generated links use IDs. If a category is deleted and recreated, update its ID URL in the corresponding banner components.

Run `node --env-file=.env.local scripts/remove-category-slug-index.mjs` once when applying this change to another database. This removes only the old slug unique index, which otherwise prevents creating multiple categories without slugs. It preserves existing records.

Run `node scripts/tests/category-destinations.cjs` for category creation without a slug, ID-based rename flow, product rename, and legacy URL regression checks with in-memory dependencies.
