/* ===== CONFIG: เปลี่ยนชื่อร้าน ลิงก์ และข้อมูลตรงนี้ ===== */
const CONFIG = {
  announce: 'ຊື້ສິນຄ້າສຳເລັດແລ້ວເຂົ້າ Discord ຂອງທາງຮ້ານນຳເດີ້!',
  routes: { // ใส่ URL จริง ถ้าเว้นว่างจะขึ้นข้อความแจ้งเตือนแทน
    login:'', register:'', topup:'topup.html', orders:'', hwid:'', chat:'', profile:'profile.html', manage:''
  },
  onBuy(p){ location.href = 'confirm.html?p=' + encodeURIComponent(p.art); } // เปิดหน้ายืนยันสั่งซื้อ
};

/* เປິດ/ປິດการแสดงผล: true = แสดง, false = ซ่อน (ข้อมูลยังอยู่ครบ) */
const SHOW = { categories:true, products:true, featured:true };

const $ = (s, r=document) => r.querySelector(s);
const ic = (id, cls='') => `<svg class="i ${cls}"><use href="#${id}"/></svg>`;
let snackT;
function snack(msg){ const s=$('#snack'); s.textContent=msg; s.classList.add('show'); clearTimeout(snackT); snackT=setTimeout(()=>s.classList.remove('show'),2400); }
/* หน้าที่ต้องล็อกอินก่อน — คนที่ยังไม่ลงชื่อกดแล้วจะเด้งหน้าต่างเข้าสู่ระบบ (ดูได้อย่างเดียว: หน้าแรก/หมวดหมู่/สินค้า/ธีม/ภาษา) */
const NEED_LOGIN = ['topup', 'orders', 'hwid', 'profile'];
function go(route){
  const u = CONFIG.routes[route];
  if(NEED_LOGIN.includes(route) && window.exLoggedIn && !exLoggedIn() && window.openAuth){
    try { u ? sessionStorage.setItem('exNext', u) : sessionStorage.removeItem('exNext'); } catch(e){}
    openAuth('login'); if(window.authNotice) authNotice('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນໃຊ້ງານສ່ວນນີ້'); return;
  }
  if(!u && (route==='login' || route==='register') && window.openAuth){ openAuth(route); return; }
  if(u){ location.href = u; } else { snack('ຍັງບໍ່ໄດ້ຕັ້ງລິ້ງປາຍທາງ (CONFIG.routes.' + route + ')'); }
}
document.addEventListener('click', e => {
  const r = e.target.closest('[data-route]');
  if(r){ e.preventDefault(); closeMenu(); go(r.dataset.route); }
});


/* แบนเนอร์: ใส่รูปที่ IMG.banner ใน data.js (1500 × 512 px) — ว่าง = โชว์ขนาดที่แนะนำ */
(function(){
  const b = $('#bnArt'); if(!b) return;
  /* ถ้า data.js เป็นไฟล์เก่า (ยังไม่มี artBanner) ใช้ตัวสำรองนี้ — ห้ามให้สคริปต์ทั้งหน้าพัง */
  const fallback = '<div class="cph"><span class="cph-a">ຂະໜາດຮູບທີ່ແນະນຳ</span><span class="cph-n">1500 × 512<small>px</small></span><span class="cph-b">ສຳລັບຮູບແບນເນີ · ຮູບແນວນອນ · PNG ຫຼື JPG</span></div>';
  try { b.innerHTML = (typeof artBanner === 'function') ? artBanner() : fallback; } catch(e){ b.innerHTML = fallback; }
})();

/* marquee — เลื่อนวนไม่มีสะดุด
   วัดความกว้างจริงของข้อความ → ซ้ำให้เต็มจอ → เลื่อนไปเท่าความกว้างของ 1 ชุดพอดีแล้ววนใหม่
   คำนวณใหม่อัตโนมัติเมื่อขนาดจอ/ฟอนต์/ภาษา (i18n) เปลี่ยน ความเร็ว = MQ_SPEED px ต่อวินาที */
