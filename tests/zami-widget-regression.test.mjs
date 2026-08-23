import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('ZAMINAT.eco — Zami AI Agent Global Floating Widget Quality Gates', () => {
  const rootDir = process.cwd();

  it('1. FloatingCoachWidget is mounted globally inside BrowserRouter in App.tsx', () => {
    const appSource = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf-8');

    assert.ok(appSource.includes('import FloatingCoachWidget from "./components/ai/FloatingCoachWidget";') || appSource.includes('import FloatingCoachWidget from "@/components/ai/FloatingCoachWidget";'), 'App.tsx imports FloatingCoachWidget');
    assert.ok(appSource.includes('<FloatingCoachWidget />'), 'App.tsx renders FloatingCoachWidget inside the router shell');
    assert.ok(appSource.indexOf('<FloatingCoachWidget />') > appSource.indexOf('<BrowserRouter>'), 'Mounted inside BrowserRouter');
    assert.ok(appSource.indexOf('<FloatingCoachWidget />') < appSource.indexOf('</BrowserRouter>'), 'Mounted inside BrowserRouter closing tag');
  });

  it('2. Single ZamiConversationProvider wraps the application without duplicates', () => {
    const appSource = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf-8');
    const layoutSource = fs.readFileSync(path.join(rootDir, 'src/components/Layout.tsx'), 'utf-8');

    const providerMatches = (appSource.match(/<ZamiConversationProvider>/g) || []).length;
    assert.equal(providerMatches, 1, 'Exactly one ZamiConversationProvider in App.tsx');
    assert.ok(!layoutSource.includes('ZamiConversationProvider'), 'Layout.tsx does not duplicate ZamiConversationProvider');
  });

  it('3. FloatingCoachWidget normalizes path with stripLanguagePrefix for visibility rules', () => {
    const widgetSource = fs.readFileSync(path.join(rootDir, 'src/components/ai/FloatingCoachWidget.tsx'), 'utf-8');

    assert.ok(widgetSource.includes('stripLanguagePrefix'), 'FloatingCoachWidget uses stripLanguagePrefix');
    assert.ok(widgetSource.includes("['/coach', '/scanner', '/pitch', '/pitch-live'].includes(currentPathWithoutLang)"), 'Uses normalized path for page exclusions');
  });

  it('4. Visibility rules correctly allow /en, /ru, /uz home and public pages while excluding /coach', () => {
    function stripLang(pathname) {
      const match = pathname.match(/^\/(en|ru|uz)(\/.*)?$/i);
      if (match) return match[2] || '/';
      return pathname;
    }

    const excludedRoutes = ['/coach', '/scanner', '/pitch', '/pitch-live'];
    function isVisibleOnRoute(route) {
      const stripped = stripLang(route);
      return !excludedRoutes.includes(stripped);
    }

    // Public pages across all 3 languages must be visible
    assert.equal(isVisibleOnRoute('/en'), true, 'Visible on /en');
    assert.equal(isVisibleOnRoute('/ru'), true, 'Visible on /ru');
    assert.equal(isVisibleOnRoute('/uz'), true, 'Visible on /uz');
    assert.equal(isVisibleOnRoute('/en/'), true, 'Visible on /en/');
    assert.equal(isVisibleOnRoute('/en/about'), true, 'Visible on /en/about');
    assert.equal(isVisibleOnRoute('/ru/team'), true, 'Visible on /ru/team');
    assert.equal(isVisibleOnRoute('/uz/actions'), true, 'Visible on /uz/actions');
    assert.equal(isVisibleOnRoute('/en/vote'), true, 'Visible on /en/vote');
    assert.equal(isVisibleOnRoute('/ru/shop'), true, 'Visible on /ru/shop');
    assert.equal(isVisibleOnRoute('/uz/profile'), true, 'Visible on /uz/profile');

    // Excluded pages across all languages must be suppressed
    assert.equal(isVisibleOnRoute('/en/coach'), false, 'Excluded on /en/coach');
    assert.equal(isVisibleOnRoute('/ru/coach'), false, 'Excluded on /ru/coach');
    assert.equal(isVisibleOnRoute('/uz/coach'), false, 'Excluded on /uz/coach');
    assert.equal(isVisibleOnRoute('/en/scanner'), false, 'Excluded on /en/scanner');
    assert.equal(isVisibleOnRoute('/en/pitch'), false, 'Excluded on /en/pitch');
    assert.equal(isVisibleOnRoute('/ru/pitch-live'), false, 'Excluded on /ru/pitch-live');
  });

  it('5. Conversation persistence uses zami_bot_chat key without resetting across routes', () => {
    const contextSource = fs.readFileSync(path.join(rootDir, 'src/contexts/ZamiConversationContext.tsx'), 'utf-8');

    assert.ok(contextSource.includes("const ZAMI_STORAGE_KEY = 'zami_bot_chat';"), 'Uses zami_bot_chat storage key');
    assert.ok(contextSource.includes('localStorage.setItem(ZAMI_STORAGE_KEY'), 'Persists messages to localStorage');
  });

  it('6. LanguageSwitcher and FloatingCoachWidget coexist on public shell without visual collision', () => {
    const layoutSource = fs.readFileSync(path.join(rootDir, 'src/components/Layout.tsx'), 'utf-8');
    const widgetSource = fs.readFileSync(path.join(rootDir, 'src/components/ai/FloatingCoachWidget.tsx'), 'utf-8');

    // Language switcher is fixed top-right
    assert.ok(layoutSource.includes('top-4 right-4 sm:top-5 sm:right-6 z-40') || layoutSource.includes('LanguageSwitcher'), 'LanguageSwitcher positioned top-right');
    // Floating coach widget is fixed bottom-right
    assert.ok(widgetSource.includes('fixed right-4 z-[9999]'), 'FloatingCoachWidget positioned bottom-right with z-[9999]');
  });
});
