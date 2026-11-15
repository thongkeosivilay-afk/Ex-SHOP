/* ===== CONFIG: เปลี่ยนชื่อร้าน ลิงก์ และข้อมูลตรงนี้ ===== */
const CONFIG = {
  announce: 'ຊື້ສິນຄ້າສຳເລັດແລ້ວເຂົ້າ Discord ຂອງທາງຮ້ານນຳເດີ້!',
  routes: { // ใส่ URL จริง ถ้าเว้นว่างจะขึ้นข้อความแจ้งเตือนแทน
    login:'', register:'', topup:'topup.html', orders:'', hwid:'', chat:'', profile:'profile.html', manage:'admin.html'
  },
  onBuy(p){ location.href = 'confirm.html?p=' + encodeURIComponent(p.id); } // เปิดหน้ายืนยันสั่งซื้อ
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
function paintBanner(){
  const b = $('#bnArt'); if(!b) return;
  /* ถ้า data.js เป็นไฟล์เก่า (ยังไม่มี artBanner) ใช้ตัวสำรองนี้ — ห้ามให้สคริปต์ทั้งหน้าพัง */
  const fallback = '<div class="cph"><span class="cph-a">ຂະໜາດຮູບທີ່ແນະນຳ</span><span class="cph-n">1500 × 512<small>px</small></span><span class="cph-b">ສຳລັບຮູບແບນເນີ · ຮູບແນວນອນ · PNG ຫຼື JPG</span></div>';
  try { b.innerHTML = (typeof artBanner === 'function') ? artBanner() : fallback; } catch(e){ b.innerHTML = fallback; }
}
paintBanner();
document.addEventListener('site:ready', paintBanner);

/* "ເປັນຫຍັງຕ້ອງເລືອກເຮົາ" — 2 การ์ด (หัวข้อ + ข้อความ) ตั้งค่าได้ที่หน้าแอดมิน ว่าง = ใช้ข้อความเดิมในหน้า */
(function(){
  const map = { t1:'#why1t', d1:'#why1d', t2:'#why2t', d2:'#why2d' }, el = {}, dflt = {};
  Object.keys(map).forEach(k => { el[k] = $(map[k]); if(el[k]) dflt[k] = el[k].textContent; });
  const paint = () => {
    const w = (typeof SITE !== 'undefined' && SITE.why) || {};
    Object.keys(el).forEach(k => { if(el[k]) el[k].textContent = (w[k] || '').trim() || dflt[k]; });
  };
  paint();
  document.addEventListener('site:ready', paint);
})();

/* คำอธิบายร้าน (ย่อหน้าใต้ "ຍິນດີຕ້ອນຮັບສູ່") — ถ้าไม่ได้ตั้งค่าไว้ ใช้ข้อความเดิมในหน้า */
(function(){
  const p = $('#heroDesc'); if(!p) return;
  const dflt = p.textContent;
  const paint = () => { const d = (typeof SITE !== 'undefined' && SITE.desc) || ''; p.textContent = d.trim() ? d : dflt; };
  paint();
  document.addEventListener('site:ready', paint);
})();

/* marquee — เลื่อนวนไม่มีสะดุด
   วัดความกว้างจริงของข้อความ → ซ้ำให้เต็มจอ → เลื่อนไปเท่าความกว้างของ 1 ชุดพอดีแล้ววนใหม่
   คำนวณใหม่อัตโนมัติเมื่อขนาดจอ/ฟอนต์/ภาษา (i18n) เปลี่ยน ความเร็ว = MQ_SPEED px ต่อวินาที */
(function(){
  const MQ_SPEED = 55;
  const mq = $('#mq'); if(!mq) return;
  const txt = () => ((typeof SITE !== 'undefined' && SITE.marquee) || '').trim() || CONFIG.announce;
  let item = `<span class="mq-item">${ic('bell')}${escH(txt())}</span>`;
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
  document.addEventListener('site:ready', () => { item = `<span class="mq-item">${ic('bell')}${escH(txt())}</span>`; lastW = 0; build(copies || 4); });
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
})();

/* แถบ "ประกาศ" ใต้แบนเนอร์ — ข้อความเลื่อนวน (หลักการเดียวกับแถบบนสุด: วัดความกว้างจริง ซ้ำให้เต็ม เลื่อนเท่า 1 ชุดแล้ววน) */
(function(){
  const SPEED = 40;   // px ต่อวินาที
  const vp = $('.announce .an-r'); if(!vp) return;
  const txt = () => ((typeof SITE !== 'undefined' && SITE.announce) || '').trim() || CONFIG.announce;
  let item = `<span class="an-item">${escH(txt())}</span>`;
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
  document.addEventListener('site:ready', () => { item = `<span class="an-item">${escH(txt())}</span>`; lastW = 0; build(copies || 2); });
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
  /* ดึงยอดจริงจาก Supabase (member_me) มาแสดงบนแถบหัว — ไม่มี token = ยังไม่ล็อกอิน แสดง ₭0 */
  let balBusy = false;
  function syncBal(){
    const t = window.exToken && exToken();
    if(!t || !window.exRpc){ if(!t){ try { localStorage.setItem(BK, '0'); } catch(e){} paintBal(); } return; }
    if(balBusy) return; balBusy = true;
    exRpc('member_me', { p_token: t }).then(j => {
      if(j && j.ok) window.setBalance(j.balance);
    }).catch(() => { /* ออฟไลน์: ใช้ค่าที่แคชไว้ */ }).finally(() => { balBusy = false; });
  }
  window.syncBalance = syncBal;
  window.addEventListener('pageshow', () => { paintBal(); syncBal(); });
  window.addEventListener('storage', e => { if(e.key === BK) paintBal(); });
  document.addEventListener('visibilitychange', () => { if(!document.hidden) syncBal(); });
  paintBal();
  syncBal();
  window.getUser = get;
  window.setUser = function(u){
    try { u ? localStorage.setItem(KEY, JSON.stringify(u)) : localStorage.removeItem(KEY); } catch(e){}
    paint();
  };
  window.addEventListener('storage', e => { if(e.key === KEY) paint(); });
  paint();
})();

/* ชื่อร้าน + โลโก้บนแถบหัว (ค่าอยู่ที่ SITE ใน data.js) */
function paintBrand(){
  const S = (typeof SITE !== 'undefined' && SITE) || { name:'EXSHOP', logo:'' };
  const nm = String(S.name || 'EXSHOP');
  const n = $('#brName'), lg = $('#brLogo'), br = $('#brand');
  if(n) n.textContent = nm;
  if(br) br.setAttribute('aria-label', nm);
  if(lg){
    lg.textContent = '';
    if(S.logo){
      const im = new Image(); im.alt = ''; im.draggable = false; im.src = S.logo;
      im.onerror = () => { lg.textContent = nm.slice(0, 2); };
      lg.appendChild(im);
    } else { lg.textContent = nm.slice(0, 2); }
  }
}
paintBrand();
document.addEventListener('site:ready', paintBrand);

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
function renderStats(){
  const st = (typeof SITE !== 'undefined' && SITE.stat) || {}, rl = (typeof SITE !== 'undefined' && SITE.real) || {};
  /* ตัวเลขจำลองที่ตั้งในหน้าแอดมิน (st.*) มาก่อน — ว่าง/ไม่ตั้ง = ใช้ตัวเลขจริงจากฐานข้อมูล */
  const pick = (fake, real) => (fake === null || fake === undefined || isNaN(+fake)) ? (+real || 0) : +fake;
  const fmt = n => Number(n).toLocaleString('en-US');
  $('#stats').innerHTML = [
    ['s-users','ຜູ້ໃຊ້ງານ',fmt(pick(st.users, rl.users)),'ຄົນ'],
    ['s-bag','ສິນຄ້າ',fmt(pick(st.products, products.length)),'ລາຍການ'],
    ['s-boxes','ຄຳສັ່ງຊື້',fmt(pick(st.orders, rl.orders)),'ລາຍການ'],
    ['s-check','ຂາຍແລ້ວ',fmt(pick(st.sold, products.reduce((a,p) => a + (+p.sold||0), 0))),'ຊິ້ນ']
  ].map(([i,l,n,u]) => `<div class="stat"><svg class="i wm" aria-hidden="true"><use href="#${i}"/></svg><div class="ic">${ic(i)}</div><div class="tx"><span class="lb">${l}</span><span class="nm">${n}<small>${u}</small></span></div></div>`).join('');
}
document.addEventListener('site:ready', renderStats);
renderStats();

/* สินค้าแสดงจากฐานข้อมูล (products ใน data.js) — cat ว่าง = ทุกหมวด */
let curCat = '';
function renderProducts(cat){
  if(cat !== undefined) curCat = cat || '';
  const list = products.filter(p => !curCat || p.cat === curCat);
  const msg = !window.productsLoaded ? 'ກຳລັງໂຫຼດສິນຄ້າ...' : window.productsFailed && !products.length ? 'ໂຫຼດສິນຄ້າບໍ່ໄດ້ ກະລຸນາລອງໃໝ່' : 'ຍັງບໍ່ມີສິນຄ້າໃນໝວດນີ້';
  $('#grid').innerHTML = list.length ? list.map((p,i) => productCardHTML(p, i)).join('') : `<div class="empty">${msg}</div>`;
  $('#grid').querySelectorAll('[data-buy]').forEach(b => {
    const go = () => { const p = list[+b.dataset.buy]; if(!p) return; if(p.update || p.soldout){ snack(p.update ? 'ກຳລັງອັບເດດ' : 'ສິນຄ້າໝົດສະຕັອກ'); return; } CONFIG.onBuy(p); };
    b.addEventListener('click', go);
    b.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); go(); } });
  });
  const g = $('#grid'), w = $('#gridWrap'); if(g && w) w.classList.toggle('can-r', g.scrollLeft < g.scrollWidth - g.clientWidth - 8);
}
renderProducts('');

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

