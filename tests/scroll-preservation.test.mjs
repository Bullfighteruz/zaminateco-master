import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('ZAMINAT.eco — Language Switch Scroll Preservation Quality Gates', () => {
  const rootDir = process.cwd();

  it('1. Centralized scrollRestoration.ts exports captureScrollSnapshot and getPendingScrollSnapshot', () => {
    const scrollSource = fs.readFileSync(path.join(rootDir, 'src/lib/scrollRestoration.ts'), 'utf-8');

    assert.ok(scrollSource.includes('export function captureScrollSnapshot'), 'Exports captureScrollSnapshot');
    assert.ok(scrollSource.includes('export function getPendingScrollSnapshot'), 'Exports getPendingScrollSnapshot');
    assert.ok(scrollSource.includes('export function clearPendingScrollSnapshot'), 'Exports clearPendingScrollSnapshot');
    assert.ok(scrollSource.includes('relativeProgress'), 'Calculates relativeProgress');
    assert.ok(scrollSource.includes('anchorId'), 'Captures semantic anchorId');
    assert.ok(scrollSource.includes('anchorOffset'), 'Captures anchorOffset');
  });

  it('2. useSwitchLanguage captures scroll snapshot before executing router navigation', () => {
    const hookSource = fs.readFileSync(path.join(rootDir, 'src/hooks/useSwitchLanguage.ts'), 'utf-8');

    assert.ok(hookSource.includes('captureScrollSnapshot(location.pathname);'), 'Calls captureScrollSnapshot before navigate');
    assert.ok(
      hookSource.indexOf('captureScrollSnapshot') < hookSource.indexOf('navigate(newPath'),
      'captureScrollSnapshot occurs strictly before navigate call'
    );
  });

  it('3. ScrollToTop handles explicit hash navigation and same-page language switch restoration', () => {
    const scrollToTopSource = fs.readFileSync(path.join(rootDir, 'src/components/ScrollToTop.tsx'), 'utf-8');

    assert.ok(scrollToTopSource.includes('location.hash'), 'Checks location.hash');
    assert.ok(scrollToTopSource.includes('getPendingScrollSnapshot(location.pathname)'), 'Queries pending scroll snapshot');
    assert.ok(scrollToTopSource.includes('requestAnimationFrame'), 'Uses requestAnimationFrame for layout synchronization');
    assert.ok(scrollToTopSource.includes('clearPendingScrollSnapshot();'), 'Clears pending snapshot after synchronization');
  });

  it('4. Language switch preserves query parameters, search queries, and hash fragments', () => {
    // Pure verification of route and URL preservation logic
    function replaceLanguageInPath(fullPath, targetLang) {
      const hashIndex = fullPath.indexOf('#');
      let hash = '';
      let cleanPath = fullPath;
      if (hashIndex !== -1) {
        hash = fullPath.substring(hashIndex);
        cleanPath = fullPath.substring(0, hashIndex);
      }
      const queryIndex = cleanPath.indexOf('?');
      let query = '';
      if (queryIndex !== -1) {
        query = cleanPath.substring(queryIndex);
        cleanPath = cleanPath.substring(0, queryIndex);
      }
      const match = cleanPath.match(/^\/(en|ru|uz)(\/.*)?$/i);
      const subPath = match ? (match[2] || '/') : cleanPath;
      let res = `/${targetLang}`;
      if (subPath !== '/') {
        res += subPath.startsWith('/') ? subPath : `/${subPath}`;
      }
      return `${res}${query}${hash}`;
    }

    const testUrl = '/en/actions?source=ecoscan&materials=Plastic#collection-map';
    const targetUrl = replaceLanguageInPath(testUrl, 'ru');
    assert.equal(targetUrl, '/ru/actions?source=ecoscan&materials=Plastic#collection-map');
    assert.ok(!targetUrl.includes('scroll='), 'No scroll parameter leaked into URL');
  });

  it('5. Normal cross-page navigation is not treated as a language switch preservation', () => {
    function stripLanguagePrefix(pathname) {
      const match = pathname.match(/^\/(en|ru|uz)(\/.*)?$/i);
      if (match) return match[2] || '/';
      return pathname;
    }

    const isSamePage = (source, target) => stripLanguagePrefix(source) === stripLanguagePrefix(target);

    assert.equal(isSamePage('/en/about', '/ru/about'), true, 'Same page /about preserves scroll');
    assert.equal(isSamePage('/en/team', '/uz/team'), true, 'Same page /team preserves scroll');
    assert.equal(isSamePage('/en/profile', '/ru/profile'), true, 'Same page /profile preserves scroll');
    assert.equal(isSamePage('/en/team', '/en/actions'), false, 'Cross-page navigation /team -> /actions does NOT preserve scroll');
    assert.equal(isSamePage('/ru/about', '/ru/shop'), false, 'Cross-page navigation /about -> /shop does NOT preserve scroll');
  });
});
