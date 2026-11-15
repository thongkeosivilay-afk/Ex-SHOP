/* ===== notify.js — ป้ายแจ้งเตือนสีขาว เด้งเลื่อนขึ้นจากด้านล่าง (ใช้ทุกหน้า) =====
   - ดักป้ายเดิมของทุกหน้า (#snack / #toast / #atoast / #pfToast) ที่ถูกสั่ง .show แล้วแสดงป้ายใหม่แทน (ป้ายเดิมถูกซ่อน)
     → ไม่ต้องแก้ฟังก์ชัน toast/snack เดิมในแต่ละหน้า เพิ่มแค่ <script src="notify.js"> ท้ายหน้า
   - เรียกใช้เองได้: exToast('หัวข้อ', { sub:'ข้อความรอง', kind:'success|error|warn|info' })  หรือ  exToast('หัวข้อ\nข้อความรอง')
   - ชนิดไอคอนเดาจากข้อความ (หรือจาก data-kind / data-k ของป้ายเดิม) */
(function(){
  if(window.exToast) return;

  var css = ''
  + '#snack,#toast,#atoast,#pfToast{display:none!important}'
  + '.exn{box-sizing:border-box;position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);width:min(calc(100% - 28px),460px);z-index:2147483000;'
  +   'display:none;align-items:center;gap:14px;padding:14px 18px;border-radius:24px;background:#fff;color:#16181d;'
  +   'box-shadow:0 18px 44px rgba(0,0,0,.38),0 3px 10px rgba(0,0,0,.18);cursor:pointer;-webkit-tap-highlight-color:transparent;'
  +   'transform:translate(-50%,0);will-change:transform,opacity}'
  + '.exn.on{display:flex}'
  + '.exn.in{animation:exnIn .65s cubic-bezier(.2,1.2,.35,1) both}'
  + '.exn.out{animation:exnOut .4s cubic-bezier(.55,0,.8,.4) both;pointer-events:none}'
  + '@keyframes exnIn{0%{opacity:0;transform:translate(-50%,170%) scale(.92)}45%{opacity:1}62%{transform:translate(-50%,-12px) scale(1.01)}82%{transform:translate(-50%,3px) scale(1)}100%{opacity:1;transform:translate(-50%,0) scale(1)}}'
  + '@keyframes exnOut{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,150%) scale(.96)}}'
  + '.exn-ic{flex:none;width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--exn-bg);color:var(--exn-c);animation:exnPop .6s .08s cubic-bezier(.2,1.5,.4,1) both}'
  + '.exn-ic svg{width:32px;height:32px;overflow:visible}'
  + '.exn-ic .r,.exn-ic .k{fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100;stroke-dashoffset:100}'
  + '.exn.in .exn-ic .r{animation:exnDraw .55s .12s ease forwards}'
  + '.exn.in .exn-ic .k{animation:exnDraw .4s .38s ease forwards}'
  + '.exn:not(.in) .exn-ic .r,.exn:not(.in) .exn-ic .k{stroke-dashoffset:0}'
  + '@keyframes exnDraw{to{stroke-dashoffset:0}}'
  + '@keyframes exnPop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}'
  + '.exn.in[data-k=success] .exn-ic{position:relative}'
  + '.exn.in[data-k=success] .exn-ic::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid var(--exn-c);animation:exnRing .95s .22s ease-out both;pointer-events:none}'
  + '@keyframes exnRing{from{transform:scale(1);opacity:.75}to{transform:scale(1.9);opacity:0}}'
  + '.exn-tx{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}'
  + '.exn-tx b{font-size:17px;font-weight:700;line-height:1.3;color:#16181d;word-break:break-word}'
  + '.exn-tx span{font-size:14px;line-height:1.35;color:var(--exn-c);font-weight:500;word-break:break-word}'
  + '.exn-tx span:empty{display:none}'
  + '.exn[data-k=success]{--exn-c:#1f9d6a;--exn-bg:#e3f6ec}'
  + '.exn[data-k=error]{--exn-c:#e0342f;--exn-bg:#fde8e7}'
  + '.exn[data-k=warn]{--exn-c:#d98a00;--exn-bg:#fff2d6}'
  + '.exn[data-k=info]{--exn-c:#2f7de1;--exn-bg:#e4efff}'
  + '@media (prefers-reduced-motion:reduce){.exn.in,.exn.out{animation-duration:.01ms!important}.exn-ic,.exn.in .exn-ic .r,.exn.in .exn-ic .k{animation-duration:.01ms!important;animation-delay:0s!important}}';

  var ICON = {
    success:'<svg viewBox="0 0 40 40"><circle class="r" pathLength="100" cx="20" cy="20" r="15"/><path class="k" pathLength="100" d="M13 20.5l5 5 9-10.5"/></svg>',
    error:'<svg viewBox="0 0 40 40"><circle class="r" pathLength="100" cx="20" cy="20" r="15"/><path class="k" pathLength="100" d="M14.5 14.5l11 11M25.5 14.5l-11 11"/></svg>',
    warn:'<svg viewBox="0 0 40 40"><circle class="r" pathLength="100" cx="20" cy="20" r="15"/><path class="k" pathLength="100" d="M20 12.5v9.5M20 27.4v.2"/></svg>',
    info:'<svg viewBox="0 0 40 40"><circle class="r" pathLength="100" cx="20" cy="20" r="15"/><path class="k" pathLength="100" d="M20 18.5v9M20 12.6v.2"/></svg>'
  };

  var el, icEl, bEl, sEl, hideT, endT, lastAt = 0;

  /* เสียง "แปะๆ" (ok.mp3) — เล่นพร้อมป้ายสำเร็จ ✓ อัตโนมัติในหน้าแอดมิน (ทุกครั้งที่กดบันทึกแล้วสำเร็จ); หน้าอื่นเล่นเมื่อสั่ง exToast(..., {sound:true}) */
  var AUTO_SND = /admin/i.test(location.pathname), snd = null, unlocked = false;
  function getSnd(){ if(!snd){ try { snd = new Audio('ok.mp3'); snd.preload = 'auto'; } catch(e){} } return snd; }
  function playSnd(){ var a = getSnd(); if(!a) return; try { a.muted = false; a.currentTime = 0; var p = a.play(); if(p && p.catch) p.catch(function(){}); } catch(e){} }
  /* มือถือให้เล่นเสียงได้หลังผู้ใช้แตะหน้าจอครั้งแรกเท่านั้น → ปลดล็อกเงียบๆ ตอนแตะครั้งแรก */
  function unlock(){
    if(unlocked) return; unlocked = true;
    var a = getSnd(); if(!a) return;
    try { a.muted = true; var p = a.play(); var done = function(){ a.pause(); a.currentTime = 0; a.muted = false; };
      p && p.then ? p.then(done, function(){ a.muted = false; }) : done(); } catch(e){}
  }
  ['pointerdown','touchstart','keydown'].forEach(function(ev){ document.addEventListener(ev, unlock, { once:true, passive:true, capture:true }); });

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
    clearTimeout(endT); clearTimeout(hideT);
    /* ถ้าเพิ่งแสดงไม่ถึง .5 วิ (เช่นระบบแปลภาษาแก้ข้อความตามมา) แค่อัปเดตข้อความ ไม่เด้งซ้ำ */
    if(!(running && now - lastAt < 500)){
      el.classList.remove('in','out'); void el.offsetWidth;
      el.classList.add('on','in'); lastAt = now;
      if(kind === 'success' && (opt.sound === true || (AUTO_SND && opt.sound !== false))) playSnd();
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
