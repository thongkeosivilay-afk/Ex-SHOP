/* การ์ด "สถานะเว็บไซต์ / เปิดขาย 30 วัน" — ใช้ร่วมกันทุกหน้าแอดมิน
   - ยังไม่เปิดขาย : แสดง "ຍັງບໍ່ນັບ" + ปุ่ม "เปิดขาย" (ครึ่งการ์ด มุมซ้าย)
   - กดเปิดขาย     : ปุ่ม + ข้อความ เบลอจางหาย → เวลานับถอยหลัง 30 วันค่อยๆ โผล่ขึ้นมา
   - ครบ 30 วัน    : นับถอยหลังเบลอจางหาย → ข้อความหมดเวลา + ปุ่ม "ติดต่อ" (เช่าเว็บต่อ)
   สถานะและเวลาเก็บที่ Supabase (ตาราง site_sale · sale-setup.sql) — เซิร์ฟเวอร์เป็นคนกั้นซื้อ/เติมเงิน
   ใช้งาน: ใส่ <div id="saleMount"></div> แล้วโหลดไฟล์นี้ (หน้าที่ใช้ admin-nav.js จะสร้างให้เอง) */
(function () {
  if (window.__exSale) return; window.__exSale = true;

  var SB = { url: 'https://mjalctpfeizjukuprqti.supabase.co', key: 'sb_publishable_3EZ-Ulah6h9Xzze_DE0xow_E6iGHNiJ' };
  var CONTACT_FALLBACK = ''; /* ลิงก์ติดต่อสำรอง (ถ้าไม่ได้ตั้ง contact_url ในตาราง site_sale) เช่น 'https://wa.me/856XXXXXXXX' */

  function tok() {
    try { if (window.exToken) return window.exToken(); return localStorage.getItem('exSession') || sessionStorage.getItem('exSession') || ''; }
    catch (e) { return ''; }
  }
  function rpc(fn, body) {
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 15000);
    return fetch(SB.url + '/rest/v1/rpc/' + fn, {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', apikey: SB.key, Authorization: 'Bearer ' + SB.key },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json(); }).finally(function () { clearTimeout(t); });
  }

  var CSS = ''
  + '.sl-w{max-width:560px;margin:0 auto;padding:16px 16px 0}'
  + '.sl{--r:var(--red,#ff0000);--rg:var(--red-rgb,255,0,0);position:relative;overflow:hidden;font-family:var(--nfont,inherit);border-radius:18px;padding:17px;background:#050000;border:1px solid rgba(var(--rg),.17);box-shadow:0 0 40px rgba(var(--rg),.07);color:#f3f3f4}'
  + '.sl-top{display:flex;align-items:center;gap:18px}'
  + '.sl-ico{flex:none;width:58px;height:58px;border-radius:18px;display:grid;place-items:center;background:rgba(var(--rg),.14);box-shadow:0 0 26px rgba(var(--rg),.17)}'
  + '.sl-ico svg{width:30px;height:30px;color:var(--r)}'
  + '.sl-body{min-width:0;flex:1}'
  + '.sl-pill{display:inline-flex;align-items:center;gap:9px;height:26px;padding:0 12px 0 10px;border-radius:999px;background:#240505;border:1px solid #480f0d;color:var(--r);font:500 10px/1 var(--nfont,inherit);letter-spacing:.06em;text-transform:uppercase}'
  + '.sl-pill i{width:6px;height:6px;border-radius:50%;background:#94170f;transition:background .6s,box-shadow .6s}'
  + '.sl[data-s=running] .sl-pill i{background:#2fd16b;box-shadow:0 0 8px #2fd16b}'
  + '.sl-main{transition:opacity .5s ease,filter .5s ease,transform .5s ease}'
  + '.sl-main.out,.sl-pill.out{opacity:0;filter:blur(10px);transform:translateY(4px)}'
  + '.sl-pill{transition:opacity .5s ease,filter .5s ease,transform .5s ease}'
  + '.sl-t{margin:8px 0;font:700 20px/26px var(--nfont,inherit)}'
  + '.sl-d{margin:0;font-size:12px;line-height:1.4;color:#6f6f6f}'
  /* นับถอยหลัง */
  + '.sl-cd{display:flex;align-items:flex-start;gap:6px;margin:8px 0 6px}'
  + '.sl-u{min-width:46px;text-align:center;padding:6px 4px 5px;border-radius:10px;background:rgba(var(--rg),.09);border:1px solid rgba(var(--rg),.16)}'
  + '.sl-u b{display:block;font:700 22px/26px var(--nfont,inherit);font-variant-numeric:tabular-nums;letter-spacing:.01em}'
  + '.sl-u small{display:block;margin-top:1px;font-size:9.5px;line-height:1.2;color:#8a8a8a}'
  + '.sl[data-s=expired] .sl-t{color:var(--r)}'
  /* ปุ่ม: กว้างครึ่งการ์ด ชิดซ้าย · หายแบบเบลอเมื่อเปิดขายแล้ว */
  + '.sl-act{display:grid;grid-template-rows:1fr;margin-top:18px;transition:grid-template-rows .6s ease,margin-top .6s ease}'
  + '.sl-act>div{overflow:hidden;min-height:0}'
  + '.sl-act.off{grid-template-rows:0fr;margin-top:0}'
  + '.sl-btn{display:flex;align-items:center;justify-content:center;gap:9px;width:calc(50% - 6px);min-width:150px;height:46.5px;border:0;border-radius:12px;background:var(--r);color:#fff;font:600 15px var(--nfont,inherit);cursor:pointer;box-shadow:0 3px 12px rgba(var(--rg),.35);transition:opacity .55s ease,filter .55s ease,transform .25s ease}'
  + '.sl-btn:active{transform:scale(.97);filter:brightness(.94)}'
  + '.sl-btn svg{width:16px;height:16px;flex:none}'
  + '.sl-btn[disabled]{cursor:default;opacity:.7}'
  + '.sl-btn.arm{background:#fff;color:#c40000;box-shadow:0 6px 24px rgba(255,255,255,.18)}'
  + '.sl-btn.out{opacity:0;filter:blur(12px);pointer-events:none;transform:scale(.96)}'
  + '.sl-err{min-height:0;margin:10px 0 0;font-size:12px;color:#ff6b6b;opacity:0;transition:opacity .3s}'
  + '.sl-err.on{opacity:1}'
  + '@media (max-width:360px){.sl-u{min-width:40px}.sl-u b{font-size:19px}.sl-cd{gap:4px}}'
  + '@media (prefers-reduced-motion:reduce){.sl *,.sl{transition:none!important}}';

  var ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v9"/><path d="M6.4 6.8a8.5 8.5 0 1 0 11.2 0"/></svg>';
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/></svg>';

  var root, elPill, elMain, elAct, elBtn, elErr, ticker = null, poll = null, errT = null, armT = null;
  var S = null;          /* สถานะล่าสุดจากเซิร์ฟเวอร์ */
  var cur = null;        /* state ที่แสดงอยู่ */
  var off = 0;           /* เวลาเซิร์ฟเวอร์ - เวลาเครื่อง (กันเครื่องตั้งเวลาผิด) */
  var armed = false, busy = false, swapping = false;

  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(d) { d = new Date(d); return p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()); }
  function remain() { return S && S.ends_at ? new Date(S.ends_at).getTime() - (Date.now() + off) : 0; }

  function build(mount) {
    if (!document.getElementById('sl-css')) {
      var st = document.createElement('style'); st.id = 'sl-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    mount.innerHTML = '<section class="sl" data-s="idle">'
      + '<div class="sl-top"><div class="sl-ico">' + ICON_CLOCK + '</div>'
      + '<div class="sl-body"><span class="sl-pill"><i></i><span class="sl-pt">Website Status: Active</span></span><div class="sl-main"></div></div></div>'
      + '<div class="sl-act"><div><button class="sl-btn" type="button"></button><p class="sl-err" role="alert"></p></div></div>'
      + '</section>';
    root = mount.firstChild;
    elPill = root.querySelector('.sl-pill'); elMain = root.querySelector('.sl-main');
    elAct = root.querySelector('.sl-act'); elBtn = root.querySelector('.sl-btn'); elErr = root.querySelector('.sl-err');
    elBtn.addEventListener('click', onBtn);
  }

  /* ----- เนื้อหาของแต่ละสถานะ ----- */
  function mainHTML(s) {
    if (s === 'running') {
      return '<div class="sl-cd" aria-live="off">'
        + '<div class="sl-u"><b data-k="d">--</b><small>ວັນ</small></div>'
        + '<div class="sl-u"><b data-k="h">--</b><small>ຊົ່ວໂມງ</small></div>'
        + '<div class="sl-u"><b data-k="m">--</b><small>ນາທີ</small></div>'
        + '<div class="sl-u"><b data-k="s">--</b><small>ວິນາທີ</small></div></div>'
        + '<p class="sl-d">ເປີດຂາຍແລ້ວ · ໝົດອາຍຸ ' + fmt(S.ends_at) + '</p>';
    }
    if (s === 'expired') {
      return '<h2 class="sl-t">ໝົດເວລາເປີດຂາຍແລ້ວ</h2><p class="sl-d">ລູກຄ້າຊື້ ແລະ ເຕີມເງິນບໍ່ໄດ້ · ຕິດຕໍ່ເພື່ອເຊົ່າເວັບຕໍ່</p>';
    }
    return '<h2 class="sl-t">ຍັງບໍ່ນັບ</h2><p class="sl-d">ຍັງບໍ່ໄດ້ເລີ່ມນັບເວລາແພັກເກັດຮ້ານ</p>';
  }
  function setBtn(s) {
    armed = false; clearTimeout(armT);
    elBtn.classList.remove('arm'); elBtn.disabled = false;
    elBtn.innerHTML = s === 'expired' ? ICON_CHAT + '<span>ຕິດຕໍ່</span>' : ICON_PLAY + '<span>ເປີດຂາຍ</span>';
  }
  function setPill(s) { root.querySelector('.sl-pt').textContent = s === 'expired' ? 'Website Status: Expired' : 'Website Status: Active'; }

  /* วาดสถานะ — animate=true: ของเดิมเบลอจางหาย แล้วของใหม่ค่อยๆ โผล่ */
  function render(s, animate) {
    if (!animate || cur === null) {
      root.dataset.s = s; elMain.innerHTML = mainHTML(s); setBtn(s); setPill(s);
      elAct.classList.toggle('off', s === 'running');
      cur = s; startTick(); return;
    }
    if (swapping) { setTimeout(function () { render(s, true); }, 300); return; }
    swapping = true;
    elMain.classList.add('out'); elPill.classList.add('out');
    if (s === 'running') { elBtn.classList.add('out'); }          /* เปิดขาย: ปุ่มเบลอจางหาย แล้วพื้นที่ปุ่มหุบเก็บ */
    else if (cur === 'running') { elAct.classList.remove('off'); elBtn.classList.add('out'); }
    else { elBtn.classList.add('out'); }
    setTimeout(function () {
      root.dataset.s = s; elMain.innerHTML = mainHTML(s); setPill(s); setBtn(s); cur = s;
      if (s === 'running') { elAct.classList.add('off'); }
      else { elBtn.classList.add('out'); elAct.classList.remove('off'); }
      startTick();
      void root.offsetWidth;
      requestAnimationFrame(function () {
        elMain.classList.remove('out'); elPill.classList.remove('out');
        if (s !== 'running') elBtn.classList.remove('out');
        setTimeout(function () { swapping = false; }, 520);
      });
    }, 520);
  }

  /* ----- นับถอยหลัง ----- */
  function tick() {
    if (cur !== 'running') return;
    var ms = remain();
    if (ms <= 0) { stopTick(); load(true); return; }
    var t = Math.floor(ms / 1000), d = Math.floor(t / 86400), h = Math.floor(t % 86400 / 3600), m = Math.floor(t % 3600 / 60), s = t % 60;
    var v = { d: String(d), h: p2(h), m: p2(m), s: p2(s) };
    Object.keys(v).forEach(function (k) { var n = elMain.querySelector('[data-k=' + k + ']'); if (n && n.textContent !== v[k]) n.textContent = v[k]; });
  }
  function startTick() { stopTick(); if (cur === 'running') { tick(); ticker = setInterval(tick, 1000); } }
  function stopTick() { if (ticker) { clearInterval(ticker); ticker = null; } }

  /* ----- โหลดสถานะจากเซิร์ฟเวอร์ ----- */
  function load(animate) {
    return rpc('shop_sale_status', {}).then(function (j) {
      if (!j || !j.ok) return;
      S = j; off = new Date(j.now).getTime() - Date.now();
      if (j.state === 'running' && remain() <= 0) { setTimeout(function () { load(true); }, 1500); return; } /* นาฬิกาเหลื่อมนิดหน่อย */
      if (j.state !== cur) render(j.state, animate !== false && cur !== null);
      else if (cur === 'running') { elMain.querySelector('.sl-d').textContent = 'ເປີດຂາຍແລ້ວ · ໝົດອາຍຸ ' + fmt(S.ends_at); }
    }).catch(function () {});
  }

  function err(msg) {
    elErr.textContent = msg; elErr.classList.add('on');
    clearTimeout(errT); errT = setTimeout(function () { elErr.classList.remove('on'); }, 4000);
  }

  /* ----- ปุ่ม ----- */
  function onBtn() {
    if (busy || swapping) return;
    if (cur === 'expired') { return contact(); }
    if (cur !== 'idle') return;
    if (!armed) {                                   /* แตะครั้งแรก = ขอให้ยืนยัน (กันกดพลาด เพราะเปิดแล้วเริ่มนับ 30 วันทันที ย้อนไม่ได้) */
      armed = true; elBtn.classList.add('arm'); elBtn.innerHTML = '<span>ແຕະອີກຄັ້ງເພື່ອຢືນຢັນ</span>';
      clearTimeout(armT); armT = setTimeout(function () { if (cur === 'idle') setBtn('idle'); }, 4000);
      return;
    }
    clearTimeout(armT); busy = true; elBtn.disabled = true;
    rpc('adm_sale_open', { p_token: tok() }).then(function (j) {
      busy = false;
      if (j && j.ok) { S = j; off = new Date(j.now).getTime() - Date.now(); render('running', true); return; }
      setBtn('idle');
      var c = j && j.code;
      if (c === 'already') { load(true); return; }
      err(c === 'not_admin' ? 'ບັນຊີນີ້ບໍ່ແມ່ນແອດມິນ' : 'ເຮັດບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່');
    }).catch(function () { busy = false; setBtn('idle'); err('ເຊື່ອມຕໍ່ເຊີບເວີບໍ່ໄດ້ ກະລຸນາລອງໃໝ່'); });
  }
  function contact() {
    var u = (S && S.contact_url) || CONTACT_FALLBACK;
    if (!u) { err('ຍັງບໍ່ໄດ້ຕັ້ງຊ່ອງທາງຕິດຕໍ່ ກະລຸນາຕິດຕໍ່ຜູ້ໃຫ້ເຊົ່າເວັບໂດຍກົງ'); return; }
    if (/^https?:\/\//i.test(u)) window.open(u, '_blank', 'noopener'); else location.href = u;
  }

  function init() {
    var mount = document.getElementById('saleMount');
    if (!mount) {
      var hd = document.getElementById('hdr'); if (!hd) return;
      mount = document.createElement('div'); mount.id = 'saleMount'; mount.className = 'sl-w';
      hd.insertAdjacentElement('afterend', mount);
    }
    build(mount);
    load(false);
    poll = setInterval(function () { load(true); }, 60000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) load(true); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
