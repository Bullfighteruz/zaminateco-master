import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function findDuplicateKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const stack = [new Map()];
  const duplicates = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const keyMatch = line.match(/^(\s*)"([^"]+)"\s*:\s*(.*)/);

    const opensBlock = line.includes('{');
    const closesBlock = line.includes('}');

    if (closesBlock && !opensBlock) {
      if (stack.length > 1) stack.pop();
    }

    if (keyMatch) {
      const key = keyMatch[2];
      const currentScope = stack[stack.length - 1];
      if (currentScope.has(key)) {
        duplicates.push({
          key,
          firstLine: currentScope.get(key),
          duplicateLine: i + 1,
          filePath
        });
      } else {
        currentScope.set(key, i + 1);
      }
    }

    if (opensBlock && !closesBlock) {
      stack.push(new Map());
    }
  }
  return duplicates;
}

function scanDirForDuplicates(dir) {
  let allDups = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      allDups = allDups.concat(scanDirForDuplicates(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      const dups = findDuplicateKeys(fullPath);
      allDups = allDups.concat(dups);
    }
  }
  return allDups;
}

describe('ZAMINAT.eco — CTO Data Integrity, Factual Network States & Locale Audit', () => {
  const rootDir = process.cwd();

  it('1. Zero duplicate keys across all locale JSON files (EN, RU, UZ)', () => {
    const dups = scanDirForDuplicates(path.join(rootDir, 'src/locales'));
    assert.equal(dups.length, 0, `Expected 0 duplicate keys across all locales, found: ${JSON.stringify(dups, null, 2)}`);
  });

  it('2. Scanner.tsx CTA routes to /actions with collection mode and anchor', () => {
    const scannerSource = fs.readFileSync(path.join(rootDir, 'src/pages/Scanner.tsx'), 'utf-8');

    assert.ok(!scannerSource.includes('to="/vote"'), 'EcoScan CTA must not route to /vote');
    assert.ok(!scannerSource.includes('to={`/map?'), 'EcoScan CTA must not route to /map');
    assert.ok(
      scannerSource.includes('/actions?source=ecoscan&mode=collection'),
      'EcoScan CTA must route to /actions with mode=collection'
    );
    assert.ok(
      scannerSource.includes('#collection-map'),
      'EcoScan CTA must target #collection-map anchor'
    );
  });

  it('3. App.tsx redirects legacy /map and /ecomap routes to unified /actions', () => {
    const appSource = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf-8');

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

  it('4. collectionData.ts reflects strictly factual state (0 verified, 0 planned, 6 candidate zones)', () => {
    const collectionDataSource = fs.readFileSync(path.join(rootDir, 'src/lib/collectionData.ts'), 'utf-8');

    // 1. VERIFIED count is 0
    assert.ok(
      collectionDataSource.includes('VERIFIED_COLLECTION_POINTS: CollectionPointItem[] = []'),
      'VERIFIED_COLLECTION_POINTS must be 0'
    );

    // 2. PLANNED count is 0 (no authoritative leadership roadmap documents for specific sites yet)
    assert.ok(
      collectionDataSource.includes('PLANNED_COLLECTION_POINTS: CollectionPointItem[] = []'),
      'PLANNED_COLLECTION_POINTS must be 0'
    );

    // 3. CANDIDATE zones are district-level concepts, not invented facilities
    assert.ok(!collectionDataSource.includes("name: 'Chilonzor District Hub'"), 'Invented facility name removed');
    assert.ok(!collectionDataSource.includes("name: 'Yunusobod EcoHub'"), 'Invented facility name removed');
    assert.ok(!collectionDataSource.includes("name: 'Sergeli Polymer Point'"), 'Invented facility name removed');
    assert.ok(!collectionDataSource.includes("name: 'Tashkent Central Park'"), 'Unverified specific venue removed');

    // 4. Candidate zones exist with isOperational=false
    assert.ok(collectionDataSource.includes('CANDIDATE_COLLECTION_POINTS: CollectionPointItem[] = ['), 'Candidate zones defined');
    assert.ok(collectionDataSource.includes("district: 'Chilonzor'"), 'Chilonzor candidate zone exists');
    assert.ok(collectionDataSource.includes("district: 'Yunusobod'"), 'Yunusobod candidate zone exists');
    assert.ok(collectionDataSource.includes("district: 'Sergeli'"), 'Sergeli candidate zone exists');
  });

  it('5. EcoActions.tsx displays distinct factual counters', () => {
    const actionsSource = fs.readFileSync(path.join(rootDir, 'src/pages/EcoActions.tsx'), 'utf-8');

    // Distinct counters
    assert.ok(actionsSource.includes('verifiedPoints.length'), 'Displays verified count');
    assert.ok(actionsSource.includes('plannedPoints.length'), 'Displays planned count');
    assert.ok(actionsSource.includes('candidatePoints.length'), 'Displays candidate count');
    assert.ok(actionsSource.includes('ACTION_LOCATIONS.length'), 'Displays EcoActions count');
  });

  it('6. Candidate public wording conforms to non-committal expansion policy', () => {
    const ru = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/ru/actions-translations.json'), 'utf-8'));
    const uz = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/uz/actions-translations.json'), 'utf-8'));
    const en = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/locales/en/actions-translations.json'), 'utf-8'));

    assert.equal(ru.candidateZone, 'Рассматриваемая зона развития сети');
    assert.equal(ru.candidateStudyNotice, 'ZAMINAT изучает возможность развития сети в этом районе.');
    assert.equal(ru.noCommitmentNotice, 'Точное местоположение и открытие пока не подтверждены.');

    assert.equal(uz.candidateZone, "Tarmoqni rivojlantirish uchun ko'rib chiqilayotgan hudud");
    assert.equal(uz.candidateStudyNotice, "ZAMINAT ushbu hududda tarmoqni rivojlantirish imkoniyatlarini o'rganmoqda.");
    assert.equal(uz.noCommitmentNotice, "Aniq manzil va ochilish sanasi hozircha tasdiqlanmagan.");

    assert.equal(en.candidateZone, 'Potential network expansion area');
    assert.equal(en.candidateStudyNotice, 'ZAMINAT is evaluating this area for future network development.');
    assert.equal(en.noCommitmentNotice, 'Exact location and opening are not yet confirmed.');
  });
});
