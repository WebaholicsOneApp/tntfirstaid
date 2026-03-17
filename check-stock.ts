import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    host: 'ineapp-west-db-flex-replica.postgres.database.azure.com',
    user: 'storefront_app',
    password: 'Xk9mP2vL8nQ4wRt7jBc3yHs',
    database: 'postgres',
    port: 5432,
    ssl: { rejectUnauthorized: false },
  },
});

async function check() {
  const feedTable = 'catalogue_feed_c_10_s_147';

  const feedRows = await db(feedTable).select('productId', 'variationId');
  const variationIds = feedRows.map((r: any) => r.variationId);

  console.log('=== STOCK ANALYSIS ===');
  console.log('Variations in feed:', variationIds.length);

  // MS: all qty=0, cost=0 confirmed
  console.log('\nManufacturer suppliers: 248 entries, ALL with qty=0, cost=0');

  // Full sample MS entry
  const sampleMs = await db('manufacturer_suppliers')
    .whereIn('variationId', variationIds)
    .whereNull('deletedAt')
    .first();
  console.log('\nFull sample MS:', JSON.stringify(sampleMs, null, 2));

  // Store listings (uses deactivatedAt not deletedAt)
  const slCount = await db('store_listings')
    .whereIn('variationId', variationIds)
    .whereNull('deactivatedAt')
    .count('* as cnt')
    .first();
  console.log('\nActive store listings count:', slCount?.cnt);

  if (Number(slCount?.cnt) > 0) {
    const sampleSl = await db('store_listings')
      .whereIn('variationId', variationIds)
      .whereNull('deactivatedAt')
      .first();
    console.log('Sample store listing:', JSON.stringify(sampleSl, null, 2));
  }

  // Also check: do any store_listings exist at all (including deactivated)?
  const slTotal = await db('store_listings')
    .whereIn('variationId', variationIds)
    .count('* as cnt')
    .first();
  console.log('Total store listings (including deactivated):', slTotal?.cnt);

  await db.destroy();
}

check().catch(e => { console.error(e.message); process.exit(1); });
