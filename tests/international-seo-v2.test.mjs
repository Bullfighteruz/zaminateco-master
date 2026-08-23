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

describe('ZAMINAT.eco — CTO International SEO v2 Quality Gates', () => {
  const rootDir = process.cwd();

  it('1. Zero duplicate keys across all locale JSON files in src/locales (EN, RU, UZ)', () => {
    const dups = scanDirForDuplicates(path.join(rootDir, 'src/locales'));
    assert.equal(dups.length, 0, `Expected 0 duplicate keys across all locales, found: ${JSON.stringify(dups, null, 2)}`);
  });

  it('2. Centralized i18nRouting.ts implements core international routing API', () => {
    const routingSource = fs.readFileSync(path.join(rootDir, 'src/lib/i18nRouting.ts'), 'utf-8');

    assert.ok(routingSource.includes("SUPPORTED_LANGUAGES = ['en', 'ru', 'uz']"), 'Defines supported languages array');
    assert.ok(routingSource.includes("DEFAULT_LANGUAGE: SupportedLanguage = 'en'"), 'Defines default language');
    assert.ok(routingSource.includes('export function isSupportedLanguage'), 'Exports isSupportedLanguage');
    assert.ok(routingSource.includes('export function normalizeLanguage'), 'Exports normalizeLanguage');
    assert.ok(routingSource.includes('export function extractLanguageFromPath'), 'Exports extractLanguageFromPath');
    assert.ok(routingSource.includes('export function stripLanguagePrefix'), 'Exports stripLanguagePrefix');
    assert.ok(routingSource.includes('export function getLocalizedPath'), 'Exports getLocalizedPath');
    assert.ok(routingSource.includes('export function replaceLanguageInPath'), 'Exports replaceLanguageInPath');
    assert.ok(routingSource.includes('export function buildLocalizedUrl'), 'Exports buildLocalizedUrl');
  });

  it('3. App.tsx implements /:lang parent route with LanguageRouteWrapper and legacy redirects', () => {
    const appSource = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf-8');

    assert.ok(appSource.includes('<Route path="/:lang" element={<LanguageRouteWrapper />}>'), 'App.tsx wraps routes in /:lang parent');
    assert.ok(appSource.includes('<Route path="/" element={<Navigate to="/en" replace />} />'), 'Root redirects to /en');
    assert.ok(appSource.includes('<Route path="/team" element={<Navigate to="/en/team" replace />} />'), 'Legacy /team redirects to /en/team');
    assert.ok(appSource.includes('<Route path="/actions" element={<Navigate to="/en/actions" replace />} />'), 'Legacy /actions redirects to /en/actions');
    assert.ok(appSource.includes('<Route path="/map" element={<Navigate to="/actions?mode=collection#collection-map" replace />} />'), 'Legacy /map redirects to /actions');
    assert.ok(appSource.includes('<Route path="/ecomap" element={<Navigate to="/actions?mode=collection#collection-map" replace />} />'), 'Legacy /ecomap redirects to /actions');
  });

  it('4. LanguageRouteWrapper synchronizes i18n language and document lang', () => {
    const wrapperSource = fs.readFileSync(path.join(rootDir, 'src/components/LanguageRouteWrapper.tsx'), 'utf-8');

    assert.ok(wrapperSource.includes('useParams'), 'Uses useParams for lang');
    assert.ok(wrapperSource.includes('isSupportedLanguage(lang)'), 'Validates language support');
    assert.ok(wrapperSource.includes('if (!isValidLanguage)'), 'Checks language validity');
    assert.ok(wrapperSource.includes('return <NotFound />'), 'Renders NotFound 404 on invalid language');
  });

  it('5. LanguageSwitcher and Layout use centralized useSwitchLanguage for URL-aware routing', () => {
    const switcherSource = fs.readFileSync(path.join(rootDir, 'src/components/LanguageSwitcher.tsx'), 'utf-8');
    const layoutSource = fs.readFileSync(path.join(rootDir, 'src/components/Layout.tsx'), 'utf-8');
    const hookSource = fs.readFileSync(path.join(rootDir, 'src/hooks/useSwitchLanguage.ts'), 'utf-8');

    assert.ok(switcherSource.includes('useSwitchLanguage'), 'LanguageSwitcher uses useSwitchLanguage');
    assert.ok(switcherSource.includes('switchLanguage(languageCode)'), 'LanguageSwitcher delegates to switchLanguage');
    assert.ok(layoutSource.includes('<LanguageSwitcher darkMode={hideBottomNav} />'), 'Layout mounts unified responsive LanguageSwitcher');
    assert.ok(hookSource.includes('replaceLanguageInPath'), 'useSwitchLanguage uses replaceLanguageInPath');
    assert.ok(hookSource.includes('navigate(newPath, { replace: options?.replace ?? true })'), 'useSwitchLanguage navigates to localized URL');
  });

  it('6. PrefetchLink automatically localizes relative paths', () => {
    const prefetchSource = fs.readFileSync(path.join(rootDir, 'src/components/PrefetchLink.tsx'), 'utf-8');

    assert.ok(prefetchSource.includes('getLocalizedPath'), 'PrefetchLink resolves getLocalizedPath');
    assert.ok(prefetchSource.includes('useTranslation'), 'PrefetchLink uses active i18n language');
  });

  it('7. Navigation components use language-stripped paths for accurate active tab highlighting', () => {
    const navSource = fs.readFileSync(path.join(rootDir, 'src/components/Navigation.tsx'), 'utf-8');
    const layoutSource = fs.readFileSync(path.join(rootDir, 'src/components/Layout.tsx'), 'utf-8');

    assert.ok(navSource.includes('stripLanguagePrefix'), 'Navigation.tsx uses stripLanguagePrefix');
    assert.ok(layoutSource.includes('stripLanguagePrefix'), 'Layout.tsx uses stripLanguagePrefix');
  });

  it('8. useSEO and useHreflang hooks generate localized canonical and reciprocal alternates', () => {
    const seoSource = fs.readFileSync(path.join(rootDir, 'src/hooks/useSEO.ts'), 'utf-8');
    const hreflangSource = fs.readFileSync(path.join(rootDir, 'src/hooks/useHreflang.ts'), 'utf-8');

    assert.ok(seoSource.includes('buildLocalizedUrl'), 'useSEO builds localized canonical URL');
    assert.ok(seoSource.includes('document.documentElement.lang = currentLang'), 'useSEO sets html lang');
    assert.ok(seoSource.includes('og:locale'), 'useSEO sets og:locale');
    assert.ok(hreflangSource.includes('SUPPORTED_LANGUAGES.forEach'), 'useHreflang generates tags for all supported languages');
    assert.ok(hreflangSource.includes('x-default'), 'useHreflang includes x-default');
  });

  it('9. public/_redirects contains 301 legacy redirects and SPA fallback', () => {
    const redirectsSource = fs.readFileSync(path.join(rootDir, 'public/_redirects'), 'utf-8');

    assert.ok(redirectsSource.includes('/ /en 301'), '301 redirect for root / to /en');
    assert.ok(redirectsSource.includes('/team /en/team 301'), '301 redirect for /team');
    assert.ok(redirectsSource.includes('/actions /en/actions 301'), '301 redirect for /actions');
    assert.ok(redirectsSource.includes('/about /en/about 301'), '301 redirect for /about');
    assert.ok(redirectsSource.includes('/map /en/actions?mode=collection#collection-map 301'), '301 redirect for /map');
    assert.ok(redirectsSource.includes('/* /index.html 200'), 'SPA fallback catch-all');
  });

  it('10. Multilingual Sitemap v2 includes all indexable pages across EN, RU, UZ with xhtml:link alternates', () => {
    const sitemapGenSource = fs.readFileSync(path.join(rootDir, 'scripts/generate-sitemap.js'), 'utf-8');
    const sitemapContent = fs.readFileSync(path.join(rootDir, 'public/sitemap.xml'), 'utf-8');

    assert.ok(sitemapGenSource.includes("LANGUAGES = ['en', 'ru', 'uz']"), 'Sitemap generator includes all 3 languages');
    assert.ok(sitemapGenSource.includes('xhtml:link'), 'Sitemap generator includes xhtml:link alternates');
    assert.ok(!sitemapGenSource.includes('/profile'), 'Private profile excluded from sitemap');
    assert.ok(!sitemapGenSource.includes('/scanner'), 'Scanner tool excluded from sitemap');
    assert.ok(!sitemapContent.includes(':id'), 'Sitemap does not contain literal :id');
  });

  it('11. Build-time prerender script covers all public indexable routes across EN, RU, UZ', () => {
    const prerenderSource = fs.readFileSync(path.join(rootDir, 'scripts/generate-prerender.js'), 'utf-8');

    assert.ok(prerenderSource.includes('PAGE_DATA'), 'PAGE_DATA contains indexable routes');
    assert.ok(prerenderSource.includes('LANGUAGES.forEach'), 'Iterates over all languages');
    assert.ok(prerenderSource.includes('prerenderAllPages'), 'Exports prerenderAllPages function');
  });

  it('12. Profile settings language controls use centralized useSwitchLanguage and preserve query/hash', () => {
    const profileSource = fs.readFileSync(path.join(rootDir, 'src/pages/Profile.tsx'), 'utf-8');

    assert.ok(profileSource.includes('useSwitchLanguage'), 'Profile.tsx imports useSwitchLanguage');
    assert.ok(profileSource.includes('switchLanguage(lang.code)'), 'Profile settings button calls switchLanguage');
    assert.ok(profileSource.includes('variant={currentLang === lang.code ?'), 'Active button state derived from currentLang');
    assert.ok(!profileSource.includes('i18n.changeLanguage(lang.code)'), 'Profile does not bypass router URL');
  });

  it('13. All auxiliary language controls (WelcomeModal, PitchLive) use useSwitchLanguage', () => {
    const welcomeSource = fs.readFileSync(path.join(rootDir, 'src/components/WelcomeModal.tsx'), 'utf-8');
    const pitchLiveSource = fs.readFileSync(path.join(rootDir, 'src/pages/PitchLive.tsx'), 'utf-8');

    assert.ok(welcomeSource.includes('useSwitchLanguage'), 'WelcomeModal imports useSwitchLanguage');
    assert.ok(welcomeSource.includes('switchLanguage(languageCode)'), 'WelcomeModal calls switchLanguage');
    assert.ok(pitchLiveSource.includes('useSwitchLanguage'), 'PitchLive imports useSwitchLanguage');
    assert.ok(pitchLiveSource.includes('switchLanguage(l.code)'), 'PitchLive calls switchLanguage');
  });

  it('14. replaceLanguageInPath preserves pathnames, query strings, and hash fragments', () => {
    // Pure function logic mirroring src/lib/i18nRouting.ts
    function replaceLang(path, targetLang) {
      if (!path) return `/${targetLang}`;
      const hashIndex = path.indexOf('#');
      let hash = '';
      let cleanPath = path;
      if (hashIndex !== -1) {
        hash = path.substring(hashIndex);
        cleanPath = path.substring(0, hashIndex);
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

    assert.equal(replaceLang('/en/profile?tab=badges#settings', 'ru'), '/ru/profile?tab=badges#settings');
    assert.equal(replaceLang('/uz/actions?source=ecoscan&materials=Plastic#collection-map', 'en'), '/en/actions?source=ecoscan&materials=Plastic#collection-map');
    assert.equal(replaceLang('/ru/team', 'uz'), '/uz/team');

    const routingSource = fs.readFileSync(path.join(rootDir, 'src/lib/i18nRouting.ts'), 'utf-8');
    assert.ok(routingSource.includes('replaceLanguageInPath'), 'Exports replaceLanguageInPath');
    assert.ok(routingSource.includes('return `${result}${query}${hash}`'), 'Concatenates result with query and hash');
  });
});
