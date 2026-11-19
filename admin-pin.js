/* ===== admin-pin.js (v2) — ด่าน PIN ก่อนเข้าแผงจัดการ · ตรวจที่ฝั่ง Supabase =====
   วิธีใช้: ใส่แท็ก script ที่ src="admin-pin.js" ใน head ของ admin.html (ต่อจาก script ตั้งธีม)
   - PIN 6 หลัก เก็บเป็น bcrypt ใน Supabase (ตาราง admin_pin) หน้าเว็บไม่มีรหัส/แฮชอยู่เลย
   - ตรวจผ่านฟังก์ชัน adm_pin_status / adm_pin_verify / adm_pin_set / adm_pin_lock (ดู admin-pin-setup.sql)
   - ครั้งแรกที่ยังไม่มี PIN: ระบบให้ตั้งรหัสเอง (ใส่ 2 รอบ) · ปลดล็อกแล้วอยู่ 30 นาที แล้วล็อกกลับอัตโนมัติ
   - ใส่ผิดครบ 5 ครั้ง ถูกพัก 30 วินาที แล้วเพิ่มเป็นสองเท่าทุกครั้ง (สูงสุด 1 ชั่วโมง) นับที่เซิร์ฟเวอร์
   - ล็อกทันที: เรียก exAdminPinLock() ได้จากปุ่มไหนก็ได้ */
