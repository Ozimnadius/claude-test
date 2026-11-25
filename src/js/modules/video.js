/**
 * Видео во всплывающем окне (partials/components/video-modal.hbs).
 *
 * Ссылки [data-video="id ролика YouTube"] ведут на ролик (без JS он откроется на YouTube);
 * со скриптом клик открывает модальный <dialog> с плеером youtube-nocookie.
 * Плеер вставляется при открытии и удаляется при закрытии — видео не играет в фоне
 * и не грузится заранее. Закрытие: Esc (сам <dialog>), крестик, клик по затемнению;
 * фокус возвращается на ссылку, с которой окно открыли.
 */

const EMBED = 'https://www.youtube-nocookie.com/embed/';

export function initVideo() {
  const modal = document.querySelector('[data-video-modal]');
  if (!modal) return;

  const frame = modal.querySelector('[data-video-modal-frame]');
  const title = modal.querySelector('[data-video-modal-title]');

  const open = (link) => {
    const id = encodeURIComponent(link.dataset.video);
    const iframe = document.createElement('iframe');

    iframe.src = `${EMBED}${id}?autoplay=1&rel=0`;
    iframe.title = link.textContent.trim();
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;

    title.textContent = link.textContent.trim();
    frame.replaceChildren(iframe);
    modal.showModal();
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-video]');
    // Клик с модификатором (новая вкладка) — оставляем браузеру
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;

    event.preventDefault();
    open(link);
  });

  modal.addEventListener('click', (event) => {
    // Клик по затемнению приходит на сам <dialog>, но за пределами его прямоугольника
    const rect = modal.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if ((event.target === modal && outside) || event.target.closest('[data-video-modal-close]'))
      modal.close();
  });

  modal.addEventListener('close', () => frame.replaceChildren());
}
