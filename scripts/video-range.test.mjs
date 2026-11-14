import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../public/_worker.js';
const data = Uint8Array.from({ length: 30 }, (_, i) => i);
function env(status = 200) {
  return { ASSETS: { fetch: async (request) => new Response(request.method === 'HEAD' ? null : new ReadableStream({ start(c) { c.enqueue(data.slice(0, 7)); c.enqueue(data.slice(7, 19)); c.enqueue(data.slice(19)); c.close(); } }), { status, headers: { 'content-type': 'video/mp4', 'content-length': '30', etag: '"version-a"' } }) } };
}
for (const [range, start, end] of [['bytes=0-', 0, 29], ['bytes=5-22', 5, 22], ['bytes=-4', 26, 29], ['bytes=27-100', 27, 29]]) {
  test(`serves precise ${range} across stream chunks`, async () => {
    const res = await worker.fetch(new Request('https://test/assets/film.mp4', { headers: { Range: range } }), env());
    assert.equal(res.status, 206); assert.equal(res.headers.get('content-range'), `bytes ${start}-${end}/30`);
    assert.equal(res.headers.get('content-length'), String(end - start + 1));
    assert.deepEqual(new Uint8Array(await res.arrayBuffer()), data.slice(start, end + 1));
  });
}
test('rejects invalid and unsatisfiable ranges', async () => {
  for (const range of ['bytes=30-', 'bytes=9-3', 'bytes=-0', 'bytes=0-2,6-8', 'bytes=-', 'bytes=NaN-']) {
    const res = await worker.fetch(new Request('https://test/assets/film.mp4', { headers: { Range: range } }), env());
    assert.equal(res.status, 416, range); assert.equal(res.headers.get('content-range'), 'bytes */30');
  }
});
test('keeps full responses and mismatched If-Range responses intact', async () => {
  for (const headers of [{}, { Range: 'bytes=5-7', 'If-Range': '"old-version"' }]) {
    const res = await worker.fetch(new Request('https://test/assets/film.mp4', { headers }), env());
    assert.equal(res.status, 200); assert.deepEqual(new Uint8Array(await res.arrayBuffer()), data);
  }
});
test('HEAD has range headers without a body and upstream 206 passes through', async () => {
  const req = new Request('https://test/assets/film.mp4', { method: 'HEAD', headers: { Range: 'bytes=3-7' } });
  const res = await worker.fetch(req, env()); assert.equal(res.status, 206); assert.equal(res.body, null);
  assert.equal(res.headers.get('content-range'), 'bytes 3-7/30');
  const upstream = await worker.fetch(new Request('https://test/assets/film.mp4', { headers: { Range: 'bytes=3-7' } }), env(206));
  assert.equal(upstream.status, 206); assert.equal(upstream.headers.get('content-range'), null);
});
