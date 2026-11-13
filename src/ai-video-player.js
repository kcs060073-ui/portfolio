import { setVideoSource, resetVideoSource } from './video-source.js';

const modal = document.querySelector('#aiVideoModal');
const player = document.querySelector('#aiVideoPlayer');
const title = document.querySelector('#aiVideoModalTitle');
const status = document.querySelector('#aiVideoStatus');
function showError() {
  status.textContent = '视频暂时加载失败，请关闭后重试。';
  status.hidden = false;
}

document.querySelectorAll('.js-ai-video-open').forEach((card) => {
  card.addEventListener('click', () => {
    title.textContent = card.dataset.videoTitle || 'AI 视频实验';
    status.hidden = true;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    setVideoSource(player, card.dataset.videoSrc);
  });
});

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  resetVideoSource(player);
}

player.addEventListener('video-source-error', showError);
player.addEventListener('error', () => {
  if (modal.classList.contains('is-open')) showError();
});
document.querySelectorAll('[data-ai-video-close]').forEach((el) => el.addEventListener('click', closeModal));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});
