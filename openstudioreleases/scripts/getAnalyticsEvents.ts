/**
 * Export all events from GA4 property 332455107 using the Google Analytics Data API.
 *
 * Prerequisites:
 *   1. The service account in firebase-service-account.json must have the
 *      "Viewer" role on the GA4 property (Google Analytics > Admin > Property Access Management).
 *   2. The Google Analytics Data API must be enabled in the Google Cloud project.
 *
 * Usage:
 *   yarn ga-events
 *   yarn ga-events --startDate 2024-01-01 --endDate 2024-12-31
 *   yarn ga-events --startDate 30daysAgo --endDate today
 *   yarn ga-events --eventName select_content          # filter to one event
 *
 * The contentId dimension is a GA4 built-in populated by select_content events.
 * It does not require custom dimension registration.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { writeJson } from './writeJson';
import { stringify } from 'csv-stringify/sync';
import fs from 'fs';
import path from 'path';

// ── Configuration ─────────────────────────────────────────────────────────────

const PROPERTY_ID = '332455107';
const PAGE_SIZE = 10_000; // max rows per API request

// Parse optional CLI date-range arguments (--startDate / --endDate)
const args = process.argv.slice(2);
const getArg = (flag: string, fallback: string): string => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
};

const startDate   = getArg('--startDate',  '2020-01-01');
const endDate     = getArg('--endDate',    'today');
const eventFilter = getArg('--eventName', '');   // e.g. "select_content"

// ── Legacy Tab-N normalization ────────────────────────────────────────────────
// Older OpenStudio versions sent contentId as "Tab-N" using the VerticalTabID enum.
// Map them to the modern human-readable names so the export is consistent.
const LEGACY_TAB_MAP: Record<string, string> = {
  'Tab-0':  'Location',      // SITE
  'Tab-1':  'Schedules',     // SCHEDULES
  'Tab-2':  'Constructions', // CONSTRUCTIONS
  'Tab-3':  'Loads',         // LOADS
  'Tab-4':  'SpaceTypes',    // SPACE_TYPES
  'Tab-5':  'Geometry',      // GEOMETRY
  'Tab-6':  'Facility',      // FACILITY
  'Tab-7':  'Spaces',        // SPACES
  'Tab-8':  'Thermal Zones', // THERMAL_ZONES
  'Tab-9':  'HVAC Systems',  // HVAC_SYSTEMS
  'Tab-10': 'Variables',     // OUTPUT_VARIABLES
  'Tab-11': 'Sim Settings',  // SIMULATION_SETTINGS
  'Tab-12': 'Scripts',       // RUBY_SCRIPTS
  'Tab-13': 'Run',           // RUN_SIMULATION
  'Tab-14': 'Results',       // RESULTS_SUMMARY
};

const normalizeContentId = (id: string): string => LEGACY_TAB_MAP[id] ?? id;

// ── GA4 client (uses service-account key file for auth) ───────────────────────

const analyticsClient = new BetaAnalyticsDataClient({
  keyFilename: path.resolve(__dirname, '..', 'firebase-service-account.json'),
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface EventRow {
  date: string;
  eventName: string;
  contentId: string;
  platform: string;
  country: string;
  eventCount: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchAllRows(): Promise<EventRow[]> {
  const allRows: EventRow[] = [];
  let offset = 0;

  // Optionally restrict to a single event name
  const dimensionFilter = eventFilter
    ? {
        filter: {
          fieldName: 'eventName',
          stringFilter: { matchType: 'EXACT' as const, value: eventFilter },
        },
      }
    : undefined;

  while (true) {
    const [response] = await analyticsClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'date' },
        { name: 'eventName' },
        // Built-in GA4 dimension populated by select_content events.
        { name: 'contentId' },
        { name: 'platform' },
        { name: 'country' },
      ],
      metrics: [
        { name: 'eventCount' },
      ],
      dimensionFilter,
      orderBys: [
        { dimension: { dimensionName: 'date' } },
        { dimension: { dimensionName: 'eventName' } },
        { metric: { metricName: 'eventCount' }, desc: true },
      ],
      limit: PAGE_SIZE,
      offset,
    });

    const rows = response.rows ?? [];

    for (const row of rows) {
      const dims = row.dimensionValues ?? [];
      const mets = row.metricValues ?? [];
      allRows.push({
        date:       dims[0]?.value ?? '',
        eventName:  dims[1]?.value ?? '',
        contentId:  normalizeContentId(dims[2]?.value ?? ''),
        platform:   dims[3]?.value ?? '',
        country:    dims[4]?.value ?? '',
        eventCount: parseInt(mets[0]?.value ?? '0', 10),
      });
    }

    console.log(
      rows.length
        ? `  Fetched rows ${offset + 1}–${offset + rows.length} (total so far: ${allRows.length})`
        : `  Fetched 0 rows (total so far: ${allRows.length})`
    );

    // Stop when we receive fewer rows than the page size
    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return allRows;
}

function writeCsvFile(filename: string, rows: EventRow[]): void {
  const csvPath = path.join(process.cwd(), `${filename}.csv`);
  const header = ['date', 'eventName', 'contentId', 'platform', 'country', 'eventCount'];

  const csvString = stringify([
    header,
    ...rows.map(r => [r.date, r.eventName, r.contentId, r.platform, r.country, r.eventCount]),
  ]);

  fs.writeFileSync(csvPath, csvString, 'utf8');
  console.log(`CSV written to: ${csvPath}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const run = async (): Promise<void> => {
  console.log(`Fetching GA4 events for property ${PROPERTY_ID}`);
  console.log(`Date range: ${startDate} → ${endDate}`);
  if (eventFilter) console.log(`Event filter: ${eventFilter}`);

  const rows = await fetchAllRows();

  console.log(`\nTotal rows: ${rows.length}`);

  const filterSuffix = eventFilter ? `_${eventFilter}` : '';
  const baseName = `ga_events_${PROPERTY_ID}${filterSuffix}_${startDate}_${endDate}`.replace(/[^a-z0-9_-]/gi, '_');

  writeCsvFile(baseName, rows);
  await writeJson(baseName, rows);

  // Print a quick summary: top 20 events by total count
  const eventTotals = new Map<string, number>();
  for (const r of rows) {
    eventTotals.set(r.eventName, (eventTotals.get(r.eventName) ?? 0) + r.eventCount);
  }
  const sortedEvents = [...eventTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  console.log('\nTop 20 events by total count:');
  sortedEvents.forEach(([name, count]) => console.log(`  ${name}: ${count.toLocaleString()}`));

  // Print top content_ids (for select_content or any filtered event)
  const contentTotals = new Map<string, number>();
  for (const r of rows) {
    if (!r.contentId || r.contentId === '(not set)') continue;
    contentTotals.set(r.contentId, (contentTotals.get(r.contentId) ?? 0) + r.eventCount);
  }
  if (contentTotals.size > 0) {
    const sortedContent = [...contentTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
    console.log('\nTop 20 content_id values by event count:');
    sortedContent.forEach(([id, count]) => console.log(`  ${id}: ${count.toLocaleString()}`));
  }

  // Warn about any contentId that is neither a known tab name nor an OpenStudio download
  const KNOWN_TABS = new Set(['Location','Run','Results','Constructions','HVAC Systems','Schedules',
    'Geometry','Spaces','Thermal Zones','SpaceTypes','Loads','Scripts','Facility','Sim Settings','Variables']);
  const unknown = [...contentTotals.keys()].filter(id => !KNOWN_TABS.has(id) && !id.startsWith('OpenStudio'));
  if (unknown.length > 0) {
    console.warn('\nWARNING: unexpected contentId values (may need LEGACY_TAB_MAP update):');
    unknown.forEach(id => console.warn(`  ${id}: ${contentTotals.get(id)?.toLocaleString()} events`));
  }
};

run().catch((err) => {
  console.error('Error fetching GA4 events:', err.message ?? err);
  process.exit(1);
});
