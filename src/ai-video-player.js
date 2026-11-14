import { setVideoSource, resetVideoSource } from './video-source.js';

const modal = document.querySelector('#aiVideoModal');
const player = document.querySelector('#aiVideoPlayer');
const title = document.querySelector('#aiVideoModalTitle');
const status = document.querySelector('#aiVideoStatus');
const direct = document.querySelector('#aiVideoDirectLink');
const quality = document.querySelector('#aiVideoQuality');
let activeCard;
function showError() {
  status.textContent = '视频暂时加载失败，请重试或使用下方入口单独打开。微信内仍无法播放时，可用系统浏览器打开本站。';
  status.hidden = false;
}

document.querySelectorAll('.js-ai-video-open').forEach((card) => {
  card.addEventListener('click', () => {
    activeCard = card;
    title.textContent = card.dataset.videoTitle || 'AI 视频实验';
    status.hidden = true;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    direct.href = card.dataset.videoMp4;
    setVideoSource(player, card.dataset.videoSrc, true, card.dataset.videoMp4).then(() => {
      if (activeCard !== card) return;
      const hd = player.getAttribute('src') !== card.dataset.videoMp4;
      quality.dataset.hd = String(hd);
      quality.textContent = hd ? '切换流畅版' : '切换原画质';
    });
  });
});

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  resetVideoSource(player);
  activeCard = null;
}

player.addEventListener('video-source-error', showError);
player.addEventListener('video-play-blocked', () => {
  status.textContent = '请点播放器中的播放按钮开始观看。';
  status.hidden = false;
});
player.addEventListener('playing', () => { status.hidden = true; });
player.addEventListener('video-source-fallback', () => {
  quality.dataset.hd = 'false';
  quality.textContent = '切换原画质';
});
quality.addEventListener('click', () => {
  if (!activeCard) return;
  const hd = quality.dataset.hd !== 'true';
  quality.dataset.hd = String(hd);
  quality.textContent = hd ? '切换流畅版' : '切换原画质';
  status.hidden = true;
  setVideoSource(player, hd ? activeCard.dataset.videoSrc : activeCard.dataset.videoMp4, true, activeCard.dataset.videoMp4, hd);
});
document.querySelector('#aiVideoRetry').addEventListener('click', () => {
  if (!activeCard) return;
  status.hidden = true;
  quality.dataset.hd = 'false';
  quality.textContent = '切换原画质';
  setVideoSource(player, activeCard.dataset.videoMp4);
});
document.querySelectorAll('[data-ai-video-close]').forEach((el) => el.addEventListener('click', closeModal));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});