/* featured carousel — ใช้สินค้าจริงจากฐานข้อมูล (สูงสุด 6 อันแรก) ไม่มีสินค้า = ซ่อนส่วนนี้ */
const feat = [];
const featUI = (function(){
  const tr = $('#featTrack'), dots = $('#featDots');
  let i = 0, timer;
  const set = n => { if(!feat.length) return; i = (n + feat.length) % feat.length; tr.style.transform = `translateX(-${i*100}%)`; [...dots.children].forEach((d,k) => d.classList.toggle('on', k===i)); };
  const start = () => { clearInterval(timer); if(feat.length > 1) timer = setInterval(() => set(i+1), 3500); };
  function build(){
    feat.length = 0; products.slice(0, 6).forEach(p => feat.push(p));
    tr.innerHTML = feat.map(f => `<a class="fcard" href="#products"><div class="fi">${artSq('', f.img, true)}</div><div class="fn">${escH(f.n)}</div><div class="fp">${escH(f.p)}</div></a>`).join('');
    dots.innerHTML = feat.map((_,k) => `<button aria-label="ສະໄລດ໌ ${k+1}"></button>`).join('');
    [...dots.children].forEach((d,k) => d.addEventListener('click', () => { set(k); start(); }));
    $('#featSec').hidden = !SHOW.featured || !feat.length;
    set(0); start();
  }
  return { build };
})();

