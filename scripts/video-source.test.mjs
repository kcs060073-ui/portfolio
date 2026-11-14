import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/video-source.js', import.meta.url), 'utf8');
class Player extends EventTarget {
  constructor() { super(); this.dataset = {}; this.attrs = {}; this.currentTime = 0; this.duration = 120; this.paused = true; this.readyState = 0; this.plays = 0; }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  load() {}
  play() { this.paused = false; this.plays++; return Promise.resolve(); }
  setAttribute(k, v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k] ?? null; }
  removeAttribute(k) { delete this.attrs[k]; }
  querySelector() { return this.fallback ? { getAttribute: () => this.fallback } : null; }
  canPlayType() { return this.nativeHls ? 'maybe' : ''; }
  set src(v) { this.attrs.src = v; }
  get src() { return this.attrs.src; }
}
async function setup({ mobile = false, native = false, supported = true, delayed = false } = {}) {
  const instances = [];
  class Hls {
    static Events = { MANIFEST_PARSED: 'manifest', ERROR: 'error' };
    static isSupported() { return supported; }
    constructor() { this.events = {}; instances.push(this); }
    on(name, handler) { this.events[name] = handler; }
    loadSource(src) { this.src = src; }
    attachMedia(player) { this.player = player; }
    destroy() { this.destroyed = true; }
  }
  const context = vm.createContext({ Event, navigator: { userAgent: mobile ? 'Android MicroMessenger' : 'Chrome', vendor: native ? 'Apple Computer, Inc.' : 'Google Inc.', platform: '', maxTouchPoints: 0 }, window: { matchMedia: () => ({ matches: false }) }, document: { querySelectorAll: () => [] }, setTimeout, clearTimeout });
  let release;
  const wait = delayed ? new Promise(resolve => { release = resolve; }) : Promise.resolve();
  const mod = new vm.SourceTextModule(source, { context, importModuleDynamically: async () => {
    await wait;
    const stub = new vm.SyntheticModule(['default'], function () { this.setExport('default', Hls); }, { context });
    await stub.link(() => {}); await stub.evaluate(); return stub;
  } });
  await mod.link(() => {}); await mod.evaluate();
  return { api: mod.namespace, instances, release };
}
test('WeChat/Android selects MP4 synchronously in the tap, without HLS or MSE', async () => {
  const { api, instances } = await setup({ mobile: true });
  const p = new Player(); p.fallback = 'film.mp4';
  const pending = api.setVideoSource(p, 'film.m3u8');
  assert.equal(p.src, 'film.mp4'); assert.equal(p.plays, 1);
  await pending; assert.equal(instances.length, 0);
});
test('native Safari HLS error falls back to MP4 and retains position', async () => {
  const { api } = await setup({ native: true });
  const p = new Player(); p.nativeHls = true;
  let errors = 0; p.addEventListener('video-source-error', () => errors++);
  await api.setVideoSource(p, 'film.m3u8', true, 'film.mp4', true);
  p.currentTime = 45; p.dispatchEvent(new Event('error'));
  assert.equal(p.src, 'film.mp4');
  p.dispatchEvent(new Event('loadedmetadata')); assert.equal(p.currentTime, 45);
  assert.equal(errors, 0);
  p.dispatchEvent(new Event('error')); assert.equal(errors, 1);
});
test('fatal MSE error destroys HLS and switches to the progressive fallback', async () => {
  const { api, instances } = await setup(); const p = new Player();
  await api.setVideoSource(p, 'film.m3u8', true, 'film.mp4');
  instances[0].events.error(null, { fatal: true });
  assert.equal(instances[0].destroyed, true); assert.equal(p.src, 'film.mp4');
});
test('unsupported MSE uses MP4 rather than leaving an empty video', async () => {
  const { api } = await setup({ supported: false }); const p = new Player();
  await api.setVideoSource(p, 'film.m3u8', false, 'film.mp4');
  assert.equal(p.src, 'film.mp4'); assert.equal(p.plays, 0);
});
test('closing a modal cancels an in-flight import and clears its listeners', async () => {
  const { api, instances, release } = await setup({ delayed: true }); const p = new Player();
  const pending = api.setVideoSource(p, 'film.m3u8', true, 'film.mp4');
  api.resetVideoSource(p); release(); await pending;
  assert.equal(instances.length, 0); assert.equal(p.src, undefined);
  p.dispatchEvent(new Event('error')); assert.equal(p.src, undefined);
});
test('an explicit original-quality request bypasses the mobile preference', async () => {
  const { api, instances } = await setup({ mobile: true }); const p = new Player();
  await api.setVideoSource(p, 'film.m3u8', true, 'film.mp4', true);
  assert.equal(instances[0].src, 'film.m3u8'); api.resetVideoSource(p);
});
