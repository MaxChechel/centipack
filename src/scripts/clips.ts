/**
 * Clip playback — the site's only JavaScript.
 *
 * One module per page owning every clip: two IntersectionObservers, not a
 * script per instance.
 *
 * Behaviour:
 *  - `preload="none"`; the source is attached only when a clip nears the
 *    viewport, so nothing is fetched on page load.
 *  - Playback starts once a quarter of the clip is in view, and pauses when it
 *    leaves.
 *  - Under `prefers-reduced-motion` nothing plays: the poster stays.
 *  - No pause control, by client decision (WORKLOG 177).
 */
const LOAD_MARGIN = '400px 0px';
const PLAY_THRESHOLD = 0.25;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const videoOf = (root: Element): HTMLVideoElement | null =>
  root.querySelector('video');

const attachSource = (video: HTMLVideoElement): void => {
  const src = video.dataset.src;
  if (!src) return;
  video.src = src;
  delete video.dataset.src;
  video.load();
};

/* Starts the download a screen early, so the clip is ready when it arrives. */
const loader = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const video = videoOf(entry.target);
      if (video && !reduceMotion.matches) attachSource(video);
      loader.unobserve(entry.target);
    }
  },
  { rootMargin: LOAD_MARGIN },
);

const player = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const video = videoOf(entry.target);
      if (!video) continue;
      if (entry.isIntersecting && !reduceMotion.matches) {
        attachSource(video);
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  },
  { threshold: PLAY_THRESHOLD },
);

for (const root of document.querySelectorAll('[data-clip]')) {
  loader.observe(root);
  player.observe(root);
}
