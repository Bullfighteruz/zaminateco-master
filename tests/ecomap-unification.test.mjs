import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('ZAMINAT.eco — Three Collection States & Network Expansion Map', () => {
  const rootDir = process.cwd();

  it('1. Scanner.tsx CTA routes to /actions with collection mode and anchor', () => {
    const scannerSource = fs.readFileSync(path.join(rootDir, 'src/pages/Scanner.tsx'), 'utf-8');

    // Assert EcoScan CTA does not navigate to /vote or standalone /map
    assert.ok(!scannerSource.includes('to="/vote"'), 'EcoScan CTA must not route to /vote');
    assert.ok(!scannerSource.includes('to={`/map?'), 'EcoScan CTA must not route to /map');

    // Assert EcoScan CTA routes to /actions?source=ecoscan&mode=collection
    assert.ok(
      scannerSource.includes('/actions?source=ecoscan&mode=collection'),
      'EcoScan CTA must route to /actions with mode=collection'
    );
    assert.ok(
      scannerSource.includes('#collection-map'),
      'EcoScan CTA must target #collection-map anchor'
    );
  });

  it('2. App.tsx redirects legacy /map and /ecomap routes to unified /actions', () => {
    const appSource = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf-8');

    // Assert /map and /ecomap redirect to /actions?mode=collection#collection-map
    assert.ok(
      appSource.includes('path="/map" element={<Navigate to="/actions?mode=collection#collection-map" replace />}'),
      'App.tsx must redirect /map to /actions'
    );
    assert.ok(
      appSource.includes('path="/ecomap" element={<Navigate to="/actions?mode=collection#collection-map" replace />}'),
      'App.tsx must redirect /ecomap to /actions'
    );
    assert.ok(!appSource.includes('pages/EcoMap'), 'App.tsx must not import EcoMap page');
  });

  it('3. collectionData.ts defines three clearly separated collection-location states', () => {
    const collectionDataSource = fs.readFileSync(path.join(rootDir, 'src/lib/collectionData.ts'), 'utf-8');

    // 1. VERIFIED count is 0
    assert.ok(
      collectionDataSource.includes('VERIFIED_COLLECTION_POINTS: CollectionPointItem[] = []'),
      'VERIFIED_COLLECTION_POINTS must be empty until physical verification'
    );

    // 2. PLANNED points exist and have status 'planned' with isOperational=false
    assert.ok(collectionDataSource.includes('PLANNED_COLLECTION_POINTS: CollectionPointItem[]'), 'PLANNED_COLLECTION_POINTS must exist');
    assert.ok(collectionDataSource.includes("status: 'planned'"), "Planned points must have status 'planned'");
    assert.ok(collectionDataSource.includes('isOperational: false'), 'Planned points must have isOperational: false');

    // 3. CANDIDATE zones exist and have status 'candidate' with isOperational=false
    assert.ok(collectionDataSource.includes('CANDIDATE_COLLECTION_POINTS: CollectionPointItem[]'), 'CANDIDATE_COLLECTION_POINTS must exist');
    assert.ok(collectionDataSource.includes("status: 'candidate'"), "Candidate points must have status 'candidate'");

    // 4. No unauthorized specific venue mocks (e.g. Tashkent Central Park as verified or planned point)
    assert.ok(!collectionDataSource.includes("name: 'Tashkent Central Park'"), 'Must not claim unverified Tashkent Central Park');

    // 5. Helper functions exported
    assert.ok(collectionDataSource.includes('export const getVerifiedCollectionPoints'), 'getVerifiedCollectionPoints exported');
    assert.ok(collectionDataSource.includes('export const getPlannedCollectionPoints'), 'getPlannedCollectionPoints exported');
    assert.ok(collectionDataSource.includes('export const getCandidateCollectionPoints'), 'getCandidateCollectionPoints exported');
    assert.ok(collectionDataSource.includes('export const getNetworkExpansionPoints'), 'getNetworkExpansionPoints exported');
    assert.ok(collectionDataSource.includes('export const getAllCollectionPoints'), 'getAllCollectionPoints exported');
  });

  it('4. EcoActions.tsx keeps separate counts and provides layer filters', () => {
    const actionsSource = fs.readFileSync(path.join(rootDir, 'src/pages/EcoActions.tsx'), 'utf-8');

    // Assert layer filters exist
    assert.ok(actionsSource.includes('mapCategoryFilter'), 'EcoActions must manage mapCategoryFilter');
    assert.ok(actionsSource.includes('filterVerified'), 'Filter for verified points exists');
    assert.ok(actionsSource.includes('filterNetwork'), 'Filter for network expansion exists');
    assert.ok(actionsSource.includes('filterActions'), 'Filter for eco-actions exists');

    // Assert counts are distinct in UI badges
    assert.ok(actionsSource.includes('verifiedPoints.length'), 'Displays verified points count');
    assert.ok(actionsSource.includes('networkPoints.length'), 'Displays network points count');
    assert.ok(actionsSource.includes('ACTION_LOCATIONS.length'), 'Displays action locations count');

    // Assert planned network CTA exists in empty state
    assert.ok(actionsSource.includes('actions.seePlannedNetwork'), 'Empty state offers CTA to view planned network');
  });

  it('5. InteractiveMap.tsx handles three statuses with honest indicators and no drop-off on planned', () => {
    const mapSource = fs.readFileSync(path.join(rootDir, 'src/components/InteractiveMap.tsx'), 'utf-8');

    assert.ok(mapSource.includes("status === 'planned'"), 'InteractiveMap handles planned status');
    assert.ok(mapSource.includes("status === 'candidate'"), 'InteractiveMap handles candidate status');
    assert.ok(mapSource.includes('actions.notOperationalYet'), 'Displays not operational yet for planned');
    assert.ok(mapSource.includes('actions.dropoffUnavailable'), 'Disallows drop-off for non-operational points');
  });

  it('6. Localizations contain complete strings in RU, UZ, EN for three states', () => {
    const ru = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/translation.json'), 'utf-8')).actions;
    const uz = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/translation.json'), 'utf-8')).actions;
    const en = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/translation.json'), 'utf-8')).actions;

    const requiredKeys = [
      'filterAll',
      'filterVerified',
      'filterNetwork',
      'filterActions',
      'plannedPoint',
      'notOperationalYet',
      'candidateZone',
      'underReview',
      'seePlannedNetwork',
      'verifiedCount',
      'networkCount',
      'actionsCount',
      'noVerifiedPointsForMaterialsTitle',
      'noVerifiedPointsForMaterialsDesc'
    ];

    for (const key of requiredKeys) {
      assert.ok(ru[key], `RU translation missing ${key}`);
      assert.ok(uz[key], `UZ translation missing ${key}`);
      assert.ok(en[key], `EN translation missing ${key}`);
    }
  });
});