(function(){
  const MQ_SPEED = 55;
  const mq = $('#mq'); if(!mq) return;
  const item = `<span class="mq-item">${ic('bell')}${CONFIG.announce}</span>`;
  let copies = 0, lastW = 0, raf = 0;

  function build(n){
    copies = n;
    const g = `<div class="mq-group">${item.repeat(n)}</div>`;
    mq.innerHTML = g + g.replace('class="mq-group"', 'class="mq-group" aria-hidden="true"');
    watch();
  }
  function measure(){
    raf = 0;
    const g1 = mq.querySelector('.mq-group'); if(!g1) return;
    const first = g1.querySelector('.mq-item'); if(!first) return;
    const itemW = first.getBoundingClientRect().width + 36;          // 36 = margin-right ของแต่ละอัน
    if(itemW < 40) return;                                            // ยังโหลดฟอนต์/เลย์เอาต์ไม่เสร็จ
    const need = Math.max(2, Math.ceil((mq.parentElement.clientWidth + 40) / itemW) + 1);
    if(need !== copies){ build(need); return; }
    const w = g1.getBoundingClientRect().width;
    if(Math.abs(w - lastW) < 0.5) return;
    lastW = w;
    mq.style.setProperty('--mq-dn', -w + 'px');
    mq.style.setProperty('--mq-t', (w / MQ_SPEED).toFixed(2) + 's');
  }
  const schedule = () => { if(!raf) raf = requestAnimationFrame(measure); };
  let ro;
  function watch(){
    if(!window.ResizeObserver){ schedule(); return; }
    if(!ro) ro = new ResizeObserver(schedule);
    ro.disconnect();
    ro.observe(mq.parentElement);
    const f = mq.querySelector('.mq-item'); if(f) ro.observe(f);
    schedule();
  }
  build(4);
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
})();

/* แถบ "ประกาศ" ใต้แบนเนอร์ — ข้อความเลื่อนวน (หลักการเดียวกับแถบบนสุด: วัดความกว้างจริง ซ้ำให้เต็ม เลื่อนเท่า 1 ชุดแล้ววน) */
(function(){
  const SPEED = 40;   // px ต่อวินาที
  const vp = $('.announce .an-r'); if(!vp) return;
  const item = `<span class="an-item">${CONFIG.announce}</span>`;
  let copies = 0, lastW = 0, raf = 0, ro, track;
  function build(n){
    copies = n;
    const g = `<div class="an-group">${item.repeat(n)}</div>`;
    vp.innerHTML = `<div class="an-track">${g}${g.replace('class="an-group"','class="an-group" aria-hidden="true"')}</div>`;
    track = vp.firstChild;
    if(ro){ ro.disconnect(); ro.observe(vp); const f = vp.querySelector('.an-item'); if(f) ro.observe(f); }
    schedule();
  }
  function measure(){
    raf = 0;
    const g1 = vp.querySelector('.an-group'), first = vp.querySelector('.an-item'); if(!g1 || !first) return;
    const itemW = first.getBoundingClientRect().width + 44;      // 44 = ช่องว่างท้ายแต่ละข้อความ
    if(itemW < 60) return;
    const need = Math.max(2, Math.ceil((vp.clientWidth + 40) / itemW) + 1);
    if(need !== copies){ build(need); return; }
    const w = g1.getBoundingClientRect().width;
    if(Math.abs(w - lastW) < 0.5) return;
    lastW = w;
    track.style.setProperty('--mq-dn', -w + 'px');
    track.style.setProperty('--mq-t', (w / SPEED).toFixed(2) + 's');
  }
  const schedule = () => { if(!raf) raf = requestAnimationFrame(measure); };
  if(window.ResizeObserver) ro = new ResizeObserver(schedule);
  build(2);
  window.addEventListener('resize', schedule);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
})();

/* theme */
(function(){
  const root = document.documentElement, btn = $('#btnTheme');
  const apply = t => { root.dataset.theme = t; btn.innerHTML = ic(t==='dark' ? 'moon' : 'sun'); };
  let t = 'light';
  try { t = localStorage.getItem('theme') || 'light'; } catch(e){}
  apply(t);
  btn.addEventListener('click', () => {
    t = root.dataset.theme === 'dark' ? 'light' : 'dark'; apply(t);
    try { localStorage.setItem('theme', t); } catch(e){}
  });
})();

