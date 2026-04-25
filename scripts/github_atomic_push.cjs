#!/usr/bin/env node
// Atomic GitHub push — all files in a single commit via Git Trees API
// Usage: node scripts/github_atomic_push.cjs --message "msg" file1 file2 ...
// Maps local paths to remote paths automatically based on known structure.

'use strict';
const fs = require('fs');
const https = require('https');
const path = require('path');

// Token read from .gh_token file (not committed) or GITHUB_TOKEN env var
const TOKEN = (() => {
  try { return require('fs').readFileSync('/home/user/workspace/dc-intel/.gh_token','utf8').trim(); } catch(e) {}
  return process.env.GITHUB_TOKEN || '';
})();
const REPO = 'ElonDev1/Catching-The-Bumper';
const BASE = '/home/user/workspace/dc-intel/';

// Parse args
const args = process.argv.slice(2);
const msgIdx = args.indexOf('--message');
const message = msgIdx >= 0 ? args[msgIdx + 1] : 'Automated update';
const files = args.filter((a, i) => a !== '--message' && args[msgIdx + 1] !== a || (msgIdx < 0));
// Simpler: collect all non-flag args
const fileArgs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--message') { i++; continue; }
  fileArgs.push(args[i]);
}

function api(method, p, body) {
  return new Promise((res, rej) => {
    const d = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: '/repos/' + REPO + p,
      method,
      headers: {
        'Authorization': 'token ' + TOKEN,
        'User-Agent': 'dc-intel',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        ...(d ? { 'Content-Length': Buffer.byteLength(d) } : {})
      }
    }, resp => {
      let s = '';
      resp.on('data', c => s += c);
      resp.on('end', () => {
        try { res({ status: resp.statusCode, body: JSON.parse(s) }); }
        catch (e) { res({ status: resp.statusCode, body: s }); }
      });
    });
    req.on('error', rej);
    if (d) req.write(d);
    req.end();
  });
}

// Map local file path → remote GitHub path
function toRemotePath(localPath) {
  // Strip BASE prefix if present
  let rel = localPath.startsWith(BASE) ? localPath.slice(BASE.length) : localPath;
  // Strip leading ./
  rel = rel.replace(/^\.\//, '');
  return rel;
}

async function deleteOldJsAssets(keepJs) {
  const r = await api('GET', '/contents/dist/public/assets');
  if (r.status !== 200 || !Array.isArray(r.body)) return;
  for (const f of r.body) {
    if (f.name.endsWith('.js') && f.name !== keepJs) {
      const del = await api('DELETE', '/contents/dist/public/assets/' + f.name, {
        message: 'Remove old JS asset',
        sha: f.sha
      });
      console.log(del.status === 200 ? '  DEL ' + f.name : '  FAIL del ' + f.name);
    }
  }
}

(async () => {
  console.log(`Atomic push: ${fileArgs.length} files — "${message}"`);

  // 1. Get current HEAD commit SHA
  const refRes = await api('GET', '/git/ref/heads/main');
  if (refRes.status !== 200) { console.error('Failed to get ref:', refRes.body); process.exit(1); }
  const headSha = refRes.body.object.sha;
  console.log('HEAD:', headSha.slice(0, 7));

  // 2. Get base tree SHA
  const commitRes = await api('GET', '/git/commits/' + headSha);
  const baseTreeSha = commitRes.body.tree.sha;

  // 3. Detect new JS filename from index.html for asset deletion
  let newJs = null;
  const ihFile = fileArgs.find(f => f.includes('index.html'));
  if (ihFile) {
    const ihContent = fs.readFileSync(ihFile.startsWith('/') ? ihFile : BASE + ihFile, 'utf8');
    newJs = ihContent.match(/src="\.\/assets\/(index-[^"]+\.js)"/)?.[1];
    if (newJs) {
      console.log('  New JS asset:', newJs);
      await deleteOldJsAssets(newJs);
    }
  }

  // 4. Create blobs for all files
  const treeItems = [];
  for (const fileArg of fileArgs) {
    const localPath = fileArg.startsWith('/') ? fileArg : path.join(BASE, fileArg);
    const remotePath = toRemotePath(fileArg.startsWith('/') ? fileArg : path.join(BASE, fileArg));

    // Use base64 for binary files (db, cjs), utf8 text otherwise
    const isBinary = localPath.endsWith('.db');
    const content = fs.readFileSync(localPath);
    const b64 = content.toString('base64');

    const blobRes = await api('POST', '/git/blobs', {
      content: b64,
      encoding: 'base64'
    });
    if (blobRes.status !== 201) {
      console.error('  FAIL blob', remotePath, blobRes.body?.message);
      process.exit(1);
    }
    treeItems.push({
      path: remotePath,
      mode: '100644',
      type: 'blob',
      sha: blobRes.body.sha
    });
    console.log('  blob', remotePath, blobRes.body.sha.slice(0, 7));
  }

  // 5. Create new tree
  const treeRes = await api('POST', '/git/trees', {
    base_tree: baseTreeSha,
    tree: treeItems
  });
  if (treeRes.status !== 201) { console.error('FAIL tree:', treeRes.body); process.exit(1); }
  const newTreeSha = treeRes.body.sha;

  // 6. Create commit
  const commitCreateRes = await api('POST', '/git/commits', {
    message,
    tree: newTreeSha,
    parents: [headSha]
  });
  if (commitCreateRes.status !== 201) { console.error('FAIL commit:', commitCreateRes.body); process.exit(1); }
  const newCommitSha = commitCreateRes.body.sha;

  // 7. Update ref
  const updateRefRes = await api('PATCH', '/git/refs/heads/main', {
    sha: newCommitSha,
    force: false
  });
  if (updateRefRes.status !== 200) { console.error('FAIL update ref:', updateRefRes.body); process.exit(1); }

  console.log(`\nDone — single commit ${newCommitSha.slice(0, 7)}: "${message}"`);
  console.log('Render will now deploy from this commit.');
})();
