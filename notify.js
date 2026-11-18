/* ===== notify.js — ป้ายแจ้งเตือนเด้งเลื่อนขึ้นจากด้านล่าง (ใช้ทุกหน้า): ธีมสว่าง = ขาวมินิ, ธีมมืด/แอดมิน = ดำแดงสไตล์ร้าน =====
   - ดักป้ายเดิมของทุกหน้า (#snack / #toast / #atoast / #pfToast) ที่ถูกสั่ง .show แล้วแสดงป้ายใหม่แทน (ป้ายเดิมถูกซ่อน)
     → ไม่ต้องแก้ฟังก์ชัน toast/snack เดิมในแต่ละหน้า เพิ่มแค่ <script src="notify.js"> ท้ายหน้า
   - เรียกใช้เองได้: exToast('หัวข้อ', { sub:'ข้อความรอง', kind:'success|error|warn|info' })  หรือ  exToast('หัวข้อ\nข้อความรอง')
   - ชนิดไอคอนเดาจากข้อความ (หรือจาก data-kind / data-k ของป้ายเดิม) */
(function(){
  if(window.exToast) return;

  var css = ''
  + '#snack,#toast,#atoast,#pfToast{display:none!important}'
  + '.exn{box-sizing:border-box;position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);width:min(calc(100% - 28px),var(--exn-w,460px));z-index:2147483000;'
  +   'display:none;align-items:center;gap:var(--exn-gap);padding:var(--exn-py) var(--exn-px);border-radius:var(--exn-r);background:var(--exn-surf);color:var(--exn-tc);border:var(--exn-bd);'
  +   'box-shadow:var(--exn-sh);cursor:pointer;-webkit-tap-highlight-color:transparent;'
  +   'transform:translate(-50%,0);will-change:transform,opacity}'
  + '.exn.on{display:flex}'
  + '.exn.in{animation:exnIn .65s cubic-bezier(.2,1.2,.35,1) both}'
  + '.exn.out{animation:exnOut .4s cubic-bezier(.55,0,.8,.4) both;pointer-events:none}'
  + '@keyframes exnIn{0%{opacity:0;transform:translate(-50%,170%) scale(.92)}45%{opacity:1}62%{transform:translate(-50%,-12px) scale(1.01)}82%{transform:translate(-50%,3px) scale(1)}100%{opacity:1;transform:translate(-50%,0) scale(1)}}'
  + '@keyframes exnOut{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,150%) scale(.96)}}'
  + '.exn-ic{flex:none;width:var(--exn-ic);height:var(--exn-ic);border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--exn-bg);color:var(--exn-c);animation:exnPop .6s .08s cubic-bezier(.2,1.5,.4,1) both}'
  + '.exn-ic svg{width:var(--exn-gl);height:var(--exn-gl);overflow:visible}'
  + '.exn-ic .r,.exn-ic .k{fill:none;stroke:currentColor;stroke-width:var(--exn-sw);stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100;stroke-dashoffset:100}'
  + '.exn.in .exn-ic .r{animation:exnDraw .55s .12s ease forwards}'
  + '.exn.in .exn-ic .k{animation:exnDraw .4s .38s ease forwards}'
  + '.exn:not(.in) .exn-ic .r,.exn:not(.in) .exn-ic .k{stroke-dashoffset:0}'
  + '@keyframes exnDraw{to{stroke-dashoffset:0}}'
  + '@keyframes exnPop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}'
  + '.exn.in[data-k=success] .exn-ic{position:relative}'
  + '.exn.in[data-k=success] .exn-ic::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid var(--exn-c);animation:exnRing .95s .22s ease-out both;pointer-events:none}'
  + '@keyframes exnRing{from{transform:scale(1);opacity:.75}to{transform:scale(1.9);opacity:0}}'
  + '.exn-tx{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}'
  + '.exn-tx b{font-size:var(--exn-ts);font-weight:700;line-height:1.3;color:var(--exn-tc);word-break:break-word}'
  + '.exn-tx span{font-size:var(--exn-ss);line-height:1.35;color:var(--exn-sc,var(--exn-c));font-weight:500;word-break:break-word}'
  + '.exn-tx span:empty{display:none}'
  + '.exn[data-k=success]{--exn-c:#1f9d6a;--exn-bg:#e3f6ec}'
  + '.exn[data-k=error]{--exn-c:#e0342f;--exn-bg:#fde8e7}'
  + '.exn[data-k=warn]{--exn-c:#d98a00;--exn-bg:#fff2d6}'
  + '.exn[data-k=info]{--exn-c:#2f7de1;--exn-bg:#e4efff}'
  /* ธีมสว่าง = ขาวมินิ · ธีมมืด (และหน้าแอดมิน) = ดำแดงสไตล์ร้าน */
  + '.exn.lt{--exn-w:340px;--exn-gap:11px;--exn-py:10px;--exn-px:14px;--exn-r:16px;--exn-surf:#fff;--exn-tc:#16181d;--exn-sc:var(--exn-c);--exn-bd:0 solid transparent;'
  +   '--exn-sh:0 7px 18px rgba(0,0,0,.15),0 1px 4px rgba(0,0,0,.07);--exn-ic:40px;--exn-gl:24px;--exn-sw:2.4;--exn-ts:15px;--exn-ss:12.5px}'
  + '.exn.dk{--exn-w:460px;--exn-gap:14px;--exn-py:14px;--exn-px:18px;--exn-r:20px;--exn-surf:#121014;--exn-tc:#fff;--exn-sc:#b9b4c0;--exn-bd:1px solid #3a2226;'
  +   '--exn-sh:0 13px 31px rgba(0,0,0,.5),0 0 28px rgba(255,77,77,.10);--exn-ic:54px;--exn-gl:32px;--exn-sw:2.4;--exn-ts:17px;--exn-ss:14px}'
  + '.exn.dk[data-k=success]{--exn-c:#3ddc84;--exn-bg:rgba(61,220,132,.18)}'
  + '.exn.dk[data-k=error]{--exn-c:#ff4d4d;--exn-bg:rgba(255,77,77,.18)}'
  + '.exn.dk[data-k=warn]{--exn-c:#ffb62e;--exn-bg:rgba(255,182,46,.18)}'
  + '.exn.dk[data-k=info]{--exn-c:#5aa2ff;--exn-bg:rgba(90,162,255,.18)}'
  + '@media (prefers-reduced-motion:reduce){.exn.in,.exn.out{animation-duration:.01ms!important}.exn-ic,.exn.in .exn-ic .r,.exn.in .exn-ic .k{animation-duration:.01ms!important;animation-delay:0s!important}}';

  var ICON = {
    success:'<svg viewBox="0 0 40 40"><circle class="r" pathLength="100" cx="20" cy="20" r="15"/><path class="k" pathLength="100" d="M13 20.5l5 5 9-10.5"/></svg>',
    error:'<svg viewBox="0 0 40 40"><circle class="r" pathLength="100" cx="20" cy="20" r="15"/><path class="k" pathLength="100" d="M14.5 14.5l11 11M25.5 14.5l-11 11"/></svg>',
    warn:'<svg viewBox="0 0 40 40"><circle class="r" pathLength="100" cx="20" cy="20" r="15"/><path class="k" pathLength="100" d="M20 12.5v9.5M20 27.4v.2"/></svg>',
    info:'<svg viewBox="0 0 40 40"><circle class="r" pathLength="100" cx="20" cy="20" r="15"/><path class="k" pathLength="100" d="M20 18.5v9M20 12.6v.2"/></svg>'
  };

  var el, icEl, bEl, sEl, hideT, endT, lastAt = 0;

  /* เสียง — เล่นพร้อมป้ายอัตโนมัติในหน้าแอดมิน; หน้าอื่นเล่นเมื่อสั่ง exToast(..., {sound:true}) */
  /* ✓ สำเร็จ = ok.mp3 · ✕ ผิดพลาด / ! เตือน / i ทั่วไป = alert.mp3 */
  /* ระบบเสียงแบบกันพลาด:
     1) Web Audio (ถอดรหัสไฟล์ไว้ในหน่วยความจำ เล่นทันที ซ้อนกันได้ ไม่หน่วง) เป็นตัวหลัก
     2) ตัวสำรอง <audio> ที่ปลดล็อกไว้ล่วงหน้า — ใช้เมื่อ Web Audio ใช้ไม่ได้
     3) ปลดล็อก/ปลุกเสียง "ทุกครั้งที่แตะ" (ไม่ใช่แค่ครั้งแรก) และเมื่อกลับมาที่แท็บ/หน้า
        เพราะมือถือ (โดยเฉพาะ iOS) จะสั่งพักเสียงเองได้ทุกเมื่อ และ touchstart ตอนเลื่อนหน้าไม่นับเป็นการแตะจริง */
  var AUTO_SND = /admin/i.test(location.pathname) || !!window.EX_THEME_ADMIN;
  var FILES = ['ok.mp3','alert.mp3'];
  var AC = window.AudioContext || window.webkitAudioContext, ctx = null, bufs = {}, loading = {}, tags = {}, tagOk = {};
  try { if(navigator.audioSession) navigator.audioSession.type = 'playback'; } catch(e){} /* iOS: ให้ดังแม้เปิดสวิตช์เงียบ */

  function getCtx(){
    if(!ctx && AC){
      try { ctx = new AC({ latencyHint:'interactive' }); } catch(e){ try { ctx = new AC(); } catch(e2){ ctx = null; } }
    }
    return ctx;
  }
  function loadBuf(f){
    var c = getCtx(); if(!c || bufs[f] || loading[f] || !window.fetch) return;
    loading[f] = 1;
    fetch(f).then(function(r){ if(!r.ok) throw new Error('snd'); return r.arrayBuffer(); })
      .then(function(ab){ return new Promise(function(ok,no){ var p = c.decodeAudioData(ab, ok, no); if(p && p.then) p.then(ok,no); }); })
      .then(function(b){ bufs[f] = b; })
      .catch(function(){ loading[f] = 0; });   /* พลาด → ลองโหลดใหม่ในครั้งถัดไป */
  }
  function startBuf(c, b){
    var s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0);
  }

  /* ---- ตัวสำรอง <audio> ---- */
  function getTag(f){ if(!tags[f]){ try { tags[f] = new Audio(f); tags[f].preload = 'auto'; } catch(e){} } return tags[f]; }
  function unlockTag(f){
    if(tagOk[f]) return; var a = getTag(f); if(!a || a._u) return;
    try {
      a._u = 1; a.muted = true;
      var p = a.play();
      var ok = function(){ try{ a.pause(); a.currentTime = 0; }catch(e){} a.muted = false; a._u = 0; tagOk[f] = 1; };
      var no = function(){ a.muted = false; a._u = 0; };
      if(p && p.then) p.then(ok, no); else ok();
    } catch(e){ a._u = 0; }
  }
  function playTag(f){
    var a = getTag(f); if(!a) return;
    try {
      if(a._u || !a.paused){ a = new Audio(f); }   /* กำลังปลดล็อก/เล่นอยู่ → ใช้ตัวใหม่ ไม่ให้ตัดกัน */
      else { a.muted = false; try{ a.currentTime = 0; }catch(e){} }
      var p = a.play(); if(p && p.catch) p.catch(function(){});
    } catch(e){}
  }

  /* ---- ปลุกระบบเสียง (เรียกซ้ำได้ ถูกมาก ถ้าเสียงพร้อมอยู่แล้วจะไม่ทำอะไร) ---- */
  function wake(){
    var c = getCtx();
    if(c && c.state !== 'running'){
      try { var p = c.resume(); if(p && p.catch) p.catch(function(){}); } catch(e){}
      try { var s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0); } catch(e){}  /* ปลดล็อก iOS */
    }
    FILES.forEach(loadBuf);
    if(!c || c.state !== 'running') FILES.forEach(unlockTag);
  }

  /* ---- เล่นเสียง ---- */
  function playSnd(f){
    var c = getCtx(), b = bufs[f];
    if(!c || !b){ loadBuf(f); playTag(f); return; }
    if(c.state === 'running'){ try { startBuf(c, b); return; } catch(e){} playTag(f); return; }
    var done = false;
    var go = function(){
      if(done) return; done = true;
      if(c.state === 'running'){ try { startBuf(c, b); return; } catch(e){} }
      playTag(f);
    };
    try { var p = c.resume(); if(p && p.then) p.then(go, go); else go(); } catch(e){ go(); }
    setTimeout(go, 250);   /* resume ค้าง → ใช้ตัวสำรอง ไม่ให้เงียบ */
  }
  window.exSound = playSnd; window.exSoundWake = wake;

  ['pointerdown','touchstart','touchend','mousedown','click','keydown'].forEach(function(ev){
    document.addEventListener(ev, wake, { passive:true, capture:true });
  });
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) wake(); });
  window.addEventListener('pageshow', wake);
  window.addEventListener('focus', wake);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ getCtx(); FILES.forEach(loadBuf); });
  else { getCtx(); FILES.forEach(loadBuf); }

  function build(){
    if(el) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    el = document.createElement('div');
    el.className = 'exn'; el.setAttribute('role','status'); el.setAttribute('aria-live','polite');
    el.innerHTML = '<div class="exn-ic"></div><div class="exn-tx"><b></b><span></span></div>';
    icEl = el.querySelector('.exn-ic'); bEl = el.querySelector('b'); sEl = el.querySelector('span');
    el.addEventListener('click', hide);
    document.body.appendChild(el);
  }

  /* เดาชนิดจากข้อความ: ผิดพลาด → เตือน → สำเร็จ → ทั่วไป ("ທັງໝົດ" = ทั้งหมด ไม่นับว่าหมดสต็อก) */
  function guess(t){
    var s = String(t).replace(/ທັງໝົດ/g,'');
    if(/ບໍ່|ຜິດ|ລົ້ມ|ເກີນ|ຫ້າມ|ໝົດ|ຂາດ|✕|✗|error|fail|invalid|ไม่|ผิด|ล้มเหลว|หมด/i.test(s)) return 'error';
    if(/ກະລຸນາ|ຂັ້ນຕ່ຳ|ສູງສຸດ|ຕ້ອງ|กรุณา|ขั้นต่ำ|สูงสุด/.test(s)) return 'warn';
    if(/ສຳເລັດ|ແລ້ວ|✓|✔|success|saved|copied|สำเร็จ|แล้ว|ເປີດໃຊ້|ປິດໃຊ້/i.test(s)) return 'success';
    return 'info';
  }

  function hide(){
    if(!el || !el.classList.contains('on')) return;
    clearTimeout(hideT); clearTimeout(endT);
    el.classList.remove('in'); el.classList.add('out');
    endT = setTimeout(function(){ el.classList.remove('on','out'); }, 420);
  }

  function show(title, opt){
    opt = opt || {};
    if(!document.body) return;
    build();
    title = String(title == null ? '' : title).trim();
    var sub = opt.sub || '';
    if(!sub && title.indexOf('\n') > -1){ var p = title.split('\n'); title = p.shift().trim(); sub = p.join(' ').trim(); }
    if(!title && !sub) return;
    var kind = opt.kind && ICON[opt.kind] ? opt.kind : guess(title + ' ' + sub);
    var now = Date.now();
    var running = el.classList.contains('on') && !el.classList.contains('out');
    bEl.textContent = title; sEl.textContent = sub;
    el.dataset.k = kind; icEl.innerHTML = ICON[kind];
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    el.classList.toggle('lt', light); el.classList.toggle('dk', !light);
    clearTimeout(endT); clearTimeout(hideT);
    /* ถ้าเพิ่งแสดงไม่ถึง .5 วิ (เช่นระบบแปลภาษาแก้ข้อความตามมา) แค่อัปเดตข้อความ ไม่เด้งซ้ำ */
    if(!(running && now - lastAt < 500)){
      el.classList.remove('in','out'); void el.offsetWidth;
      el.classList.add('on','in'); lastAt = now;
      if(opt.sound === true || (AUTO_SND && opt.sound !== false)) playSnd(kind === 'success' ? 'ok.mp3' : 'alert.mp3');
    }
    hideT = setTimeout(hide, Math.min(6000, 2400 + (title.length + sub.length) * 35));
  }
  window.exToast = show;

  /* ===== ดักป้ายเดิมของแต่ละหน้า ===== */
  var SEL = '#snack,#toast,#atoast,#pfToast';
  function kindOf(n){
    var k = n.dataset.kind || n.dataset.k || '';
    return k === 'error' ? 'error' : (k === 'success' || k === 'ok') ? 'success' : k === 'info' ? 'info' : k === 'warn' ? 'warn' : '';
  }
  function fire(n){
    if(!n.classList.contains('show')) return;
    var t = (n.textContent || '').replace(/\s+/g,' ').trim();
    if(!t) return;
    show(t, { kind: kindOf(n) || undefined });
  }
  function watch(){
    var pend = new Set(), q = false;
    var mo = new MutationObserver(function(recs){
      recs.forEach(function(r){ var n = r.target.nodeType === 1 ? r.target : r.target.parentNode; n = n && n.closest && n.closest(SEL); if(n) pend.add(n); });
      if(q) return; q = true;
      setTimeout(function(){ q = false; var a = Array.from(pend); pend.clear(); a.forEach(fire); }, 0);
    });
    document.querySelectorAll(SEL).forEach(function(n){
      mo.observe(n, { attributes:true, attributeFilter:['class','data-kind','data-k'], childList:true, characterData:true, subtree:true });
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