/* สถานะล็อกอิน (UI) — ล็อกอินแล้ว: ปุ่ม "สมัครสมาชิก" ในแถบบนกลายเป็นไอคอนบัญชี
   ฝั่งหลังบ้านเรียก setUser({name:'ชื่อ'}) หลังล็อกอินสำเร็จ / setUser(null) ตอนออกจากระบบ
   (เก็บใน localStorage key: exUser) ลองดูในคอนโซลได้: setUser({name:'test'}) */
(function(){
  const KEY = 'exUser';
  const get = () => { try { const u = JSON.parse(localStorage.getItem(KEY) || 'null'); return u && typeof u === 'object' ? u : null; } catch(e){ return null; } };
  function paint(){
    const u = get();
    document.documentElement.classList.toggle('is-in', !!u);
    const b = $('#btnUser');
    if(b){ const n = u && u.name ? String(u.name) : ''; b.title = n; b.setAttribute('aria-label', n ? 'ບັນຊີ: ' + n : 'ບັນຊີຂອງຂ້ອຍ'); }
  }
  /* ยอดเงินบนแถบหัว: อ่านจาก localStorage 'exshop_balance' (ตัวเดียวกับหน้าเติมเงิน/ยืนยันสั่งซื้อ)
     ต่อระบบจริง: เรียก setBalance(ตัวเลข) หลังดึงยอดจาก Supabase */
  const BK = 'exshop_balance';
  const short = n => n >= 1e6 ? (Math.round(n / 1e5) / 10) + 'M' : n.toLocaleString('en-US');
  function paintBal(){
    let n = 0; try { n = Number(JSON.parse(localStorage.getItem(BK) || '0')) || 0; } catch(e){}
    const el = $('#balNum'); if(el) el.textContent = '₭' + short(n);
  }
  window.setBalance = n => { try { localStorage.setItem(BK, JSON.stringify(Number(n) || 0)); } catch(e){} paintBal(); };
  window.addEventListener('pageshow', paintBal);
  window.addEventListener('storage', e => { if(e.key === BK) paintBal(); });
  paintBal();
  window.getUser = get;
  window.setUser = function(u){
    try { u ? localStorage.setItem(KEY, JSON.stringify(u)) : localStorage.removeItem(KEY); } catch(e){}
    paint();
  };
  window.addEventListener('storage', e => { if(e.key === KEY) paint(); });
  paint();
})();

/* drawer */
const ov = $('#ov'), hdr = $('#hdr'), hMenu = $('#hMenu');
/* เมนู: แถบบน (แคปซูล) ขยายลงมาเป็นรายการเมนู — เปิด/ปิดด้วยปุ่มเบอร์เกอร์, แตะพื้นหลัง หรือกด Esc */
function setMenu(on){
  $('#btnMenu').classList.toggle('is-open', on);
  $('#btnMenu').setAttribute('aria-expanded', on);
  hdr.classList.toggle('menu-open', on);
  hMenu.inert = !on; hMenu.setAttribute('aria-hidden', on ? 'false' : 'true');
  ov.classList.toggle('open', on); ov.setAttribute('aria-hidden', on ? 'false' : 'true');
  document.body.style.overflow = on ? 'hidden' : '';
}
function openMenu(){ setMenu(true); }
function closeMenu(){ setMenu(false); }
$('#btnMenu').addEventListener('click', () => setMenu(!hdr.classList.contains('menu-open')));
ov.addEventListener('click', closeMenu);
hMenu.querySelectorAll('a[href^="#"]:not([data-route])').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if(e.key==='Escape') closeMenu(); });

/* stats */
$('#stats').innerHTML = [
  ['s-users','ຜູ້ໃຊ້ງານ','0','ຄົນ'],
  ['s-bag','ສິນຄ້າ','0','ລາຍການ'],
  ['s-boxes','ຄຳສັ່ງຊື້','0','ລາຍການ'],
  ['s-check','ຂາຍແລ້ວ','0','ຊິ້ນ']
].map(([i,l,n,u]) => `<div class="stat"><svg class="i wm" aria-hidden="true"><use href="#${i}"/></svg><div class="ic">${ic(i)}</div><div class="tx"><span class="lb">${l}</span><span class="nm">${n}<small>${u}</small></span></div></div>`).join('');

