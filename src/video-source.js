const sessions = new WeakMap();

export function resetVideoSource(player) {
  const previous = sessions.get(player);
  previous?.cleanup?.();
  previous?.hls?.destroy();
  const session = {};
  sessions.set(player, session);
  player.pause();
  player.removeAttribute('src');
  player.load();
  return session;
}

function prefersProgressive() {
  return /Android|iPhone|iPad|iPod|MicroMessenger/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform))
    || window.matchMedia?.('(pointer: coarse)').matches;
}

export async function setVideoSource(player, src, autoplay = true, fallbackSrc = '', preferHls = false) {
  const mp4 = fallbackSrc || player.dataset.mp4Src
    || player.querySelector('source[type="video/mp4"]')?.getAttribute('src') || '';
  const session = resetVideoSource(player);
  const current = () => sessions.get(player) === session;
  let fallingBack = false;
  let failed = false;
  let stallTimer;
  player.setAttribute('playsinline', '');
  player.setAttribute('webkit-playsinline', '');
  player.controls = true;
  const play = () => {
    if (!autoplay || !current()) return;
    player.play()?.catch((error) => {
      if (current() && error.name === 'NotAllowedError') player.dispatchEvent(new Event('video-play-blocked'));
    });
  };
  const fail = () => {
    if (!current() || failed) return;
    failed = true;
    clearTimeout(stallTimer);
    player.dispatchEvent(new Event('video-source-error'));
  };
  const nativeHls = player.canPlayType('application/vnd.apple.mpegurl');
  const useNative = (url = src) => {
    if (!current()) return;
    player.src = url;
    player.load();
    play();
  };
  const fallback = () => {
    if (!current()) return;
    clearTimeout(stallTimer);
    if (!mp4 || fallingBack || player.getAttribute('src') === mp4) return fail();
    fallingBack = true;
    const resumeAt = player.currentTime || 0;
    const resumePlayback = autoplay || !player.paused;
    session.hls?.destroy();
    session.hls = null;
    const resume = () => {
      if (!current()) return;
      if (resumeAt && Number.isFinite(player.duration)) player.currentTime = Math.min(resumeAt, Math.max(0, player.duration - .2));
      if (resumePlayback) { autoplay = true; play(); }
    };
    player.addEventListener('loadedmetadata', resume, { once: true });
    session.resume = resume;
    useNative(mp4);
    player.dispatchEvent(new Event('video-source-fallback'));
  };
  const onWaiting = () => {
    clearTimeout(stallTimer);
    // An idle preload=none player is not a stalled playback request.
    if (!player.paused && player.readyState < 2) stallTimer = setTimeout(fallback, 15000);
  };
  const onReady = () => clearTimeout(stallTimer);
  player.addEventListener('error', fallback);
  player.addEventListener('waiting', onWaiting);
  player.addEventListener('playing', onReady);
  player.addEventListener('pause', onReady);
  session.cleanup = () => {
    clearTimeout(stallTimer);
    player.removeEventListener('error', fallback);
    player.removeEventListener('waiting', onWaiting);
    player.removeEventListener('playing', onReady);
    player.removeEventListener('pause', onReady);
    if (session.resume) player.removeEventListener('loadedmetadata', session.resume);
  };
  // MP4 starts synchronously inside the original tap on iOS and WeChat,
  // without depending on MSE support in an embedded Android browser.
  if (/\.m3u8(?:[?#]|$)/i.test(src) && mp4 && prefersProgressive() && !preferHls) {
    useNative(mp4);
    return;
  }
  // Safari's native HLS is reliable; other browsers use MSE for consistent seeking.
  if (!/\.m3u8(?:[?#]|$)/i.test(src) || (nativeHls && /Apple/.test(navigator.vendor))) {
    useNative();
    return;
  }
  try {
    const { default: Hls } = await import('hls.js/light');
    if (sessions.get(player) !== session) return;
    if (!Hls.isSupported()) {
      if (nativeHls) useNative();
      else fallback();
      return;
    }
    const hls = new Hls({ enableWorker: false });
    session.hls = hls;
    hls.on(Hls.Events.MANIFEST_PARSED, play);
    hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) fallback(); });
    hls.loadSource(src);
    hls.attachMedia(player);
  } catch {
    if (sessions.get(player) === session) fallback();
  }
}

// Inline players retain their normal controls and MP4 fallback markup.
document.querySelectorAll('video[data-hls-src]').forEach((player) => {
  setVideoSource(player, player.dataset.hlsSrc, false);
});