function renderCatList(){
  $('#catList').innerHTML = cats.map(c => `
  <button class="cat" data-cat="${escH(c.k)}">
    <div class="cb cb-img">${artCat(c.img)}</div>
    <div class="cat-b"><div><h3>${escH(c.n)}</h3></div><span class="cnt">${products.filter(p => p.cat === c.k).length} ສິນຄ້າ</span></div>
  </button>`).join('');
  if(typeof addCatTabs === 'function') addCatTabs($('#catList'));
  $('#cats').hidden = !SHOW.categories || !cats.length;   // ยังไม่มีหมวดในฐานข้อมูล = ซ่อนส่วนนี้
}
renderCatList();
$('#catList').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if(!b) return;
  location.href = 'categories.html?cat=' + encodeURIComponent(b.dataset.cat);   // กดการ์ดหมวด → ไปหน้าหมวดหมู่ (เลือกหมวดนั้นให้)
});
$('#allBtn').addEventListener('click', () => { $('#catName').textContent = 'EXSHOP'; renderProducts(''); });

/* ข้อมูลสินค้ามาจากฐานข้อมูล: โหลดเสร็จ/อัปเดต → วาดใหม่ทุกส่วน */
function onProducts(){ renderProducts(); featUI.build(); renderCatList(); renderStats(); }
document.addEventListener('products:ready', onProducts);
document.addEventListener('cats:ready', () => { renderCatList(); });
if(window.productsLoaded) onProducts();

