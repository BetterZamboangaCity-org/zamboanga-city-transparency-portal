/**
 * This portal's configuration: the only file a fork needs to edit.
 * What each field means: src/config.ts. Generate one with `npm run setup`;
 * check it against the live API with `npm run check`.
 *
 * Zamboanga City's two DPWH offices, plus projects naming the city.
 * Search matches are not surveyed locations; inter-city roads may extend
 * beyond the city. Reviewed namesakes are published as exclusions below.
 */
import { defineConfig } from './src/config';

export default defineConfig({
  id: 'zamboanga-city',
  kind: 'city',
  name: 'Zamboanga City',
  shortName: 'Zamboanga City',
  operator: {
    name: 'Chex',
    url: 'https://github.com/RALPH22222',
    contributor: { name: 'friends', url: 'https://github.com/BetterZamboangaCity-org' },
  },
  siteUrl: 'https://transparency.betterzamboangacity.org',
  scope: {
    offices: [
      'Zamboanga City 1st District Engineering Office',
      'Zamboanga City 2nd District Engineering Office',
    ],
    // Central Office city projects can be tagged NCR; a region filter loses them.
    places: [{ label: 'Zamboanga City', q: 'Zamboanga City' }],
    districts: ['leg:zamboanga-city:1st', 'leg:zamboanga-city:2nd'],
    // shortcut: reviewed against the current API snapshot; review new matches when data changes.
    exclude: [
      { key: 'dpwh:house-reading:5210', reason: 'The title locates this water system in Dapitan City, Zamboanga del Norte.' },
      { key: 'dpwh:house-reading:13529', reason: 'The title locates this building in Pagadian City, Zamboanga del Sur.' },
      { key: 'dpwh:house-reading:8682', reason: 'The title locates this road in Dapitan City, Zamboanga del Norte.' },
      { key: 'dpwh:house-reading:8683', reason: 'The title locates this road in Dapitan City, Zamboanga del Norte.' },
      { key: 'dpwh:house-reading:8704', reason: 'The title locates this road in Dipolog City.' },
      { key: 'dpwh:house-reading:2092', reason: 'The title locates this road between Dapitan City and Sibutad, Zamboanga del Norte.' },
      { key: 'dpwh:house-reading:8741', reason: 'The title locates this road in Pagadian City, Zamboanga del Sur.' },
      { key: 'dpwh:house-reading:516', reason: 'This is the Pagadian City Airport Road, under the Zamboanga del Sur 1st district office.' },
      { key: 'dpwh:house-reading:13627', reason: 'The title locates this building in Dipolog City, Zamboanga del Norte.' },
      { key: 'dpwh:house-reading:13660', reason: 'The title locates this building in Pagadian City, Zamboanga del Sur.' },
      { key: 'dpwh:house-reading:13599', reason: 'The title locates this school building in Dapitan City, Zamboanga del Norte.' },
      { key: 'dpwh:house-reading:13600', reason: 'This building is at Dapitan Central School in Dapitan City, Zamboanga del Norte.' },
      { key: 'dpwh:house-reading:13624', reason: 'The title locates this building in Dipolog City, Zamboanga del Norte.' },
      { key: 'dpwh:house-reading:6668', reason: 'Barangay Zamboanga is in Laoag City, Ilocos Norte; it is a namesake.' },
      { key: 'dpwh:house-reading:8715', reason: 'The title locates this road in Dipolog City, Zamboanga del Norte.' },
      { key: 'fmr:house_only:ib:p718:r4', reason: 'The title locates this farm-to-market road in Isabela City, Basilan.' },
      { key: 'fmr:pair:nep_fmr:p4:r14:ib:p670:r5', reason: 'Barangay Zamboanga is in Laoag City, Ilocos Norte; it is a namesake.' },
      { key: 'fmr:nep_only:nep_fmr:p40:r3', reason: 'The title locates this farm-to-market road in Isabela City.' },
      { key: 'fmr:nep_only:nep_fmr:p40:r4', reason: 'The title locates this farm-to-market road in Isabela City.' },
      { key: 'hfep:ib:p881:r54|infrastructure', reason: 'This health facility is the Dipolog City Health Office.' },
    ],
  },
  reporting: { enabled: false },
});
