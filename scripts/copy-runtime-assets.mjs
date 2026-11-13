import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const files = [
  'index.html',
  'wangchao-video-case.html',
  'feed-style-lab.html',
  'hbn-case.html',
  'chiwei-case.html',
  'new-media-case.html',
  'ai-content-lab.html',
  'visual-storytelling-case.html',
  'xizhu-yongqing-case.html',
  'src/premium-motion.js',
  'src/card-border-glow.js',
  'src/liquid-ether-background.js',
  'src/contact-prism-background.js',
  'src/ai-dither-background.js'
];

const assetPaths = new Set([
  'assets/projects/wangchao-hichajiu-video.mp4',
  'assets/projects/new-media-case/videos/content-ip-design.mp4',
  'assets/projects/new-media-case/videos/event-content.mp4',
  'assets/projects/new-media-case/videos/interview-content.mp4'
]);
for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8');
  for (const match of text.matchAll(/assets\/[^\s"'`)<]+/g)) {
    assetPaths.add(match[0].replace(/[.,;]+$/, ''));
  }
}

for (const assetPath of assetPaths) {
  const source = join(root, assetPath.replaceAll('/', '\\'));
  if (!existsSync(source)) continue;
  const target = join(dist, assetPath.replaceAll('/', '\\'));
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { force: true, recursive: true });
}

console.log(`Copied ${assetPaths.size} runtime asset paths into dist.`);
