const sessions = new WeakMap();

export function resetVideoSource(player) {
  const previous = sessions.get(player);
  previous?.hls?.destroy();
  const session = {};
  sessions.set(player, session);
  player.pause();
  player.removeAttribute('src');
  player.load();
  return session;
}

export async function setVideoSource(player, src, autoplay = true) {
  const session = resetVideoSource(player);
  const play = () => { if (autoplay) player.play().catch(() => {}); };
  const fail = () => player.dispatchEvent(new Event('video-source-error'));
  const nativeHls = player.canPlayType('application/vnd.apple.mpegurl');
  const useNative = () => {
    player.src = src;
    player.load();
    play();
  };
  // Safari's native HLS is reliable; other browsers use MSE for consistent seeking.
  if (!src.endsWith('.m3u8') || (nativeHls && /Apple/.test(navigator.vendor))) {
    useNative();
    return;
  }
  try {
    const { default: Hls } = await import('hls.js/light');
    if (sessions.get(player) !== session) return;
    if (!Hls.isSupported()) {
      if (nativeHls) useNative();
      else fail();
      return;
    }
    const hls = new Hls({ enableWorker: false });
    session.hls = hls;
    hls.on(Hls.Events.MANIFEST_PARSED, play);
    hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) fail(); });
    hls.loadSource(src);
    hls.attachMedia(player);
  } catch {
    if (sessions.get(player) === session) fail();
  }
}

// Inline players retain their normal controls and MP4 fallback markup.
document.querySelectorAll('video[data-hls-src]').forEach((player) => {
  setVideoSource(player, player.dataset.hlsSrc, false);
});
