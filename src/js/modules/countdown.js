/**
 * Обратный отсчёт до конца акции (partials/components/sale-card.hbs).
 *
 * Разметка: [data-countdown="дни:часы:минуты"] с вложенными [data-countdown-days|hours|minutes].
 *   data-countdown-end — дата окончания (ISO 8601): отсчёт идёт до неё (реальный сайт);
 *   без неё (демо) конец = момент загрузки + остаток из data-countdown, чтобы таймер всегда «шёл».
 * Обновляется раз в 10 секунд; часы и минуты — двумя цифрами. aria-label таймера (role="timer")
 * обновляется вместе с цифрами — так остаток читается экранными дикторами целиком.
 */

const MINUTE = 60 * 1000;
const TICK = 10 * 1000;

function parseEnd(el) {
  const fromAttr = Date.parse(el.dataset.countdownEnd ?? '');
  if (!Number.isNaN(fromAttr)) return fromAttr;

  const [days = 0, hours = 0, minutes = 0] = el.dataset.countdown.split(':').map(Number);
  return Date.now() + ((days * 24 + hours) * 60 + minutes) * MINUTE;
}

function render(el, end) {
  // Округление вверх: пока идёт последняя минута, показываем «1 м», а не «0 м»
  const total = Math.max(0, Math.ceil((end - Date.now()) / MINUTE));
  const days = Math.floor(total / (24 * 60));
  const hours = Math.floor((total % (24 * 60)) / 60);
  const minutes = total % 60;
  const set = (part, value) => {
    const target = el.querySelector(`[data-countdown-${part}]`);
    if (target) target.textContent = value;
  };

  set('days', String(days));
  set('hours', String(hours).padStart(2, '0'));
  set('minutes', String(minutes).padStart(2, '0'));
  el.setAttribute('aria-label', `До конца акции ${days} д ${hours} ч ${minutes} мин`);
}

export function initCountdowns() {
  const timers = [...document.querySelectorAll('[data-countdown]')].map((el) => ({
    el,
    end: parseEnd(el),
  }));

  const tick = () => timers.forEach(({ el, end }) => render(el, end));
  tick();
  setInterval(tick, TICK);
}
