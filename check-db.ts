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
  // Product 128964 = 22 Creedmoor SRP
  const pid = 128964;

  // Check brand
  const vars = await db('variations')
    .where('productId', pid)
    .whereNull('deletedAt')
    .select('id', 'brandId', 'variation', 'variationTwo', 'variantType', 'variantTypeTwo', 'manufacturerNo', 'packCount', 'itemPrice');
  console.log('Variations:');
  for (const v of vars) {
    console.log(`  id=${v.id} brandId=${v.brandId} variation=${v.variation} variationTwo=${v.variationTwo} variantType=${v.variantType} variantTypeTwo=${v.variantTypeTwo} mpn=${v.manufacturerNo} pack=${v.packCount} price=${v.itemPrice}`);
  }

  // Check brand entry
  if (vars.length > 0 && vars[0].brandId) {
    const brand = await db('brands').where('id', vars[0].brandId).first('id', 'brand');
    console.log('\nBrand:', JSON.stringify(brand));
  } else {
    console.log('\nNo brandId on variations');
    // Check store product for brand
    const sp = await db('store_products').where('id', pid).first('id', 'name', 'brandId');
    console.log('Store product brandId:', sp?.brandId);
  }

  // Check company brands for Alpha Munitions
  const companyBrands = await db('company_brands')
    .where('companyId', 10)
    .select('id', 'brandId');
  console.log('\nCompany brands for companyId=10:', companyBrands.length);
  for (const cb of companyBrands.slice(0, 5)) {
    const brand = await db('brands').where('id', cb.brandId).first('id', 'brand');
    console.log(`  brandId=${cb.brandId} name=${brand?.brand}`);
  }

  await db.destroy();
}

check().catch(e => { console.error(e.message); process.exit(1); });
