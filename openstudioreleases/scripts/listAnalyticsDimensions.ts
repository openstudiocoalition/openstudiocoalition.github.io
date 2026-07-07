/**
 * List all dimensions (built-in + custom) available on GA4 property 332455107.
 * Use this to find the correct dimension name for custom event parameters like content_id.
 *
 * Usage:
 *   yarn ga-dimensions
 *   yarn ga-dimensions --filter content   # filter output by substring
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path';

const PROPERTY_ID = '332455107';

const args = process.argv.slice(2);
const filterIdx = args.indexOf('--filter');
const filterStr = filterIdx !== -1 && args[filterIdx + 1] ? args[filterIdx + 1].toLowerCase() : '';

const analyticsClient = new BetaAnalyticsDataClient({
  keyFilename: path.resolve(__dirname, '..', 'firebase-service-account.json'),
});

const run = async (): Promise<void> => {
  const [metadata] = await analyticsClient.getMetadata({
    name: `properties/${PROPERTY_ID}/metadata`,
  });

  const dims = metadata.dimensions ?? [];

  const filtered = filterStr
    ? dims.filter(d =>
        d.apiName?.toLowerCase().includes(filterStr) ||
        d.uiName?.toLowerCase().includes(filterStr) ||
        d.description?.toLowerCase().includes(filterStr)
      )
    : dims;

  // Separate custom dimensions from built-in
  const custom  = filtered.filter(d => d.customDefinition);
  const builtin = filtered.filter(d => !d.customDefinition);

  if (custom.length > 0) {
    console.log(`\n── Custom dimensions (${custom.length}) ──────────────────────`);
    custom.forEach(d => {
      console.log(`  apiName    : ${d.apiName}`);
      console.log(`  uiName     : ${d.uiName}`);
      console.log(`  description: ${d.description ?? ''}`);
      console.log('');
    });
  } else {
    console.log('\n(no custom dimensions found' + (filterStr ? ` matching "${filterStr}"` : '') + ')');
  }

  console.log(`\n── Built-in dimensions (${builtin.length}) ─────────────────────`);
  builtin.forEach(d => console.log(`  ${(d.apiName ?? '').padEnd(45)} ${d.uiName ?? ''}`));

  console.log(`\nTotal: ${filtered.length} dimensions (${custom.length} custom, ${builtin.length} built-in)` +
    (filterStr ? ` matching "${filterStr}" — ${dims.length} total on property` : ''));
};

run().catch((err) => {
  console.error('Error:', err.message ?? err);
  process.exit(1);
});