(function () {
  'use strict';
  var SB = { url: 'https://mjalctpfeizjukuprqti.supabase.co', key: 'sb_publishable_3EZ-Ulah6h9Xzze_DE0xow_E6iGHNiJ' };
  var LEN = 6, HOME = 'index.html';
  var root = document.documentElement;

  function tok() { try { return localStorage.getItem('exSession') || sessionStorage.getItem('exSession') || ''; } catch (e) { return ''; } }
  if (!tok()) return; /* ยังไม่ล็อกอิน → ให้ระบบเดิมของหน้าพาไปหน้าเข้าสู่ระบบ */

  function rpc(fn, body) {
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 15000);
    return fetch(SB.url + '/rest/v1/rpc/' + fn, {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', apikey: SB.key, Authorization: 'Bearer ' + SB.key },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (j) { if (!r.ok) throw new Error('http ' + r.status); return j; });
    }).finally(function () { clearTimeout(t); });
  }
  window.exAdminPinLock = function () { rpc('adm_pin_lock', { p_token: tok() }).then(function () { location.reload(); }, function () { location.reload(); }); };

  var css = [
    'html.pinlock{overflow:hidden}',
    'html.pinlock body{visibility:hidden!important}',
    '@property --pl-a{syntax:"<angle>";initial-value:0deg;inherits:false}',
    '#plRoot{position:fixed;inset:0;z-index:2147483000;visibility:visible;display:grid;place-items:center;background:#000;color:#f3f3f4;',
      'font-family:"Outfit","Noto Sans Lao Looped",system-ui,sans-serif;padding:env(safe-area-inset-top,0px) 16px env(safe-area-inset-bottom,0px);overflow:hidden;touch-action:manipulation;transition:opacity .6s}',
    '#plRoot *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0}',
    '#plRoot button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}',
    '#plRoot.out{opacity:0;pointer-events:none}',

    /* การ์ดดำ + ขอบแสงแดงหมุน */
    '.pl-card{position:relative;width:min(360px,100%);border-radius:34px;padding:30px 22px 22px;background:linear-gradient(165deg,#161616,#090909);border:1px solid rgba(255,255,255,.08);',
      'box-shadow:0 30px 80px rgba(0,0,0,.9),0 0 70px rgba(255,0,0,.10),inset 0 1px 0 rgba(255,255,255,.1);animation:pl-in .9s cubic-bezier(.2,.9,.3,1) both;transition:transform .6s cubic-bezier(.3,1.1,.4,1)}',
    '.pl-card::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1.5px;pointer-events:none;',
      'background:conic-gradient(from var(--pl-a),transparent 0 68%,rgba(255,60,60,.95) 84%,transparent);',
      '-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:pl-spin 5s linear infinite}',
    '@keyframes pl-spin{to{--pl-a:360deg}}',
    '@keyframes pl-in{from{opacity:0;transform:translateY(40px) scale(.93)}}',
    '.pl-card.shake{animation:pl-shake .5s}',
    '@keyframes pl-shake{20%,60%{transform:translateX(-12px)}40%,80%{transform:translateX(12px)}}',

    '.pl-views{display:grid}',
    '.pl-v{grid-area:1/1;display:flex;flex-direction:column;align-items:center;text-align:center;transition:opacity .45s,transform .55s cubic-bezier(.2,1,.3,1),filter .45s,visibility 0s}',
    '.pl-gate{justify-content:center}',
    '.pl-card[data-v="gate"] .pl-pad,.pl-card[data-v="pad"] .pl-gate{opacity:0;visibility:hidden;pointer-events:none;transition-delay:0s,0s,0s,.45s}',
    '.pl-card[data-v="gate"] .pl-pad{transform:translateY(26px) scale(.96);filter:blur(6px)}',
    '.pl-card[data-v="pad"] .pl-gate{transform:translateY(-22px) scale(.94);filter:blur(6px)}',

    /* โลโก้ร้าน (วงกลม เหมือนมุมซ้ายแถบหัวเว็บ) */
    '.pl-logo{position:relative;flex:none;border-radius:50%;overflow:hidden;display:grid;place-items:center;font-weight:800;color:#fff;letter-spacing:.5px;text-transform:uppercase;',
      'background:linear-gradient(150deg,#ff6b6b,#d40000);box-shadow:0 0 0 3px rgba(255,255,255,.06),0 14px 44px rgba(255,0,0,.45)}',
    '.pl-logo img{width:100%;height:100%;object-fit:cover;display:block}',
    '.pl-logo.has-img{background:#111}',
    '.pl-big{width:108px;height:108px;font-size:36px}',
    '.pl-big-w{position:relative;margin-bottom:26px;animation:pl-float 3.2s ease-in-out infinite}',
    '.pl-big-w::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid rgba(255,60,60,.7);animation:pl-ping 2.6s ease-out infinite}',
    '@keyframes pl-float{50%{transform:translateY(-7px)}}',
    '@keyframes pl-ping{from{transform:scale(1);opacity:.85}to{transform:scale(1.55);opacity:0}}',
    '.pl-t{font-size:23px;font-weight:700;letter-spacing:.2px}',
    '.pl-s{font-size:14px;color:#9a9aa3;line-height:1.55;margin:6px 0 16px;min-height:44px}',
    '.pl-s.err{color:#ff5a5a}',
    '.pl-chips{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:22px}',
    '.pl-chips span{font-size:11.5px;font-weight:600;letter-spacing:.6px;padding:5px 11px;border-radius:999px;color:#ff6b6b;background:rgba(255,0,0,.1);border:1px solid rgba(255,0,0,.28);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.pl-go{position:relative;overflow:hidden;width:100%;height:54px;border-radius:18px;color:#fff!important;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:9px;',
      'background:linear-gradient(180deg,#ff4d4d,#e60000)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -1px 0 rgba(0,0,0,.2),0 10px 26px rgba(255,0,0,.45);transition:transform .35s cubic-bezier(.3,1.5,.5,1),opacity .3s}',
    '.pl-go:active{transform:scale(.95)}.pl-go[disabled]{opacity:.55;pointer-events:none}',
    '.pl-go svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
    '.pl-go::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.5) 50%,transparent 70%);transform:translateX(-120%);animation:pl-shine 3.2s infinite}',
    '@keyframes pl-shine{to{transform:translateX(120%)}}',
    '.pl-spin{width:18px;height:18px;border-radius:50%;border:2.5px solid rgba(255,255,255,.35);border-top-color:#fff;animation:pl-r .7s linear infinite}',
    '@keyframes pl-r{to{transform:rotate(360deg)}}',

    /* แป้นใส่รหัส */
    '.pl-mark{position:relative;margin-bottom:16px}',
    '.pl-sm{width:64px;height:64px;font-size:22px}',
    '.pl-chip{position:absolute;right:-5px;bottom:-5px;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:#fff;background:#e60000;border:3px solid #0d0d0d;transition:background .4s}',
    '.pl-chip svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}',
    '.pl-sh{transform-box:fill-box;transform-origin:100% 100%;transition:transform .55s cubic-bezier(.3,1.7,.5,1)}',
    '.pl-card.ok .pl-sh{transform:translateY(-3px) rotate(-30deg)}',
    '.pl-card.ok .pl-chip{background:#22c55e}',
    '.pl-hint{font-size:13px;color:#9a9aa3;margin:5px 0 16px;min-height:20px;transition:color .2s}',
    '.pl-hint.err{color:#ff5a5a}.pl-card.ok .pl-hint{color:#22c55e}',
    '.pl-dots{display:inline-flex;gap:13px;padding:13px 22px;border-radius:999px;margin-bottom:22px;background:#000;border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 2px 6px rgba(0,0,0,.6)}',
    '.pl-d{width:13px;height:13px;border-radius:50%;border:2px solid rgba(255,255,255,.3);transition:all .28s cubic-bezier(.3,1.7,.5,1)}',
    '.pl-d.on{background:#ff2a2a;border-color:#ff2a2a;transform:scale(1.28);box-shadow:0 0 14px #f00}',
    '.pl-dots.bad .pl-d{background:#ff2a2a;border-color:#ff2a2a}',
    '.pl-dots.good .pl-d{background:#22c55e;border-color:#22c55e;box-shadow:0 0 14px #22c55e;animation:pl-hop .5s both}',
    '.pl-dots.good .pl-d:nth-child(2){animation-delay:.06s}.pl-dots.good .pl-d:nth-child(3){animation-delay:.12s}.pl-dots.good .pl-d:nth-child(4){animation-delay:.18s}.pl-dots.good .pl-d:nth-child(5){animation-delay:.24s}.pl-dots.good .pl-d:nth-child(6){animation-delay:.3s}',
    '@keyframes pl-hop{40%{transform:translateY(-9px) scale(1.45)}}',
    '.pl-keys{display:grid;grid-template-columns:repeat(3,minmax(0,72px));gap:14px 18px;justify-content:center;width:100%}',
    '.pl-keys.dis{opacity:.35;pointer-events:none}',
    '.pl-k{width:100%;max-width:72px;aspect-ratio:1;justify-self:center;border-radius:50%;display:grid;place-items:center;font-size:29px;font-weight:400;',
      'background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.14);transition:transform .25s cubic-bezier(.3,1.6,.5,1),background .2s,box-shadow .2s}',
    '.pl-k:active{transform:scale(.87);background:linear-gradient(180deg,#ff4d4d,#e60000);border-color:transparent;box-shadow:0 0 28px rgba(255,0,0,.7)}',
    '.pl-k.g{background:transparent;border-color:transparent;box-shadow:none;font-size:14px;color:#9a9aa3}',
    '.pl-k.g:active{background:rgba(255,255,255,.1);box-shadow:none;color:#fff}',
    '.pl-k svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}',
    '.pl-card[data-v="pad"] .pl-k{animation:pl-pop .5s cubic-bezier(.3,1.5,.5,1) backwards;animation-delay:calc(.14s + var(--i)*.035s)}',
    '@keyframes pl-pop{from{opacity:0;transform:scale(.5)}}',
    '.pl-back{margin-top:18px;font-size:13px;color:#9a9aa3!important}',
    '.pl-burst{position:absolute;left:50%;top:36%;width:100px;height:100px;margin:-50px;border-radius:50%;border:2px solid #22c55e;opacity:0;pointer-events:none}',
    '.pl-card.ok .pl-burst{animation:pl-burst .95s ease-out}',
    '@keyframes pl-burst{from{transform:scale(.3);opacity:.9}to{transform:scale(7);opacity:0}}',
    '.pl-card.ok{transform:scale(1.04)}',
    '@media (prefers-reduced-motion:reduce){#plRoot *,#plRoot *::before{animation-duration:.01s!important;animation-iteration-count:1!important}}'
  ].join('');

  var LOCK_SVG = '<svg viewBox="0 0 24 24"><g class="pl-sh"><path d="M8 11V8a4 4 0 0 1 8 0v3"/></g><rect x="4" y="11" width="16" height="10" rx="3"/></svg>';
  var DEL_SVG = '<svg viewBox="0 0 24 24"><path d="M21 5H9l-6 7 6 7h12z"/><path d="m15 9-4 6m0-6 4 6"/></svg>';
  var SHIELD_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>';
  var styleOn = false, el, card, hint, dotsEl, keysEl, goBtn, subEl, titleEl, dotList;
  var mode = 'loading', val = '', first = '', busy = false, cdTimer = null, cdEnd = 0, relockT = null, unlockEnd = 0;

  function site() { try { return JSON.parse(localStorage.getItem('exSiteCache') || 'null') || {}; } catch (e) { return {}; } }
  function paintLogo(s) {
    s = s || site();
    var nm = String(s.name || 'EXSHOP'), url = String(s.logo || '').replace(/#sz=\d+$/, '');
    [].forEach.call(el.querySelectorAll('.pl-logo'), function (L) {
      L.textContent = ''; L.classList.remove('has-img');
      if (url) {
        var im = new Image(); im.alt = ''; im.draggable = false;
        im.onerror = function () { L.classList.remove('has-img'); L.textContent = nm.slice(0, 2); };
        im.src = url; L.classList.add('has-img'); L.appendChild(im);
      } else L.textContent = nm.slice(0, 2);
    });
    var c = el.querySelector('#plName'); if (c) c.textContent = nm;
  }
  function refreshSite() {
    rpc('shop_site', {}).then(function (j) { if (j && el && el.parentNode) paintLogo(j); }, function () {});
  }

  function mount() {
    if (!styleOn) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); styleOn = true; }
    root.classList.add('pinlock');
    var dots = ''; for (var d = 0; d < LEN; d++) dots += '<i class="pl-d"></i>';
    el = document.createElement('div'); el.id = 'plRoot';
    el.innerHTML =
      '<div class="pl-card" data-v="gate"><div class="pl-burst"></div><div class="pl-views">' +
        '<div class="pl-v pl-gate">' +
          '<div class="pl-big-w"><div class="pl-logo pl-big"></div></div>' +
          '<div class="pl-t">ແຜງຈັດການຮ້ານ</div>' +
          '<div class="pl-s" data-sub></div>' +
          '<div class="pl-chips"><span id="plName">EXSHOP</span><span>ADMIN ONLY</span></div>' +
          '<button class="pl-go" data-go type="button"></button>' +
        '</div>' +
        '<div class="pl-v pl-pad">' +
          '<div class="pl-mark"><div class="pl-logo pl-sm"></div><div class="pl-chip">' + LOCK_SVG + '</div></div>' +
          '<div class="pl-t" data-title></div>' +
          '<div class="pl-hint" data-hint></div>' +
          '<div class="pl-dots" data-dots>' + dots + '</div>' +
          '<div class="pl-keys" data-keys></div>' +
          '<button class="pl-back" data-back type="button">← ກັບໜ້າຮ້ານ</button>' +
        '</div>' +
      '</div></div>';
    root.appendChild(el);
    card = el.querySelector('.pl-card'); hint = el.querySelector('[data-hint]'); dotsEl = el.querySelector('[data-dots]');
    keysEl = el.querySelector('[data-keys]'); goBtn = el.querySelector('[data-go]'); subEl = el.querySelector('[data-sub]'); titleEl = el.querySelector('[data-title]');
    dotList = [].slice.call(dotsEl.children);
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'c', '0', 'x'].forEach(function (k, n) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pl-k'; b.style.setProperty('--i', n);
      if (k === 'x') b.innerHTML = DEL_SVG; else if (k === 'c') { b.textContent = 'ລ້າງ'; b.classList.add('g'); } else b.textContent = k;
      b.addEventListener('click', function () { press(k); });
      keysEl.appendChild(b);
    });
    goBtn.addEventListener('click', onGo);
    el.querySelector('[data-back]').addEventListener('click', function () { location.href = HOME; });
    paintLogo(); refreshSite();
    setMode('loading');
  }
  function unmount() { if (el && el.parentNode) el.parentNode.removeChild(el); el = null; }

  function say(t, err) { if (hint) { hint.textContent = t; hint.classList.toggle('err', !!err); } }
  function sub(t, err) { if (subEl) { subEl.innerHTML = t; subEl.classList.toggle('err', !!err); } }
  function render() { dotList.forEach(function (x, n) { x.classList.toggle('on', n < val.length); }); }
  function resetPad() { val = ''; busy = false; render(); dotsEl.className = 'pl-dots'; }
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return (m ? m + ':' + ('0' + r).slice(-2) : r + ' ວິນາທີ'); }

  /* โหมด: loading | offline | verify | setup1 | setup2 */
  function setMode(m) {
    mode = m;
    if (m === 'loading') { sub('ກຳລັງກວດສອບສິດ...'); goBtn.disabled = true; goBtn.innerHTML = '<span class="pl-spin"></span>ກຳລັງກວດ'; }
    else if (m === 'offline') { sub('ເຊື່ອມຕໍ່ເຊີບເວີບໍ່ໄດ້<br>ກວດອິນເຕີເນັດແລ້ວລອງໃໝ່', true); goBtn.disabled = false; goBtn.innerHTML = SHIELD_SVG + 'ລອງໃໝ່'; }
    else if (m === 'verify') { sub('ສະເພາະແອດມິນເທົ່ານັ້ນ<br>ຕ້ອງໃສ່ລະຫັດ PIN ກ່ອນເຂົ້າ'); goBtn.disabled = false; goBtn.innerHTML = SHIELD_SVG + 'ເຂົ້າສູ່ແຜງຈັດການ'; titleEl.textContent = 'ໃສ່ລະຫັດ PIN'; say('ກະລຸນາໃສ່ລະຫັດ ' + LEN + ' ຫຼັກ'); }
    else if (m === 'setup1') { sub('ຍັງບໍ່ມີລະຫັດ PIN<br>ຕັ້ງລະຫັດ ' + LEN + ' ຫຼັກເພື່ອປົກປ້ອງແຜງ'); goBtn.disabled = false; goBtn.innerHTML = SHIELD_SVG + 'ຕັ້ງລະຫັດ PIN'; titleEl.textContent = 'ຕັ້ງລະຫັດ PIN ໃໝ່'; say('ໃສ່ລະຫັດ ' + LEN + ' ຫຼັກທີ່ຈື່ງ່າຍ'); }
    else if (m === 'setup2') { titleEl.textContent = 'ຢືນຢັນລະຫັດ'; say('ໃສ່ລະຫັດເດີມອີກຄັ້ງ'); }
  }
  function onGo() {
    if (mode === 'offline') { setMode('loading'); check(); return; }
    if (mode === 'verify' || mode === 'setup1') { resetPad(); card.dataset.v = 'pad'; if (cdEnd > Date.now()) startCd(); }
  }

  function startCd() {
    clearInterval(cdTimer);
    function tick() {
      var s = Math.ceil((cdEnd - Date.now()) / 1000);
      if (s > 0) { keysEl.classList.add('dis'); say('ລອງຜິດຫຼາຍເກີນໄປ ລໍຖ້າ ' + fmt(s), true); return; }
      clearInterval(cdTimer); cdTimer = null; keysEl.classList.remove('dis'); say('ກະລຸນາໃສ່ລະຫັດ ' + LEN + ' ຫຼັກ');
    }
    tick(); cdTimer = setInterval(tick, 500);
  }

  function press(k) {
    if (busy || (cdEnd > Date.now() && mode === 'verify')) return;
    if (k === 'c') val = ''; else if (k === 'x') val = val.slice(0, -1); else if (val.length < LEN) val += k;
    render();
    if (val.length === LEN) { busy = true; setTimeout(submit, 220); }
  }
  function bad(msg, back) {
    dotsEl.classList.add('bad'); card.classList.add('shake'); say(msg, true);
    if (navigator.vibrate) navigator.vibrate(160);
    setTimeout(function () { card.classList.remove('shake'); resetPad(); if (back) setMode(back), say(msg, true); if (cdEnd > Date.now() && mode === 'verify') startCd(); }, 600);
  }
  function lockMsg(r) {
    cdEnd = Date.now() + (r.retry_sec || 30) * 1000;
  }
  function netFail() { busy = false; resetPad(); say('ເຊື່ອມຕໍ່ບໍ່ໄດ້ ລອງໃໝ່ອີກຄັ້ງ', true); }

  function submit() {
    if (mode === 'verify') {
      rpc('adm_pin_verify', { p_token: tok(), p_pin: val }).then(function (r) {
        if (r && r.ok) return pass(r.unlock_sec);
        if (r && r.code === 'not_admin') return location.reload();
        if (r && (r.code === 'locked' || (r.code === 'bad_pin' && r.retry_sec > 0))) { lockMsg(r); return bad('ລອງຜິດຫຼາຍເກີນໄປ'); }
        if (r && r.code === 'no_pin') return check();
        bad('ລະຫັດບໍ່ຖືກຕ້ອງ (ເຫຼືອ ' + ((r && r.left) || 0) + ' ຄັ້ງ)');
      }, netFail);
    } else if (mode === 'setup1') {
      first = val; resetPad(); setMode('setup2');
    } else if (mode === 'setup2') {
      if (val !== first) { first = ''; return bad('ລະຫັດບໍ່ຕົງກັນ ເລີ່ມໃໝ່', 'setup1'); }
      rpc('adm_pin_set', { p_token: tok(), p_new: val }).then(function (r) {
        if (r && r.ok) return pass(r.unlock_sec);
        if (r && (r.code === 'not_admin' || r.code === 'exists')) return location.reload();
        first = '';
        bad(r && r.code === 'weak_pin' ? 'ລະຫັດງ່າຍເກີນໄປ (ເຊັ່ນ 123456 ຫຼື 111111)' : 'ຕັ້ງລະຫັດບໍ່ສຳເລັດ', 'setup1');
      }, netFail);
    }
  }

  function pass(sec) {
    dotsEl.classList.add('good'); card.classList.add('ok'); say('ປົດລັອກສຳເລັດ');
    setTimeout(function () { release(sec, true); }, 1050);
  }
  function release(sec, anim) {
    var e = el; unlockEnd = Date.now() + (sec || 1800) * 1000;
    root.classList.remove('pinlock'); document.removeEventListener('keydown', onKey);
    if (e) { e.classList.add('out'); setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, anim ? 700 : 400); }
    if (el === e) el = null;
    clearTimeout(relockT); relockT = setTimeout(relock, Math.max(5, (sec || 1800) - 3) * 1000);
  }
  function relock() { if (el) return; start(); }

  /* สวิตช์: localStorage 'exPinMode' = 'once' → ใส่ครั้งเดียวต่อ 30 นาที · ค่าอื่น/ไม่มี = ใส่ทุกครั้งที่เข้า (ค่าเริ่มต้น) */
  var fresh = true;
  function every() { try { return localStorage.getItem('exPinMode') !== 'once'; } catch (e) { return true; } }
  function check() {
    rpc('adm_pin_status', { p_token: tok() }).then(function (s) {
      if (!s || !s.ok) { release(1800, false); return; } /* ไม่ใช่แอดมิน/เซสชันหมด → ให้ระบบเดิมของหน้าจัดการต่อ */
      if (s.unlocked) {
        /* โหมด "ใส่ทุกครั้งที่เข้า": เปิดหน้าใหม่ครั้งแรกให้ล็อกก่อน แล้วตรวจใหม่ → ต้องใส่ PIN ทุกครั้ง */
        if (fresh && every()) { fresh = false; rpc('adm_pin_lock', { p_token: tok() }).then(check, function () { setMode('offline'); }); return; }
        fresh = false; return release(s.unlock_sec, false);
      }
      fresh = false;
      cdEnd = s.locked_sec > 0 ? Date.now() + s.locked_sec * 1000 : 0;
      setMode(s.has_pin ? 'verify' : 'setup1');
    }, function () { setMode('offline'); });
  }
  function start() { mount(); document.addEventListener('keydown', onKey); check(); }

  function onKey(e) {
    if (!el || card.classList.contains('ok')) return;
    if (card.dataset.v === 'gate') { if (e.key === 'Enter' && !goBtn.disabled) onGo(); return; }
    if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('x'); else if (e.key === 'Escape') card.dataset.v = 'gate';
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && !el && unlockEnd && Date.now() > unlockEnd - 3000) start();
  });

  start();
})();
