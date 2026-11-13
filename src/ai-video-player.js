const modal = document.querySelector('#aiVideoModal');
const player = document.querySelector('#aiVideoPlayer');
const title = document.querySelector('#aiVideoModalTitle');
const status = document.querySelector('#aiVideoStatus');
let hls;
let request = 0;

function resetPlayer() {
  request += 1;
  player.pause();
  hls?.destroy();
  hls = undefined;
  player.removeAttribute('src');
  player.load();
}

function showError() {
  status.textContent = '视频暂时加载失败，请关闭后重试。';
  status.hidden = false;
}

const play = () => player.play().catch(() => {
  // Browser policies may require a second tap on the native play control.
});

document.querySelectorAll('.js-ai-video-open').forEach((card) => {
  card.addEventListener('click', async () => {
    resetPlayer();
    const currentRequest = request;
    title.textContent = card.dataset.videoTitle || 'AI 视频实验';
    status.hidden = true;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    const src = card.dataset.videoSrc;

    if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = src;
      play();
      return;
    }

    try {
      const { default: Hls } = await import('hls.js/light');
      if (currentRequest !== request) return;
      if (!Hls.isSupported()) { showError(); return; }
      hls = new Hls({ enableWorker: false });
      hls.on(Hls.Events.MANIFEST_PARSED, play);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) showError();
      });
      hls.loadSource(src);
      hls.attachMedia(player);
    } catch {
      if (currentRequest === request) showError();
    }
  });
});

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  resetPlayer();
}

player.addEventListener('error', () => {
  if (modal.classList.contains('is-open')) showError();
});
document.querySelectorAll('[data-ai-video-close]').forEach((el) => el.addEventListener('click', closeModal));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});
