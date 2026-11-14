// Pages' static video responses can ignore Range. Give native mobile players
// exact byte responses without buffering an entire video in Worker memory.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.endsWith('.mp4') || !['GET', 'HEAD'].includes(request.method)) return env.ASSETS.fetch(request);
    const response = await env.ASSETS.fetch(request);
    const range = request.headers.get('range');
    if (!range || response.status !== 200) return response;
    const size = Number(response.headers.get('content-length'));
    if (!Number.isSafeInteger(size) || size <= 0 || !response.headers.get('content-type')?.startsWith('video/')) return response;
    const ifRange = request.headers.get('if-range');
    if (ifRange && ifRange !== response.headers.get('etag') && ifRange !== response.headers.get('last-modified')) return response;
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    let start, end;
    if (match && (match[1] || match[2])) {
      if (!match[1]) { start = Math.max(0, size - Number(match[2])); end = size - 1; }
      else { start = Number(match[1]); end = match[2] ? Math.min(size - 1, Number(match[2])) : size - 1; }
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) {
      await response.body?.cancel();
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' } });
    }
    const headers = new Headers(response.headers);
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Length', String(end - start + 1));
    headers.set('Cache-Control', 'public, max-age=3600, no-transform');
    headers.delete('content-encoding');
    if (request.method === 'HEAD' || !response.body) return new Response(null, { status: 206, headers });
    const reader = response.body.getReader();
    let offset = 0;
    const slice = new ReadableStream({
      async pull(controller) {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) { controller.close(); return; }
            const next = offset + value.byteLength;
            if (next > start) controller.enqueue(value.subarray(Math.max(0, start - offset), Math.min(value.byteLength, end + 1 - offset)));
            offset = next;
            if (offset > end) { controller.close(); await reader.cancel(); return; }
            if (offset > start) return;
          }
        } catch (error) { controller.error(error); }
      },
      cancel(reason) { return reader.cancel(reason); }
    });
    // Workers derive Content-Length from this stream type. Node tests use the
    // standard stream and the explicit header above.
    let body = slice;
    if (typeof FixedLengthStream !== 'undefined') {
      const fixed = new FixedLengthStream(end - start + 1);
      slice.pipeTo(fixed.writable).catch(() => {});
      body = fixed.readable;
    }
    return new Response(body, { status: 206, headers });
  }
};