/* art helpers (placeholder artwork — replace with real images via CONFIG / <img>) */
const arts = {
  unban:{bg:'radial-gradient(90% 70% at 50% 40%,#7a1218,#2a0508 70%,#120204)', top:'<div style="position:absolute;left:24%;top:17%;width:52%;aspect-ratio:1;border:9px solid #FF0000;border-radius:50%"></div><div style="position:absolute;left:49%;top:14%;width:9px;height:58%;background:#FF0000;transform:rotate(45deg);transform-origin:50% 40%"></div>', t:[['UNBAN FIVEM','#fff','8.2cqw','66%'],['ປົດແບນບໍ່ມີໂດນຍ້ອນຫຼັງ','#fff','4.4cqw','80%']]},
  devil:{bg:'linear-gradient(160deg,#0c0d1c,#2a0a14 60%,#1a0508)', top:'<div style="position:absolute;left:12%;right:10%;top:14%;height:52%;background:linear-gradient(120deg,#25306a,#3a1c3a);clip-path:polygon(0 100%,8% 30%,25% 8%,42% 22%,55% 5%,75% 12%,90% 40%,100% 100%);opacity:.9"></div>', t:[['DEVIL STAR','#FF0000','13cqw','72%']]},
  card:{bg:'linear-gradient(180deg,#0b0e1f,#101a4a 70%,#090d28)', top:'<div style="position:absolute;left:15%;right:15%;top:20%;height:34%;background:linear-gradient(135deg,#1f2a66,#0a0f2c);border:1px solid #3d4fb0;border-radius:6px"></div>', t:[['CARD','#1d3fe0','13cqw','72%']]},
  setting:{bg:'linear-gradient(170deg,#1b0609,#3d0a10 60%,#150407)', top:'<div style="position:absolute;left:25%;right:12%;top:8%;height:60%;background:linear-gradient(180deg,#444,#111);clip-path:polygon(15% 100%,20% 25%,50% 6%,80% 25%,90% 100%);opacity:.7"></div>', t:[['SETTING PERFECTX','#FF0000','8.4cqw','74%']]},
  xlight:{bg:'linear-gradient(180deg,#14090b,#2c0a0e)', top:'<div style="position:absolute;left:18%;right:18%;top:26%;height:5px;background:linear-gradient(90deg,#555,#ccc,#555);transform:rotate(-40deg)"></div>', t:[['CMD','#fff','12cqw','56%'],['XLIGHT','#FF0000','17cqw','67%'],['SUPER MODE','#ffb21f','4.6cqw','86%']]},
  unlock:{bg:'linear-gradient(160deg,#241012,#4a0c12 70%,#190507)', top:'<div style="position:absolute;left:5%;top:12%;width:40%;height:70%;background:linear-gradient(180deg,#8d8d94,#2b2b30);border-radius:40% 40% 0 0"></div><div style="position:absolute;right:6%;top:10%;font-style:italic;color:#ffc425;font-size:8cqw;font-weight:900;transform:rotate(-8deg);line-height:.95;text-align:right">STAR<br><span style="font-size:5cqw">COMMUNITY</span></div>', t:[['ປົດລັອກສະກິນ','#FF0000','14cqw','73%']]},
  collection:{bg:'linear-gradient(160deg,#3a0a10,#14090c)', top:'<div style="position:absolute;left:10%;top:16%;width:34%;height:52%;background:linear-gradient(180deg,#9a7a70,#2a1a1a);border-radius:40% 40% 8% 8%"></div>', t:[['COLLECTION','#fff','11.5cqw','72%']]},
  upcri:{bg:'linear-gradient(160deg,#4a0a10,#0d0709 65%)', top:'<div style="position:absolute;left:18%;right:18%;top:36%;height:30%;background:linear-gradient(135deg,#2b2b30,#0a0a0c);border:1px solid #555;border-radius:6px;transform:rotate(-4deg)"></div>', t:[['UPCRI','#fff','20cqw','8%'],['ຄຣີປັບໄດ້ ຄຣີໜ້າ ຄຣີຂ້າງ ຄຣີຫຼັງ','#fff','4.5cqw','86%']]},
  phantom:{bg:'linear-gradient(160deg,#222,#050505)', top:'', t:[['PHANTOM','#ddd','9cqw','38%']]},
  zent:{bg:'linear-gradient(160deg,#5b2bd8,#14062e)', top:'', t:[['ZENTNITYX','#e9dcff','7cqw','42%']]},
  level:{bg:'linear-gradient(160deg,#6f3bd0,#1c0a3f)', top:'', t:[['LEVEL?','#fff','11cqw','40%']]},
  br:{bg:'linear-gradient(120deg,#0d0d0f,#3a1208 70%,#15090a)', top:'', t:[]}
};
function renderProducts(cat){
  const list = products.filter(p => p.cat === cat);
  $('#grid').innerHTML = list.length ? list.map((p,i) => productCardHTML(p, i)).join('') : `<div class="empty">ຍັງບໍ່ມີສິນຄ້າໃນໝວດນີ້</div>`;
  $('#grid').querySelectorAll('[data-buy]').forEach(b => {
    const go = () => { const p = list[+b.dataset.buy]; if(p.update || p.soldout){ snack(p.update ? 'ກຳລັງອັບເດດ' : 'ສິນຄ້າໝົດສະຕັອກ'); return; } CONFIG.onBuy(p); };
    b.addEventListener('click', go);
    b.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); go(); } });
  });
}
renderProducts('fivem');

