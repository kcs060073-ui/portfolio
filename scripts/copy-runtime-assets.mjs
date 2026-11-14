import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const files = [
  'index.html',
  'wangchao-video-case.html',
  'feed-style-lab.html',
  'yuanliu-case.html',
  'suojian-case.html',
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
    const asset = match[0].replace(/[.,;]+$/, '');
    assetPaths.add(asset.endsWith('.m3u8') ? dirname(asset) : asset);
  }
}

const missing = [...assetPaths].filter((assetPath) => !existsSync(join(root, assetPath)));
if (missing.length) {
  throw new Error(`Referenced runtime assets are missing:\n${missing.join('\n')}`);
}

for (const assetPath of assetPaths) {
  // Forward slashes are supported on both Windows and Cloudflare's Linux builders.
  const source = join(root, assetPath);
  const target = join(dist, assetPath);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { force: true, recursive: true });
}

console.log(`Copied ${assetPaths.size} runtime asset paths into dist.`);

const videoRoutes = [];
const videoSizes = {};
function checkAssetSizes(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) checkAssetSizes(file);
    else if (statSync(file).size > 25 * 1024 * 1024) {
      throw new Error(`Asset exceeds the Cloudflare Pages 25 MiB limit: ${file}`);
    }
    if (entry.isFile() && entry.name.endsWith('.mp4')) {
      const route = '/' + relative(dist, file).split('\\').join('/');
      videoRoutes.push(route);
      videoSizes[route] = statSync(file).size;
    }
    if (entry.isFile() && entry.name.endsWith('.m3u8')) {
      const playlist = readFileSync(file, 'utf8');
      const references = [
        ...playlist.split(/\r?\n/).filter((line) => line && !line.startsWith('#')),
        ...[...playlist.matchAll(/URI="([^"]+)"/g)].map((match) => match[1])
      ];
      for (const reference of references) {
        if (!existsSync(join(dirname(file), reference))) {
          throw new Error(`Streaming segment is missing: ${file} -> ${reference}`);
        }
      }
    }
  }
}
checkAssetSizes(dist);
// Only video files invoke the byte-range Worker. HTML, CSS, images and HLS
// playlists/segments continue through Pages' ordinary static serving.
if (existsSync(join(dist, '_worker.js'))) {
  if (videoRoutes.length > 100) throw new Error('Video routes exceed the Pages Functions routing limit.');
  writeFileSync(join(dist, '_routes.json'), JSON.stringify({ version: 1, include: videoRoutes, exclude: [] }, null, 2));
  const workerFile = join(dist, '_worker.js');
  const worker = readFileSync(workerFile, 'utf8');
  writeFileSync(workerFile, worker.replace('const VIDEO_SIZES = {};', `const VIDEO_SIZES = ${JSON.stringify(videoSizes)};`));
}
