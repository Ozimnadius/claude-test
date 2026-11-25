/**
 * Слайдеры на Swiper (scss/layout/_slider.scss): ленты карточек и бренды.
 *
 * Разметка: <div class="slider" data-slider="xs|sm|md|all"> > обёртка (например, .card-grid) > слайды.
 *   data-slider      — до какой ширины работает слайдер: xs ≤ 575, sm ≤ 768, md ≤ 1000, all — всегда.
 *                      Шире Swiper выключается и снова работает обычная сетка;
 *   data-slider-gap  — промежуток между слайдами, px (по умолчанию 6, как в сетках макета);
 *   data-slider-fit  — если с этим промежутком все слайды помещаются, свободное место делится поровну
 *                      между слайдами и краями (бренды: в макете логотипы стоят равномерно по строке).
 * Стрелки — кнопки [data-slider-prev] / [data-slider-next] рядом со слайдером (в том же родителе).
 *
 * Классы обёртки и слайдов (.slider__wrapper, .slider__slide) ставятся при запуске и снимаются
 * при выключении, атрибуты доступности, которые добавляет Swiper, — возвращаются как были.
 */
import Swiper from 'swiper';
import { A11y, Navigation } from 'swiper/modules';

// Совпадают с брейкпоинтами в scss/abstracts/_breakpoints.scss
const MEDIA = {
  xs: '(width <= 575px)',
  sm: '(width <= 768px)',
  md: '(width <= 1000px)',
  all: 'all',
};

const A11Y = {
  prevSlideMessage: 'Предыдущий слайд',
  nextSlideMessage: 'Следующий слайд',
  firstSlideMessage: 'Это первый слайд',
  lastSlideMessage: 'Это последний слайд',
  slideLabelMessage: '{{index}} из {{slidesLength}}',
};

// Атрибуты, которые меняет модуль A11y: перед запуском запоминаем, после выключения возвращаем
const TOUCHED_ATTRS = [
  'id',
  'role',
  'aria-label',
  'aria-roledescription',
  'aria-live',
  'aria-hidden',
  'inert',
];

function snapshot(elements) {
  return elements.map((el) => [el, TOUCHED_ATTRS.map((name) => [name, el.getAttribute(name)])]);
}

function restore(saved) {
  saved.forEach(([el, attrs]) =>
    attrs.forEach(([name, value]) => {
      if (value === null) el.removeAttribute(name);
      else el.setAttribute(name, value);
    }),
  );
}

/**
 * Равномерная расстановка (data-slider-fit): сначала раскладка с обычным промежутком; если слайды
 * поместились (Swiper «заблокирован» — листать нечего), свободное место делится поровну на
 * промежутки и поля по краям. Округление вниз — чтобы из-за долей пикселя слайдер не «разблокировался».
 */
function distribute(swiper, gap) {
  Object.assign(swiper.params, { spaceBetween: gap, slidesOffsetBefore: 0, slidesOffsetAfter: 0 });
  swiper.update();
  if (!swiper.isLocked) return;

  const slidesWidth = swiper.slidesSizesGrid.reduce((sum, size) => sum + size, 0);
  const even = Math.floor((swiper.size - slidesWidth) / (swiper.slides.length + 1));

  Object.assign(swiper.params, {
    spaceBetween: even,
    slidesOffsetBefore: even,
    slidesOffsetAfter: even,
  });
  swiper.update();
}

function createSlider(el) {
  const wrapper = el.firstElementChild;
  if (!wrapper) return;

  const slides = [...wrapper.children];
  const gap = Number(el.dataset.sliderGap ?? 6);
  const fit = el.hasAttribute('data-slider-fit');
  const prevEl = el.parentElement.querySelector('[data-slider-prev]');
  const nextEl = el.parentElement.querySelector('[data-slider-next]');

  let swiper = null;
  let saved = [];

  const mount = () => {
    if (swiper) return;

    saved = snapshot([wrapper, ...slides]);
    wrapper.classList.add('slider__wrapper');
    slides.forEach((slide) => slide.classList.add('slider__slide'));

    swiper = new Swiper(el, {
      modules: [Navigation, A11y],
      wrapperClass: 'slider__wrapper',
      slideClass: 'slider__slide',
      slidesPerView: 'auto',
      spaceBetween: gap,
      watchOverflow: true,
      // Слайдер в скрытой панели таба пересчитает размеры, когда панель покажут
      observer: true,
      observeParents: true,
      navigation: prevEl && nextEl ? { prevEl, nextEl } : false,
      // У слайдов-пунктов списка (<ul> брендов) роль listitem, иначе ломается семантика списка
      a11y: { ...A11Y, slideRole: /^(UL|OL)$/.test(wrapper.tagName) ? 'listitem' : 'group' },
      on: fit
        ? {
            init: (instance) => distribute(instance, gap),
            resize: (instance) => distribute(instance, gap),
          }
        : {},
    });
  };

  const unmount = () => {
    if (!swiper) return;

    swiper.destroy(true, true);
    swiper = null;
    wrapper.classList.remove('slider__wrapper');
    slides.forEach((slide) => slide.classList.remove('slider__slide'));
    restore(saved);
  };

  const media = window.matchMedia(MEDIA[el.dataset.slider] ?? MEDIA.all);
  const sync = () => (media.matches ? mount() : unmount());

  media.addEventListener('change', sync);
  sync();
}

export function initSliders() {
  document.querySelectorAll('[data-slider]').forEach(createSlider);
}