/* เงาขอบแถวสินค้า: เปิด/ปิดตามตำแหน่งที่เลื่อน */
(function(){
  const g = $('#grid'), w = $('#gridWrap'); if(!g || !w) return;
  const upd = () => {
    const max = g.scrollWidth - g.clientWidth;
    w.classList.toggle('can-r', g.scrollLeft < max - 8);
  };
  g.addEventListener('scroll', upd, {passive:true});
  window.addEventListener('resize', upd);
  if(window.ResizeObserver) new ResizeObserver(upd).observe(g);
  upd();
})();

/* featured carousel */
const feat = [
  {n:'EXSHOP', p:'₭0', art:'unban'}, {n:'EXSHOP', p:'₭0', art:'devil'},
  {n:'EXSHOP', p:'₭0', art:'br'}, {n:'EXSHOP', p:'₭0', art:'phantom'},
  {n:'EXSHOP', p:'₭0', art:'zent'}, {n:'EXSHOP', p:'₭0', art:'xlight'}
];
(function(){
  const tr = $('#featTrack'), dots = $('#featDots');
  tr.innerHTML = feat.map(f => `<a class="fcard" href="#products"><div class="fi">${artSq(f.art, f.img, true)}</div><div class="fn">${f.n}</div><div class="fp">${f.p}</div></a>`).join('');
  dots.innerHTML = feat.map((_,i) => `<button aria-label="ສະໄລດ໌ ${i+1}"></button>`).join('');
  let i = 0, timer;
  const set = n => { i = (n + feat.length) % feat.length; tr.style.transform = `translateX(-${i*100}%)`; [...dots.children].forEach((d,k) => d.classList.toggle('on', k===i)); };
  const start = () => { clearInterval(timer); timer = setInterval(() => set(i+1), 3500); };
  [...dots.children].forEach((d,k) => d.addEventListener('click', () => { set(k); start(); }));
  set(0); start();
})();

$('#catList').innerHTML = cats.map(c => `
  <button class="cat" data-cat="${c.k}">
    <div class="cb cb-img">${artCat(c.img)}</div>
    <div class="cat-b"><div><h3>${c.n}</h3><p>${c.d}</p></div><span class="cnt">${c.c} ສິນຄ້າ</span></div>
  </button>`).join('');
