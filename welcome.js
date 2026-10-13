/* หน้าต่างเลือกโหมดมืด/สว่าง แสดงเฉพาะครั้งแรกที่เข้าเว็บ (จำค่าใน localStorage: themeChosen)
   เลือกแล้วธีมเปลี่ยนทันที (ใช้ key 'theme' เดิมของระบบ) กดปุ่มยืนยันเพื่อปิด */
(function () {
  const KEY = 'themeChosen', root = document.documentElement;
  try { if (localStorage.getItem(KEY) === '1') return; } catch (e) {}
  const wl = document.getElementById('wl');
  if (!wl) return;
  const opts = [...wl.querySelectorAll('.wl-o')], go = document.getElementById('wlGo');
  const goText = go.querySelector('.cta-t'), goIcon = go.querySelector('.cta-ic use');
  const btnTheme = document.getElementById('btnTheme');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behind = () => [...document.querySelectorAll('.fixbar, #top')];
  const LABEL = { dark: 'ໃຊ້ໂໝດມືດ', light: 'ໃຊ້ໂໝດສະຫວ່າງ' };
  let cur = root.dataset.theme === 'dark' ? 'dark' : 'light';
  let isOpen = false, finished = false, last = null, tfTimer;

  function paint(animate) {
    opts.forEach(o => {
      const on = o.dataset.t === cur;
      o.setAttribute('aria-checked', on); o.tabIndex = on ? 0 : -1;
    });
    goText.textContent = LABEL[cur];
    goIcon.setAttribute('href', cur === 'dark' ? '#moon' : '#sun');
    if (animate && !reduce) { goText.classList.remove('sw'); void goText.offsetWidth; goText.classList.add('sw'); }
  }
  function apply(t) {
    if (t === cur && root.dataset.theme === t) return;
    cur = t;
    if (!reduce) {
      root.classList.add('tf'); clearTimeout(tfTimer);
      tfTimer = setTimeout(() => root.classList.remove('tf'), 480);
    }
    root.dataset.theme = t;
    if (btnTheme && typeof ic === 'function') btnTheme.innerHTML = ic(t === 'dark' ? 'moon' : 'sun');
    try { localStorage.setItem('theme', t); } catch (e) {}
    paint(true);
  }
  function open() {
    if (isOpen) return;
    isOpen = true; last = document.activeElement;
    if (typeof closeMenu === 'function') closeMenu();
    const amClose = document.getElementById('amClose');
    if (amClose && document.getElementById('am').classList.contains('open')) amClose.click();
    behind().forEach(e => { e.inert = true; });
    document.body.style.overflow = 'hidden';
    wl.inert = false; wl.setAttribute('aria-hidden', 'false'); paint(false);
    wl.classList.add('open');
    setTimeout(() => (opts.find(o => o.tabIndex === 0) || go).focus({ preventScroll: true }), 450);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    try { localStorage.setItem(KEY, '1'); localStorage.setItem('theme', cur); } catch (e) {}
    wl.classList.remove('open'); wl.inert = true; wl.setAttribute('aria-hidden', 'true');
    behind().forEach(e => { e.inert = false; });
    document.body.style.overflow = '';
    if (last && last.focus) last.focus({ preventScroll: true });
  }
  function confirm() {
    if (finished) return;
    finished = true; go.classList.add('done');
    setTimeout(close, reduce ? 0 : 900);
  }

  opts.forEach(o => o.addEventListener('click', () => apply(o.dataset.t)));
  go.addEventListener('click', confirm);
  wl.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); confirm(); return; }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && e.target.classList.contains('wl-o')) {
      e.preventDefault();
      const n = opts.find(o => o !== e.target); apply(n.dataset.t); n.focus();
    }
    if (e.key === 'Tab') {
      const f = [opts.find(o => o.tabIndex === 0), go];
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  setTimeout(open, reduce ? 0 : 1000);
})();
