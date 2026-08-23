import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('ZAMINAT.eco — Unified Collection Map & EcoActions Architecture', () => {
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

  it('3. EcoActions.tsx implements collection mode, id="collection-map", and auto-scroll', () => {
    const actionsSource = fs.readFileSync(path.join(rootDir, 'src/pages/EcoActions.tsx'), 'utf-8');
    
    // Assert DOM anchor exists
    assert.ok(actionsSource.includes('id="collection-map"'), 'EcoActions must contain id="collection-map"');
    
    // Assert query param parsing
    assert.ok(actionsSource.includes('modeParam === \'collection\''), 'EcoActions must read collection mode param');
    assert.ok(actionsSource.includes('sourceParam === \'ecoscan\''), 'EcoActions must read source param');
    assert.ok(actionsSource.includes('scrollIntoView'), 'EcoActions must auto-scroll to collection-map');
    
    // Assert no mock coordinates array
    assert.ok(!actionsSource.includes('Tashkent Central Park'), 'EcoActions must not contain mock Tashkent Central Park');
    assert.ok(!actionsSource.includes('Yunusobod District\', lat: 41.372357'), 'EcoActions must not contain fake coordinates');
  });

  it('4. CollectionData provides 0 verified collection points (honest empty state)', () => {
    const collectionDataSource = fs.readFileSync(path.join(rootDir, 'src/lib/collectionData.ts'), 'utf-8');
    
    assert.ok(
      collectionDataSource.includes('VERIFIED_COLLECTION_POINTS: CollectionPointItem[] = []'),
      'VERIFIED_COLLECTION_POINTS must be an empty array until real physical verification exists'
    );
  });

  it('5. Localizations contain accurate honest empty state and search context in RU, UZ, EN', () => {
    const ruTranslations = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/translation.json'), 'utf-8'));
    const uzTranslations = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/translation.json'), 'utf-8'));
    const enTranslations = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/translation.json'), 'utf-8'));
    
    assert.ok(ruTranslations.actions?.noVerifiedPointsForMaterialsTitle, 'RU actions must have noVerifiedPointsForMaterialsTitle');
    assert.ok(uzTranslations.actions?.noVerifiedPointsForMaterialsTitle, 'UZ actions must have noVerifiedPointsForMaterialsTitle');
    assert.ok(enTranslations.actions?.noVerifiedPointsForMaterialsTitle, 'EN actions must have noVerifiedPointsForMaterialsTitle');
    
    assert.ok(ruTranslations.actions?.searchingForMaterials, 'RU actions must have searchingForMaterials');
    assert.ok(uzTranslations.actions?.searchingForMaterials, 'UZ actions must have searchingForMaterials');
    assert.ok(enTranslations.actions?.searchingForMaterials, 'EN actions must have searchingForMaterials');
  });
});
