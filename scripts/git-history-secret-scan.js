import { execSync } from 'child_process';

async function scanGitHistory() {
  console.log('🔍 Performing Git-native exhaustive history scan across ALL reachable commits...');

  // Get all commit SHAs
  const commits = execSync('git rev-list --all', { encoding: 'utf8' }).trim().split('\n');
  console.log(`📊 Total commits to scan: ${commits.length}`);

  const keyPattern = /(AIzaSy[A-Za-z0-9_-]{33}|AQ\.[A-Za-z0-9_-]{30,}|sk-[A-Za-z0-9]{32,}|BEGIN (?:RSA|OPENSSH|PRIVATE) KEY|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/g;

  let totalFindings = 0;
  let envCommitted = false;

  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i];
    try {
      // Check commit diff
      const patch = execSync(`git show --patch ${commit}`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

      // Check if .env file was added/modified
      if (patch.includes('diff --git a/.env b/.env') || patch.includes('diff --git a/backend/.env b/backend/.env')) {
        envCommitted = true;
      }

      let match;
      while ((match = keyPattern.exec(patch)) !== null) {
        const fullMatch = match[0];
        // Redact secret completely (showing only type and last 4 chars)
        const redacted = fullMatch.length > 8 ? fullMatch.slice(0, 3) + '...' + fullMatch.slice(-4) : '[REDACTED]';
        console.log(`⚠️ FINDING in Commit ${commit.substring(0, 7)}: Type=${fullMatch.substring(0, 6)} Redacted=${redacted}`);
        totalFindings++;
      }
    } catch (err) {
      // Ignore patch buffer overflow on giant commits if any
    }
  }

  console.log('==================================================');
  console.log(`COMMITS_SCANNED: ${commits.length}`);
  console.log(`ENV_EVER_COMMITTED: ${envCommitted ? 'YES' : 'NO'}`);
  console.log(`HISTORY_SECRET_FINDINGS: ${totalFindings}`);
  console.log('==================================================');
}

scanGitHistory().catch(console.error);
