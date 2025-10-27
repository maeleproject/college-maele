document.addEventListener('DOMContentLoaded', () => {
  const thumbs = document.querySelectorAll('.thumb');
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || thumbs.length === 0) return;

  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  const items = Array.from(thumbs).map(t => ({ full: t.dataset.full, caption: t.dataset.caption }));
  let idx = 0;

  function open(i) {
    idx = i;
    lbImg.src = items[idx].full;
    lbImg.alt = items[idx].caption || '';
    lbCaption.textContent = items[idx].caption || '';
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.add('hidden');
    lbImg.src = '';
    document.body.style.overflow = '';
  }
  function prev() { idx = (idx - 1 + items.length) % items.length; open(idx); }
  function next() { idx = (idx + 1) % items.length; open(idx); }

  thumbs.forEach((t, i) => t.addEventListener('click', () => open(i)));
  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('hidden')) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
  });
});
