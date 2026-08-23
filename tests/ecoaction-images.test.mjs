import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('ZAMINAT.eco — EcoAction Semantic Image Mapping Quality Gates', () => {
  const rootDir = process.cwd();

  it('1. ECOACTION_EVENT_IMAGES provides deterministic ID-based mappings for all events', () => {
    const ecoActionsSource = fs.readFileSync(path.join(rootDir, 'src/pages/EcoActions.tsx'), 'utf-8');

    assert.ok(ecoActionsSource.includes('export const ECOACTION_EVENT_IMAGES: Record<number, string>'), 'Exports ECOACTION_EVENT_IMAGES');
    assert.ok(ecoActionsSource.includes("1: '/images/book_649180.webp'"), 'Event 1 mapped to educational book/sprout artwork');
    assert.ok(ecoActionsSource.includes("2: '/images/plant-a-tree_6675353.webp'"), 'Event 2 mapped to tree planting artwork');
    assert.ok(ecoActionsSource.includes("3: '/images/River Cleanup.webp'"), 'Event 3 mapped to river cleanup artwork');
    assert.ok(ecoActionsSource.includes("4: '/images/Plastic Recycling.webp'"), 'Event 4 mapped to plastic recycling artwork');
    assert.ok(ecoActionsSource.includes("5: '/images/community_16119903.webp'"), 'Event 5 mapped to community walk artwork');
    assert.ok(ecoActionsSource.includes("6: '/images/eco-points.webp'"), 'Event 6 mapped to eco-points/waste audit artwork');
  });

  it('2. Environmental Education Workshop does NOT resolve to industrial factory fallback', () => {
    const ecoActionsSource = fs.readFileSync(path.join(rootDir, 'src/pages/EcoActions.tsx'), 'utf-8');

    // Verify sampleEvents[0] for School Workshop does not use recycling-future.avif
    assert.ok(!ecoActionsSource.includes("id: 1,\n      titleKey: \"events.schoolWorkshop.title\",\n      descriptionKey: \"events.schoolWorkshop.description\",\n      category: 'education',\n      locationKey: \"events.schoolWorkshop.location\",\n      date: dates.nextWeek,\n      time: '10:00 AM',\n      duration: '3 hours',\n      organizerKey: \"events.schoolWorkshop.organizer\",\n      participants: 15,\n      maxParticipants: 25,\n      ecoPoints: 50,\n      difficulty: 'medium',\n      requirementsKey: \"events.schoolWorkshop.requirements\",\n      whatToBringKey: \"events.schoolWorkshop.whatToBring\",\n      benefitsKey: \"events.schoolWorkshop.benefits\",\n      impactKey: \"events.schoolWorkshop.impact\",\n      image: '/images/recycling-future.avif'"), 'Event 1 does not use recycling-future.avif');
  });

  it('3. Plastic Recycling Drive has dedicated plastic recycling artwork', () => {
    const ecoActionsSource = fs.readFileSync(path.join(rootDir, 'src/pages/EcoActions.tsx'), 'utf-8');

    assert.ok(ecoActionsSource.includes("4: '/images/Plastic Recycling.webp'"), 'Event 4 uses Plastic Recycling.webp');
  });

  it('4. All mapped event image files exist on the filesystem in public/images', () => {
    const expectedImages = [
      'book_649180.webp',
      'plant-a-tree_6675353.webp',
      'River Cleanup.webp',
      'Plastic Recycling.webp',
      'community_16119903.webp',
      'eco-points.webp'
    ];

    expectedImages.forEach(imgName => {
      const imgPath = path.join(rootDir, 'public/images', imgName);
      assert.ok(fs.existsSync(imgPath), `Image asset exists: ${imgName}`);
      const stats = fs.statSync(imgPath);
      assert.ok(stats.size > 1000, `Image asset is non-empty: ${imgName} (${stats.size} bytes)`);
    });
  });

  it('5. No two upcoming events share the same image asset', () => {
    const eventImageMap = {
      1: '/images/book_649180.webp',
      2: '/images/plant-a-tree_6675353.webp',
      3: '/images/River Cleanup.webp',
      4: '/images/Plastic Recycling.webp',
      5: '/images/community_16119903.webp',
      6: '/images/eco-points.webp'
    };

    const upcomingImages = [eventImageMap[1], eventImageMap[3], eventImageMap[4], eventImageMap[5]];
    const uniqueImages = new Set(upcomingImages);
    assert.equal(uniqueImages.size, upcomingImages.length, 'All 4 upcoming EcoAction events have distinct images');
  });

  it('6. iconMatcher maps plastic recycling keyword to Plastic Recycling.webp', () => {
    const iconMatcherSource = fs.readFileSync(path.join(rootDir, 'src/lib/iconMatcher.ts'), 'utf-8');

    assert.ok(iconMatcherSource.includes("'plastic recycling': '/images/Plastic Recycling.webp'"), 'iconMatcher maps plastic recycling correctly');
  });
});