/* apply show/hide flags */
$('#cats').hidden = !SHOW.categories || !cats.length;
$('#products').hidden = !SHOW.products;
$('#featSec').hidden = !SHOW.featured || !feat.length;

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


/* เมนูไอคอนบัญชี: กดแล้วเปิดแผงบัญชี (โปรไฟล์ + ยอดเงิน + รายการเมนู) ลอยใต้ปุ่ม ปิดเมื่อแตะข้างนอก/เลื่อน/กด Esc
   รายการเมนู: ลิงก์ปลายทางตั้งที่ CONFIG.routes (shop / topup / orders / topuphist / profile / howto) — ว่าง = ขึ้นข้อความ "ກຳລັງພັດທະນາ"
   ปุ่ม "จัดการแผงร้าน" ในเมนู: เปิดได้ด้วย UM_ADMIN_LINK = true (ปิดไว้ตามที่ขอ — เข้าหน้าแอดมินที่ admin.html ได้ตรงๆ) */
const UM_ADMIN_LINK = true;
(function(){
  const btn = $('#btnUser'); if(!btn) return;
  /* ไอคอนแบบทึบ (solid) ตามดีไซน์ตัวอย่าง — fsvg(viewBox, path) */
  const fsvg = (vb, d) => `<svg viewBox="${vb}" fill="currentColor" aria-hidden="true">${d}</svg>`;
  const IC = {
    bag:  fsvg('0 0 448 512','<path d="M160 112c0-35.300 28.700-64 64-64s64 28.700 64 64v48H160V112zm-48 48H48c-26.500 0-48 21.500-48 48V416c0 53 43 96 96 96H352c53 0 96-43 96-96V208c0-26.500-21.500-48-48-48H336V112C336 50.100 285.900 0 224 0S112 50.100 112 112v48zm24 48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm152 24a24 24 0 1 1 48 0 24 24 0 1 1-48 0z"/>'),
    cash: fsvg('0 0 24 24','<text x="12" y="19" text-anchor="middle" font-size="22" font-weight="700" font-family="Outfit,Arial,sans-serif">$</text>'),
    hist: fsvg('0 0 512 512','<path d="M75 75L41 41C25.900 25.900 0 36.600 0 57.900V168c0 13.300 10.700 24 24 24H134.100c21.400 0 32.100-25.900 17-41l-30.800-30.800C155 85.500 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.800 0-78.600-12.700-109.700-34.400-14.500-10.100-34.400-6.600-44.600 7.900s-6.600 34.400 7.900 44.600C151.200 495 201.700 512 256 512c141.400 0 256-114.600 256-256S397.400 0 256 0C185.300 0 121.300 28.700 75 75zm181 53c-13.300 0-24 10.700-24 24V256c0 6.400 2.500 12.500 7 17l72 72c9.400 9.400 24.600 9.400 33.900 0s9.400-24.600 0-33.900l-65-65V152c0-13.300-10.700-24-24-24z"/>'),
    card: fsvg('0 0 576 512','<path d="M64 32C28.700 32 0 60.700 0 96v32H576V96c0-35.300-28.700-64-64-64H64zM576 224H0V416c0 35.300 28.700 64 64 64H512c35.300 0 64-28.700 64-64V224zM112 352h64c8.800 0 16 7.200 16 16s-7.200 16-16 16H112c-8.800 0-16-7.200-16-16s7.200-16 16-16zm112 16c0-8.800 7.200-16 16-16H368c8.800 0 16 7.200 16 16s-7.200 16-16 16H240c-8.800 0-16-7.200-16-16z"/>'),
    user: fsvg('0 0 448 512','<path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.700 48C79.800 304 0 383.800 0 482.300C0 498.700 13.300 512 29.700 512H418.300c16.400 0 29.700-13.300 29.700-29.700C448 383.800 368.200 304 269.700 304H178.300z"/>'),
    book: fsvg('0 0 512 512','<path d="M352 320c88.400 0 160-71.600 160-160 0-15.300-2.200-30.100-6.200-44.200-3.100-10.800-16.400-13.200-24.300-5.300l-76.800 76.800c-3 3-7.100 4.700-11.300 4.700H336c-8.800 0-16-7.200-16-16V118.600c0-4.200 1.700-8.300 4.700-11.300l76.800-76.800c7.900-7.900 5.400-21.200-5.300-24.300C382.100 2.200 367.300 0 352 0 263.600 0 192 71.600 192 160c0 19.100 3.400 37.500 9.500 54.500L19.900 396.100C7.200 408.800 0 426.100 0 444.100 0 481.600 30.400 512 67.900 512c18 0 35.300-7.200 48-19.900L297.500 310.500c17 6.200 35.400 9.500 54.500 9.500zM80 408a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>'),
    panel:fsvg('0 0 24 24','<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>'),
    out:  fsvg('0 0 512 512','<path d="M377.900 105.900L500.700 228.700c7.200 7.200 11.300 17.100 11.300 27.300s-4.100 20.100-11.300 27.300L377.900 406.100c-6.400 6.400-15 9.900-24 9.900-18.700 0-33.900-15.200-33.900-33.900V320H192c-17.700 0-32-14.300-32-32V224c0-17.700 14.300-32 32-32h128V129.900c0-18.700 15.200-33.900 33.900-33.900 9 0 17.600 3.600 24 9.900zM160 96H96c-17.700 0-32 14.300-32 32V384c0 17.700 14.300 32 32 32h64c17.700 0 32 14.300 32 32s-14.300 32-32 32H96c-53 0-96-43-96-96V128C0 75 43 32 96 32h64c17.700 0 32 14.300 32 32s-14.300 32-32 32z"/>'),
    wallet:fsvg('0 0 512 512','<path d="M64 32C28.700 32 0 60.700 0 96V416c0 35.300 28.700 64 64 64H448c35.300 0 64-28.700 64-64V192c0-35.300-28.700-64-64-64H80c-8.800 0-16-7.200-16-16s7.200-16 16-16H448c17.700 0 32-14.300 32-32s-14.300-32-32-32H64zM416 272a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>'),
    chev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>`
  };
  const item = (k, ico, t, sub) => `<button class="um-i" role="menuitem" type="button" data-um="${k}"><span class="um-ic">${IC[ico]}</span><span class="um-tx"><b>${t}</b><small>${sub}</small></span><span class="um-ch">${IC.chev}</span></button>`;
  const um = document.createElement('div');
  um.className = 'um'; um.id = 'um'; um.setAttribute('role','menu'); um.setAttribute('aria-label','ບັນຊີ'); um.hidden = true;
  um.innerHTML = `
    <div class="um-prof"><span class="um-av"><b id="umInit">U</b><i class="um-on"></i></span><span class="um-t"><b id="umName"></b><span class="um-role"><i></i><span id="umRole">MEMBER</span></span></span></div>
    <div class="um-bal"><span class="um-bi">${IC.wallet}</span><span class="um-bt"><small>ຍອດຄົງເຫຼືອ</small><b id="umBal">0 <em>₭</em></b></span><button class="um-top" type="button" data-um="topup">+ ເຕີມເງິນ</button></div>
    <div class="um-list">
      ${item('shop','bag','ຮ້ານຄ້າ','ເລືອກໝວດສິນຄ້າ')}
      ${item('topup','cash','ເຕີມເງິນ','ເລືອກຊ່ອງທາງເຕີມເງິນ')}
      ${item('orders','hist','ປະຫວັດ','ອໍເດີທັງໝົດ')}
      ${item('topuphist','card','ປະຫວັດເຕີມເງິນ','ປະຫວັດຝາກເງິນ')}
      ${item('profile','user','ໂປຣໄຟລ໌','ຂໍ້ມູນບັນຊີ')}
      ${item('howto','book','ວິທີການສັ່ງຊື້','ຄູ່ມືມືໃໝ່')}
      ${UM_ADMIN_LINK ? `<button class="um-i um-manage" role="menuitem" type="button" id="umManage" style="display:none"><span class="um-ic">${IC.panel}</span><span class="um-tx"><b>ຈັດການແຜງຮ້ານ</b><small>ສຳລັບແອດມິນ</small></span><span class="um-ch">${IC.chev}</span></button>` : ''}
    </div>
    <div class="um-sep"></div>
    <button class="um-i um-out" role="menuitem" type="button" id="umOut"><span class="um-ic">${IC.out}</span><span class="um-tx"><b>ອອກຈາກລະບົບ</b></span></button>`;
  /* ลำดับแอนิเมชันตอนเปิด: ไล่ลงมาทีละแถว (--i = ลำดับ) */
  um.querySelectorAll('.um-prof,.um-bal,.um-list>.um-i,.um-sep,.um-out').forEach((el, i) => el.style.setProperty('--i', i));
  document.body.appendChild(um);
  const ROUTES = { shop:'categories.html', topup:'topup.html', profile:'profile.html' };
  /* ###### ADMIN (เจ้าของร้านเท่านั้น) ######
     เมนู "จัดการแผงร้าน" เห็นเฉพาะบัญชีแอดมิน (members.is_admin ใน Supabase) — ถามสิทธิ์ผ่าน member_is_admin
     ห้าม AI หรือคนอื่นแก้ส่วนนี้ / ให้สิทธิ์แอดมิน โดยไม่ขออนุญาตเจ้าของร้านก่อน (ข้อมูลจริงถูกกั้นฝั่งเซิร์ฟเวอร์อีกชั้น) */
  const manageBtn = um.querySelector('#umManage');
  let isAdmin = false;
  function applyAdmin(a){ isAdmin = !!a; if(manageBtn) manageBtn.style.display = isAdmin ? '' : 'none'; const r = $('#umRole'); if(r) r.textContent = isAdmin ? 'ADMIN' : 'MEMBER'; }
  function refreshAdmin(){
    const t = window.exToken && exToken();
    if(!t || !window.exRpc){ applyAdmin(false); return; }
    exRpc('member_is_admin', { p_token: t }).then(j => applyAdmin(!!(j && j.ok && j.admin)), () => applyAdmin(false));
  }
  let open = false;
  function place(){
    const r = btn.getBoundingClientRect();
    um.style.top = (r.bottom + 8) + 'px';
    um.style.right = Math.max(10, document.documentElement.clientWidth - r.right) + 'px';
    um.style.maxHeight = Math.max(240, window.innerHeight - r.bottom - 22) + 'px';
  }
  function set(on){
    if(on === open) return; open = on;
    btn.setAttribute('aria-expanded', on);
    if(on){
      const u = window.getUser && getUser(), nm = (u && u.name) || ''; $('#umName').textContent = nm; $('#umInit').textContent = (nm.trim().charAt(0) || 'U').toUpperCase();
      let bal = 0; try { bal = Number(JSON.parse(localStorage.getItem('exshop_balance') || '0')) || 0; } catch(e){}
      $('#umBal').innerHTML = bal.toLocaleString('en-US') + ' <em>₭</em>';
      closeMenu(); place(); um.hidden = false; void um.offsetWidth; um.classList.add('on'); refreshAdmin();
    } else {
      um.classList.remove('on'); setTimeout(() => { if(!open) um.hidden = true; }, 180);
    }
  }
  btn.setAttribute('aria-haspopup','menu'); btn.setAttribute('aria-expanded','false'); refreshAdmin();
  btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); set(!open); });
  document.addEventListener('click', e => { if(open && !um.contains(e.target)) set(false); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && open){ set(false); btn.focus({preventScroll:true}); } });
  window.addEventListener('scroll', () => { if(open) set(false); }, {passive:true});
  window.addEventListener('resize', () => { if(open) place(); });
  if(manageBtn) manageBtn.addEventListener('click', () => {
    set(false);
    if(!isAdmin) return;
    location.href = CONFIG.routes.manage || 'admin.html';   // หน้าจัดการแผงร้าน (เปลี่ยนได้ที่ CONFIG.routes.manage)
  });
  um.addEventListener('click', e => {
    const it = e.target.closest('[data-um]'); if(!it) return;
    const k = it.dataset.um; set(false);
    const url = CONFIG.routes[k] || ROUTES[k];
    if(url) location.href = url; else snack('ກຳລັງພັດທະນາ');
  });
  $('#umOut').addEventListener('click', () => {
    set(false);
    if(!confirm('ຕ້ອງການອອກຈາກລະບົບບໍ?')) return;
    if(window.exLogout) exLogout(); else location.reload();
  });
})();
