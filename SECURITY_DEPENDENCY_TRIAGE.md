# ZAMINAT.eco — Security Dependency Triage Report

**Audit Date**: 2026-08-10  
**Target Project**: ZAMINAT.eco (`Bullfighteruz/zaminateco-master`)  
**Scope**: Frontend (`/package.json`) & Backend (`/backend/package.json`)

---

## 📊 Summary Snapshot

| Subsystem | Critical | High | Moderate | Low | Total Vulnerabilities | Action Taken |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend** | 0 | 20 | 3 | 0 | 23 | Evaluated (Build-only devDependencies) |
| **Backend** | 3 | 26 | 32 | 5 | 66 | Evaluated (Requires non-breaking bump) |

---

## 🔍 Detailed Vulnerability Breakdown

### 1. Frontend Vulnerabilities

#### Advisory 1: Rollup Arbitrary File Write (GHSA-mw96-cpmx-2vgc)
* **Package**: `rollup` (transitive via `vite` / `rollup-plugin-terser`)
* **Severity**: **HIGH**
* **Direct or Transitive**: Transitive
* **Production or Dev**: Dev-only (Bundler build time)
* **Reachable in Production**: **NO** (Build-time asset compilation tool)
* **Fix Available**: Yes (`rollup@4.59.0+`)

#### Advisory 2: React Router Open Redirect (GHSA-wrjc-x8rr-h8h6 / GHSA-9jcx-v3wj-wh4m)
* **Package**: `react-router` / `react-router-dom`
* **Severity**: **HIGH** / Moderate
* **Direct or Transitive**: Direct (`react-router-dom@6.30.2`)
* **Production or Dev**: Production
* **Reachable in Production**: Low risk (Application uses internal relative route paths and explicit navigation guards)
* **Fix Available**: Yes (`react-router-dom@6.30.4+` or `v7`)

#### Advisory 3: Serialize-JavaScript RCE (GHSA-5c6j-r48x-rmvq)
* **Package**: `serialize-javascript` (via `rollup-plugin-terser`)
* **Severity**: **HIGH**
* **Direct or Transitive**: Transitive
* **Production or Dev**: Dev-only
* **Reachable in Production**: **NO**

---

### 2. Backend Vulnerabilities

#### Advisory 1: NestJS / Express Transitive Body Parser Limits
* **Package**: `body-parser` / `express` (via `@nestjs/platform-express`)
* **Severity**: **CRITICAL** (3 advisories)
* **Direct or Transitive**: Transitive
* **Production or Dev**: Production
* **Reachable in Production**: Mitigated by `ScanDto` maximum payload limits (15MB) and NestJS `ValidationPipe` whitelist filtering.
* **Fix Available**: Yes (`npm audit fix` inside `/backend`)

#### Advisory 2: Prisma ORM Connection Pool Advisory
* **Package**: `@prisma/client` / `prisma`
* **Severity**: **HIGH**
* **Direct or Transitive**: Direct (`^5.7.1`)
* **Production or Dev**: Production
* **Reachable in Production**: Low risk (Connection string managed via server-side environment variables).

---

## 🛡️ Triage Recommendation
1. **Frontend**: Non-breaking update of `react-router-dom` to `6.30.4` when major feature development resumes.
2. **Backend**: Run `npm audit fix --package-lock-only` inside `/backend` to update transitive dependencies while locking SemVer constraints.
