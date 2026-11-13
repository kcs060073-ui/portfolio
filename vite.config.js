import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const pages = [
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
  'xizhu-yongqing-case.html'
];

const input = Object.fromEntries(
  pages.map((page) => [page.replace(/\.html$/, ''), resolve(process.cwd(), page)])
);

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input }
  }
});