$('#catList').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if(!b) return;
  location.href = 'categories.html?cat=' + encodeURIComponent(b.dataset.cat);   // กดการ์ดหมวด → ไปหน้าหมวดหมู่ (เลือกหมวดนั้นให้)
});
$('#allBtn').addEventListener('click', () => { $('#catName').textContent = 'EXSHOP'; renderProducts('fivem'); });

/* apply show/hide flags */
$('#cats').hidden = !SHOW.categories;
$('#products').hidden = !SHOW.products;
$('#featSec').hidden = !SHOW.featured;

/* การ์ด "ทำไมต้องเลือกเรา": สลับข้อความ+ไอคอนวนทุก 5 วินาที (เปลี่ยนด้วยเบลอ/จางที่ CSS .wrot) */
(function(){
  const box = $('#whyRot'); if(!box) return;
  const slides = [...box.querySelectorAll('.wslide')]; if(slides.length < 2) return;
  const WHY_MS = 5000;   // เวลารอก่อนสลับ (มิลลิวินาที)
  let i = 0, timer;
  const show = n => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s,k) => { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), WHY_MS); };
  document.addEventListener('visibilitychange', () => { if(document.hidden) clearInterval(timer); else start(); });  // แท็บไม่ได้เปิดอยู่ = หยุด ไม่ให้สลับรัวตอนกลับมา
  start();
})();


/* เมนูไอคอนบัญชี: กดแล้วมีตัวเลือก ໂປຣໄຟລ໌ / ອອກຈາກລະບົບ (ลอยใต้ปุ่ม ปิดเมื่อแตะข้างนอก/เลื่อน/กด Esc) */
(function(){
  const btn = $('#btnUser'); if(!btn) return;
  const um = document.createElement('div');
  um.className = 'um'; um.id = 'um'; um.setAttribute('role','menu'); um.setAttribute('aria-label','ບັນຊີ'); um.hidden = true;
  um.innerHTML = `<div class="um-h"><span class="um-av">${ic('user')}</span><span class="um-t"><b id="umName"></b><small>ສະມາຊິກ</small></span></div>
    <a class="um-i" role="menuitem" href="profile.html">${ic('user')}ໂປຣໄຟລ໌</a>
    <button class="um-i" role="menuitem" type="button" id="umManage">${ic('panel')}ຈັດການແຜງຮ້ານ</button>
    <button class="um-i um-out" role="menuitem" type="button" id="umOut">${ic('logout')}ອອກຈາກລະບົບ</button>`;
  document.body.appendChild(um);
  let open = false;
  function place(){
    const r = btn.getBoundingClientRect();
    um.style.top = (r.bottom + 8) + 'px';
    um.style.right = Math.max(10, document.documentElement.clientWidth - r.right) + 'px';
  }
  function set(on){
    if(on === open) return; open = on;
    btn.setAttribute('aria-expanded', on);
    if(on){
      const u = window.getUser && getUser(); $('#umName').textContent = (u && u.name) || '';
      closeMenu(); place(); um.hidden = false; void um.offsetWidth; um.classList.add('on'); const f = um.querySelector('.um-i'); if(f) f.focus({preventScroll:true});
    } else {
      um.classList.remove('on'); setTimeout(() => { if(!open) um.hidden = true; }, 180);
    }
  }
  btn.setAttribute('aria-haspopup','menu'); btn.setAttribute('aria-expanded','false');
  btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); set(!open); });
  document.addEventListener('click', e => { if(open && !um.contains(e.target)) set(false); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && open){ set(false); btn.focus({preventScroll:true}); } });
  window.addEventListener('scroll', () => { if(open) set(false); }, {passive:true});
  window.addEventListener('resize', () => { if(open) place(); });
  $('#umManage').addEventListener('click', () => {
    set(false);
    if(CONFIG.routes.manage) location.href = CONFIG.routes.manage;   // ใส่ลิงก์หน้าจัดการแผงร้านที่ CONFIG.routes.manage
    else snack('ກຳລັງພັດທະນາ');
  });
  $('#umOut').addEventListener('click', () => {
    set(false);
    if(!confirm('ຕ້ອງການອອກຈາກລະບົບບໍ?')) return;
    if(window.exLogout) exLogout(); else location.reload();
  });
})();
