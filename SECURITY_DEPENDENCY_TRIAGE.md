# ZAMINAT.eco — Security Dependency Triage & Remediation Report

**Audit & Remediation Date**: 2026-08-25
**Target Project**: ZAMINAT.eco (`Bullfighteruz/zaminateco-master`)
**Scope**: Backend Production Recovery (`/backend`) & Transitive Dependency Hardening
**Target Node Contract**: Node.js `22.20.0` (`engines: >=22.0.0 <23.0.0`)
**Framework Baseline**: NestJS `10.4.22` (Major 10 preserved)
**Database Engine**: Prisma `5.22.0` / `@prisma/client` `5.22.0` (Resolved within `^5.7.1` constraint)

---

## 📊 Production Security Gate & Snapshot

| Subsystem | Audit Status | Critical | High | Moderate | Low | Total Vulnerabilities | Security Gate (`Critical=0, High=0`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend (Before)** | Baseline | 1 | 14 | 13 | 0 | 28 | **FAIL** |
| **Backend (After)** | **REMEDIATED** | **0** | **0** | **13** | **0** | **13** | **PASS ✅** |

---

## 🛡️ Executed Remediation Actions

### 1. `bcrypt` (CVE / GHSA-9r2w-394v-5gvq, GHSA-23hp-3jrh-7fpw)
- **Action**: Upgraded `bcrypt` from `^5.1.1` to `^6.0.0`.
- **Impact**: Completely removed `@mapbox/node-pre-gyp` and vulnerable `tar` sub-dependency tree.
- **Verification**: Verified backward compatibility with pre-existing hashes in `src/auth/auth.bcrypt.spec.ts`.

### 2. `multer` & `@nestjs/platform-express` (GHSA-93m5-p5rx-mv73, GHSA-77mr-2ch6-9p2p)
- **Action**: Removed direct `multer` dependency. Upgraded `@nestjs/platform-express` to `^10.4.22` (NestJS 10 LTS) and enforced package override `@nestjs/platform-express: { "multer": "2.2.0" }`.
- **Impact**: Eliminates unhandled exception vulnerability when fieldname is omitted in multipart forms and resolves vulnerable `busboy` DoS chains.

### 3. `sharp` Image Processing (GHSA-547x-78j4-7657)
- **Action**: Upgraded `sharp` from `^0.33.1` to `^0.35.3` (Node.js 22.20.0 compatible).
- **Impact**: Resolves native image processing vulnerabilities and provides robust multi-format support.

### 4. `nodemailer` Dead Code Elimination
- **Action**: Removed unused `nodemailer` (`^6.9.7`) and `@types/nodemailer` dependencies after verifying 0 runtime usages across backend source.
- **Impact**: Reduces attack surface and dependency tree overhead.

### 5. Transitive Security Overrides
- **Action**: Configured npm package overrides for transitive dependencies:
  - `"lodash": "4.18.1"` (Mitigates prototype pollution GHSA-p6mc-m468-83gw)
  - `"js-yaml": "4.3.1"` (Mitigates prototype pollution GHSA-9c47-m6qq-7p4h)
- **Impact**: Hardens Swagger and tooling dependencies without breaking NestJS 10.

### 6. File Upload Hardening (`POST /api/v1/upload/image`)
- **Caller Verification**: `CURRENT_FRONTEND_CALLERS_TO_UPLOAD_IMAGE = NONE_FOUND` (Frontend Scanner utilizes direct base64 EcoScan pipeline).
- **Controller Hardening**:
  - Max single file limit (`files: 1`, `fields: 0`, `parts: 2`).
  - Max payload size strictly capped at 5 MiB (`fileSize: 5 * 1024 * 1024`).
  - Deliberately narrow MIME whitelist: `image/jpeg`, `image/png`, `image/webp` (GIF/HEIC/AVIF excluded).
  - Clean `BadRequestException` on missing file or invalid MIME.
- **Service Hardening**:
  - Sharp decompression bomb defense: `limitInputPixels: 50000000` (50 MP).
  - Explicit image buffer validation and metadata decoding verification.
  - Zero sensitive token, filesystem path, or binary leakage in exception messages.

---

## 🔍 Factual Analysis of Remaining 13 Moderate Findings

All 13 remaining findings are of Moderate severity and blocked from automated bump by the NestJS 10 LTS boundary constraint. Direct application reachability is evaluated as follows:

1. **`@nestjs/core` (GHSA-36xv-jgw5-4q75)**: Concerns SSE message `type`/`id` injection when user input is piped directly into SSE event headers. A codebase search found no `@Sse` decorator or `SseStream` usage in this repository; reachability is LOW for the current API. Full remediation tracked under separate NestJS 11 migration.
2. **`file-type` (GHSA-5v7r-6r5c-r473, GHSA-j47w-4g3g-c36v)**: Concerns infinite loops in ASF audio parsers and zip decompression bombs in `.docx`/`.xlsx` containers. Backend source contains no calls to `fileTypeFromBuffer`, `fileTypeFromFile`, or `fileTypeFromBlob`; reachability is LOW.
3. **`express` / `body-parser` / `qs` (GHSA-q8mj-m7cp-5q26, GHSA-v422-hmwv-36x6)**: Concerns `qs.stringify` TypeError on comma-format arrays with `encodeValuesOnly: true` and body-parser limit disablement on invalid configuration. Backend uses standard Express JSON body parsing with strict schema validation; reachability is LOW.
4. **`bull` / `uuid` (GHSA-w5hq-g745-h8pq)**: Concerns missing buffer bounds check in UUID v3/v5/v6 when external byte buffers are provided. Bull utilizes standard random v4 UUID string generation; reachability is LOW.
5. **`@nestjs/bull`, `@nestjs/bull-shared`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/swagger`, `@nestjs/throttler`**: Moderate alerts stemming from peer dependencies on `@nestjs/core` within NestJS 10 range.

---

## 🧪 Verification & Acceptance Suite

1. **`npm ci`**: Completed with exit code 0.
2. **`npm run build`**: Completed with exit code 0 (Webpack bundled successfully).
3. **`npm test -- --runInBand`**: **100% PASS (9 passed test suites, 117 tests passing)**:
   - `src/upload/upload.security.spec.ts` (PASS)
   - `src/auth/auth.bcrypt.spec.ts` (PASS)
   - `src/ai/ai.http.spec.ts` (PASS)
   - `src/ai/ai.service.spec.ts` (PASS)
   - `src/ai/providers/openai.provider.spec.ts` (PASS)
   - `src/ai/providers/gemini.provider.spec.ts` (PASS)
   - `src/ai/utils/scan-guard.spec.ts` (PASS)
   - `src/ai/utils/search-router.spec.ts` (PASS)
   - `src/health/health.controller.spec.ts` (PASS)
4. **Security Gate Audit**: `Critical: 0`, `High: 0`, `Moderate: 13`.
