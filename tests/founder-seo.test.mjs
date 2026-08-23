import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

describe('ZAMINAT.eco — Founder Entity SEO & Knowledge Graph Quality Gates', () => {

  it('1. Zero duplicate keys across all locale JSON files including founder-translations', () => {
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

    function scanDir(dir) {
      let allDups = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          allDups = allDups.concat(scanDir(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          allDups = allDups.concat(findDuplicateKeys(fullPath));
        }
      }
      return allDups;
    }

    const duplicates = scanDir(path.join(rootDir, 'src', 'locales'));
    assert.strictEqual(duplicates.length, 0, `Found duplicate keys: ${JSON.stringify(duplicates)}`);
  });

  it('2. Organization Schema in index.html references canonical founder Person ID', () => {
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('"@id": "https://zaminat.uz/#organization"'), 'Organization @id is defined');
    assert.ok(indexHtml.includes('"@id": "https://zaminat.uz/en/founder/sukhrobjon-rikhsiboev#person"'), 'Founder Person @id is linked in Organization');
    assert.ok(indexHtml.includes('"name": "Sukhrobjon Rikhsiboev"'), 'Founder name is correct in index.html');
  });

  it('3. App.tsx contains multilingual routes and canonical alias redirects', () => {
    const appSource = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf8');
    assert.ok(appSource.includes('path="founder/sukhrobjon-rikhsiboev"'), 'Multilingual founder route exists in App.tsx');
    assert.ok(appSource.includes('path="/founder/sukhrobjon-rikhsiboev"'), 'Base founder route redirect exists');
    assert.ok(appSource.includes('path="/founder/suxrobjon-rixsiboyev"'), 'Uzbek ASCII alias redirect exists');
    assert.ok(appSource.includes('path="/founder/sukhrobjon-rixsiboyev"'), 'Hybrid ASCII alias redirect exists');
    assert.ok(appSource.includes('path="/founder/suxrobjon-rikhsiboev"'), 'Russian Latin alias redirect exists');
    assert.ok(appSource.includes('path="/founder"'), 'Short /founder redirect exists');
  });

  it('4. public/_redirects contains 301 alias rules for crawlers', () => {
    const redirects = fs.readFileSync(path.join(rootDir, 'public/_redirects'), 'utf8');
    assert.ok(redirects.includes('/founder/suxrobjon-rixsiboyev /uz/founder/sukhrobjon-rikhsiboev 301'), 'Uzbek 301 redirect in public/_redirects');
    assert.ok(redirects.includes('/founder/sukhrobjon-rikhsiboev /en/founder/sukhrobjon-rikhsiboev 301'), 'EN 301 redirect in public/_redirects');
    assert.ok(redirects.includes('/founder /en/founder/sukhrobjon-rikhsiboev 301'), '/founder 301 redirect in public/_redirects');
  });

  it('5. Factuality audit in founder translations (no fabricated claims, no age 24)', () => {
    const en = fs.readFileSync(path.join(rootDir, 'src/locales/en/founder-translations.json'), 'utf8');
    const ru = fs.readFileSync(path.join(rootDir, 'src/locales/ru/founder-translations.json'), 'utf8');
    const uz = fs.readFileSync(path.join(rootDir, 'src/locales/uz/founder-translations.json'), 'utf8');

    [en, ru, uz].forEach((content, i) => {
      const lang = ['en', 'ru', 'uz'][i];
      // Check for evergreen age avoidance (avoiding age "24" while allowing year 2024)
      const hasAge24 = /(?<!\d)24\s*(years old|лет|yosh)/i.test(content) || /(?<!\d)age\s*[:=]?\s*24(?!\d)/i.test(content);
      assert.ok(!hasAge24, `Language ${lang} does not hardcode age 24`);
      // Check for verified education
      assert.ok(content.includes('Amity University Tashkent'), `Language ${lang} includes Amity University Tashkent`);
      assert.ok(content.includes('2024'), `Language ${lang} includes graduation year 2024`);
      // Check for verified U.S. dealership experience
      assert.ok(content.includes('6'), `Language ${lang} references ~6 years experience`);
      // Check for U-Enter accelerator
      assert.ok(content.includes('U-Enter'), `Language ${lang} includes U-Enter accelerator`);
      // Check for early stage pre-seed acknowledgment
      assert.ok(content.includes('Pre-Seed') || content.includes('pre-seed') || content.includes('Pre-seed') || content.includes('Ранний этап'), `Language ${lang} states pre-seed stage`);
    });
  });

  it('6. robots.txt explicitly allows Googlebot, Bingbot, and OAI-SearchBot', () => {
    const robots = fs.readFileSync(path.join(rootDir, 'public/robots.txt'), 'utf8').replace(/\r\n/g, '\n');
    assert.ok(robots.includes('User-agent: Googlebot\nAllow: /'), 'Googlebot allowed in robots.txt');
    assert.ok(robots.includes('User-agent: Bingbot\nAllow: /'), 'Bingbot allowed in robots.txt');
    assert.ok(robots.includes('User-agent: OAI-SearchBot\nAllow: /'), 'OAI-SearchBot allowed in robots.txt');
  });

  it('7. Team.tsx upgrades Sukhrobjon card with profile link and button', () => {
    const teamSource = fs.readFileSync(path.join(rootDir, 'src/pages/Team.tsx'), 'utf8');
    assert.ok(teamSource.includes('member.id === 1'), 'Team.tsx checks member.id === 1');
    assert.ok(teamSource.includes('/founder/sukhrobjon-rikhsiboev'), 'Team.tsx links to founder profile');
    assert.ok(teamSource.includes('viewFounderProfile'), 'Team.tsx includes viewFounderProfile translation key');
  });

  it('8. scripts/generate-sitemap.js includes multilingual founder pages with hreflang alternates', () => {
    const sitemapScript = fs.readFileSync(path.join(rootDir, 'scripts/generate-sitemap.js'), 'utf8');
    assert.ok(sitemapScript.includes('/en/founder/sukhrobjon-rikhsiboev'), 'Sitemap script includes EN founder URL');
    assert.ok(sitemapScript.includes('/ru/founder/sukhrobjon-rikhsiboev'), 'Sitemap script includes RU founder URL');
    assert.ok(sitemapScript.includes('/uz/founder/sukhrobjon-rikhsiboev'), 'Sitemap script includes UZ founder URL');
    assert.ok(sitemapScript.includes('xhtml:link'), 'Sitemap script includes xhtml:link alternates');
  });

  it('9. Static portrait asset exists in public directory with semantic name', () => {
    assert.ok(fs.existsSync(path.join(rootDir, 'public/images/sukhrobjon-rikhsiboev-founder-zaminat.avif')), 'Semantic AVIF portrait exists in public/images');
    assert.ok(fs.existsSync(path.join(rootDir, 'public/images/sukhrobjon-rikhsiboev-founder-zaminat.webp')), 'Semantic WebP portrait exists in public/images');
  });

  it('10. IndexNow verification key file exists in public directory', () => {
    assert.ok(fs.existsSync(path.join(rootDir, 'public/b4e6d2b45f1b4d0891d4e0e5a98d3c12.txt')), 'IndexNow verification key file exists');
  });
});
