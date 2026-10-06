// Run with: node --env-file=.env.local scripts/remove-category-slug-index.mjs
// Remove only the obsolete category slug uniqueness constraint. Keep historical
// slug values for old URLs, and leave category IDs, names, and products intact.
import mongoose from 'mongoose';
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const collection = mongoose.connection.collection('categories');
  for (const index of await collection.indexes()) {
    if (index.unique && Object.keys(index.key).length === 1 && index.key.slug === 1) {
      await collection.dropIndex(index.name);
      console.log('Removed obsolete category slug index');
    }
  }
} catch {
  console.error('Category index migration failed');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
