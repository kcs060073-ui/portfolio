import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, truncateSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const script = fileURLToPath(new URL('./copy-runtime-assets.mjs', import.meta.url));
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'portfolio-assets-'));
  const write = (path, content = '') => {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
    return file;
  };
  for (const page of ['index', 'wangchao-video-case', 'feed-style-lab', 'yuanliu-case', 'suojian-case', 'hbn-case', 'chiwei-case', 'new-media-case', 'ai-content-lab', 'visual-storytelling-case', 'xizhu-yongqing-case']) write(`${page}.html`);
  for (const module of ['premium-motion', 'card-border-glow', 'liquid-ether-background', 'contact-prism-background', 'ai-dither-background']) write(`src/${module}.js`);
  write('assets/projects/wangchao-hichajiu-video.mp4', 'video');
  for (const name of ['content-ip-design', 'event-content', 'interview-content']) write(`assets/projects/new-media-case/videos/${name}.mp4`, name);
  write('assets/projects/ai-content-lab/fengqi-stream/index.m3u8', '#EXTM3U\n#EXT-X-MAP:URI="init.mp4"\n#EXTINF:8,\npart.m4s\n#EXT-X-ENDLIST\n');
  write('assets/projects/ai-content-lab/fengqi-stream/init.mp4', 'init');
  write('ai-content-lab.html', '<button data-video-src="assets/projects/ai-content-lab/fengqi-stream/index.m3u8"></button>');
  write('assets/projects/ai-content-lab/fengqi-stream/part.m4s', 'segment');
  return { root, write, run: () => spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' }) };
}

test('copies dynamic video paths and every nested streaming asset', () => {
  const { root, run } = fixture();
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(root, 'dist/assets/projects/new-media-case/videos/event-content.mp4'), 'utf8'), 'event-content');
  assert.equal(readFileSync(join(root, 'dist/assets/projects/ai-content-lab/fengqi-stream/init.mp4'), 'utf8'), 'init');
  assert.equal(readFileSync(join(root, 'dist/assets/projects/ai-content-lab/fengqi-stream/part.m4s'), 'utf8'), 'segment');
});

test('rejects missing page references instead of silently deploying broken links', () => {
  const { write, run } = fixture();
  write('index.html', '<video data-src="assets/missing.mp4"></video>');
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /assets\/missing\.mp4/);
});

test('rejects assets larger than the hosting limit', () => {
  const { write, run } = fixture();
  const file = write('assets/projects/wangchao-hichajiu-video.mp4');
  truncateSync(file, 25 * 1024 * 1024 + 1);
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /25 MiB limit/);
});

test('rejects an incomplete HLS playlist including a missing initialization file', () => {
  const { write, run } = fixture();
  write('assets/projects/ai-content-lab/fengqi-stream/index.m3u8', '#EXTM3U\n#EXT-X-MAP:URI="missing-init.mp4"\npart.m4s\n');
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Streaming segment is missing:.*missing-init\.mp4/);
});
