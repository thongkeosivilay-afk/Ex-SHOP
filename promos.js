/* รูปโปรโมทตอนเข้าเว็บ — ดึงจาก Supabase (shop_promos) ตั้งค่ารูปได้ที่ห้องแอดมิน > ການຕັ້ງຄ່າເວັບໄຊ > ຮູບໂປຣໂມຊັນ (สูงสุด 10 รูป)
   - แสดงทีละรูป กด "ປິດ" แล้วรูปถัดไปจะโผล่ต่อ จนครบ
   - ติ๊ก "ບໍ່ສະແດງອີກເປັນເວລາ 1 ຊົ່ວໂມງ" แล้วกดปิด = ไม่แสดงอีก 1 ชั่วโมง (จำใน localStorage: exPromoUntil)
   - รูปถูกปรับขนาดให้พอดีจอเสมอ (ไม่เกินขอบจอทั้งกว้างและสูง รวมช่องปลอดภัยของ iPhone) และปรับใหม่เมื่อหมุนจอ/ย่อขยาย
   - ถ้ายังไม่ได้เลือกโหมดมืด/สว่างครั้งแรก (welcome.js) จะรอให้ปิดก่อนแล้วค่อยโชว์ */
(function () {
  var HKEY = 'exPromoUntil', MAX = 10, HOUR = 3600 * 1000;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { if (Date.now() < Number(localStorage.getItem(HKEY) || 0)) return; } catch (e) {}
  if (!window.exRpc || /[?&]auth=/.test(location.search)) return;

  var urls = [], idx = 0, loaded = {}, busy = false, checked = false, alive = false;
  var root, card, img, chk, closeBtn, stage, cur = null;

  function load(u) {
    if (loaded[u]) return loaded[u];
    return (loaded[u] = new Promise(function (res) {
      var im = new Image();
      im.onload = function () { res(im.naturalWidth && im.naturalHeight ? { url: u, w: im.naturalWidth, h: im.naturalHeight } : null); };
      im.onerror = function () { res(null); };
      im.src = u;
    }));
  }
  function waitWelcome() {
    return new Promise(function (res) {
      var t0 = Date.now();
      (function poll() {
        var chosen = true;
        try { chosen = localStorage.getItem('themeChosen') === '1' || !document.getElementById('wl'); } catch (e) {}
        if (chosen || Date.now() - t0 > 90000) return setTimeout(res, chosen ? 350 : 0);
        setTimeout(poll, 300);
      })();
    });
  }
  function insets() {
    var p = document.createElement('div');
    p.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(p);
    var c = getComputedStyle(p), r = { t: parseFloat(c.paddingTop) || 0, r: parseFloat(c.paddingRight) || 0, b: parseFloat(c.paddingBottom) || 0, l: parseFloat(c.paddingLeft) || 0 };
    document.body.removeChild(p);
    return r;
  }
  /* ปรับขนาดให้พอดีจอ: ไม่เกินทั้งความกว้างและความสูงของจอ (รวมช่องปลอดภัย + แถวปุ่มด้านล่าง) */
  function fit() {
    if (!cur || !root) return;
    var s = insets(), M = 17, VM = 18, ctlH = ctl().offsetHeight || 40, gap = 14;
    var vw = document.documentElement.clientWidth || window.innerWidth;
    var vh = Math.min(window.innerHeight, window.visualViewport ? window.visualViewport.height : 1e9);
    var availW = Math.max(120, Math.min(vw - 2 * M - s.l - s.r, 520));
    var availH = Math.max(120, vh - s.t - s.b - 2 * VM - ctlH - gap);
    var k = Math.min(availW / cur.w, availH / cur.h, 1.6);
    var w = Math.max(1, Math.floor(cur.w * k)), h = Math.max(1, Math.floor(cur.h * k));
    img.style.width = w + 'px'; img.style.height = h + 'px';
    stage.style.width = Math.min(availW, Math.max(w, Math.min(300, availW))) + 'px';
  }
  function ctl() { return root.querySelector('.pp-ctl'); }

  function build() {
    root = document.createElement('div');
    root.className = 'pp'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'promotion');
    root.innerHTML = '<div class="pp-bg"></div><div class="pp-st"><div class="pp-card"><img class="pp-img" alt="" draggable="false"></div>'
      + '<div class="pp-ctl"><button class="pp-chk" type="button" role="checkbox" aria-checked="false"><i class="pp-box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></i><span>ບໍ່ສະແດງອີກເປັນເວລາ 1 ຊົ່ວໂມງ</span></button>'
      + '<button class="pp-x" type="button">ປິດ</button></div></div>';
    document.body.appendChild(root);
    stage = root.querySelector('.pp-st'); card = root.querySelector('.pp-card'); img = root.querySelector('.pp-img');
    chk = root.querySelector('.pp-chk'); closeBtn = root.querySelector('.pp-x');
    chk.addEventListener('click', function () { checked = !checked; chk.setAttribute('aria-checked', checked ? 'true' : 'false'); });
    closeBtn.addEventListener('click', onClose);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', function () { setTimeout(fit, 250); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  }
  function onKey(e) { if (alive && e.key === 'Escape') { e.preventDefault(); onClose(); } }

  function lock(on) { try { document.body.style.overflow = on ? 'hidden' : ''; } catch (e) {} }
  function finish() {
    alive = false;
    if (card) { card.classList.remove('in'); card.classList.add('out'); }
    if (root) root.classList.remove('on');
    lock(false);
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { if (root && root.parentNode) root.parentNode.removeChild(root); root = null; }, 700);
  }
  function onClose() {
    if (busy || !alive) return;
    busy = true;
    if (checked) { try { localStorage.setItem(HKEY, String(Date.now() + HOUR)); } catch (e) {} return finish(); }
    card.classList.remove('in'); card.classList.add('out');
    setTimeout(function () { idx++; showAt(idx).then(function () { busy = false; }); }, reduce ? 0 : 300);
  }
  /* แสดงรูปลำดับที่ i (ข้ามรูปที่โหลดไม่ได้) ถ้าไม่มีรูปเหลือ → ปิดทั้งหมด */
  function showAt(i) {
    return (function next(k) {
      if (k >= urls.length) { if (alive) finish(); return Promise.resolve(false); }
      return load(urls[k]).then(function (r) {
        if (!r) return next(k + 1);
        idx = k; cur = r;
        if (urls[k + 1]) load(urls[k + 1]);
        img.src = r.url; fit();
        card.classList.remove('out', 'in'); void card.offsetWidth;
        if (!alive) { alive = true; lock(true); root.classList.add('on'); try { closeBtn.focus({ preventScroll: true }); } catch (e) {} }
        card.classList.add('in');
        return true;
      });
    })(i);
  }

  window.exRpc('shop_promos', {}).then(function (rows) {
    rows = Array.isArray(rows) ? rows : [];
    urls = rows.map(function (r) { return r && r.url; }).filter(function (u) { return typeof u === 'string' && /^https?:\/\//i.test(u); }).slice(0, MAX);
    if (!urls.length) return;
    return load(urls[0]).then(function () {
      return waitWelcome().then(function () { build(); return showAt(0); });
    });
  }).catch(function () {});
})();
