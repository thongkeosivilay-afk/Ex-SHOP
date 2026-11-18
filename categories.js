/* ===== หน้าหมวดหมู่ (categories.html) =====
   ข้อมูลมาจาก data.js (products = ดึงจาก Supabase, cats = รายการหมวดในไฟล์นั้น)
   ฟังก์ชัน: ค้นหา (ชื่อสินค้า/ชื่อหมวด, ไฮไลต์คำที่เจอ, หลายคำพร้อมกัน), เลือกหมวด (ชิป/การ์ด),
            เรียงลำดับ, กรองเฉพาะที่พร้อมขาย, ประวัติค้นหาล่าสุด, ล้างตัวกรอง, จำสถานะใน URL */
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const ic = id => `<svg class="i"><use href="#${id}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const norm = s => String(s == null ? '' : s).normalize('NFC').replace(/[​‌‍]/g, '').toLowerCase();

  /* ----- ตั้งค่า ----- */
  const RECENT_KEY = 'recentSearch', RECENT_MAX = 6;
  const SORTS = ['default','sold','price-asc','price-desc','name','stock'];
  const BUY_URL = p => 'confirm.html?p=' + encodeURIComponent(p.id);   // กดซื้อ → หน้ายืนยันสั่งซื้อ

  const state = { q:'', cat:'all', sort:'default', stock:false };
  let shown = [];   // รายการสินค้าที่กำลังแสดง (ไว้อ้างจาก data-buy)

  /* ----- helper: ข้อมูลสินค้า ----- */
  const catOf = k => cats.find(c => c.k === k);
  const priceOf = p => parseFloat(String(p.p).replace(/[^\d.]/g, '')) || 0;
  const readyToSell = p => !p.update && !p.soldout && +p.left > 0;
  const tokens = () => norm(state.q).split(/\s+/).filter(Boolean);

  function productHay(p){ const c = catOf(p.cat) || {}; return norm([p.n, c.n].join(' ')); }
  function catHay(c){ return norm([c.n].join(' ')); }
  const matchAll = (hay, toks) => toks.every(t => hay.includes(t));

  /* สินค้าที่ผ่านคำค้น + สวิตช์พร้อมขาย (ยังไม่กรองหมวด — ใช้นับจำนวนบนชิป) */
  function baseList(){
    const toks = tokens();
    return products.filter(p => (!toks.length || matchAll(productHay(p), toks)) && (!state.stock || readyToSell(p)));
  }
  function sortList(list){
    const l = list.slice();
    switch(state.sort){
      case 'sold': l.sort((a,b) => (+b.sold||0) - (+a.sold||0)); break;
      case 'price-asc': l.sort((a,b) => priceOf(a) - priceOf(b)); break;
      case 'price-desc': l.sort((a,b) => priceOf(b) - priceOf(a)); break;
      case 'stock': l.sort((a,b) => (+b.left||0) - (+a.left||0)); break;
      case 'name': l.sort((a,b) => String(a.n).localeCompare(String(b.n), 'en', {sensitivity:'base'})); break;
    }
    return l;
  }

  /* ไฮไลต์คำค้นในข้อความ (escape แล้วทุกส่วน) */
  function hl(text){
    const toks = tokens();
    if(!toks.length) return esc(text);
    const re = new RegExp('(' + toks.map(escRe).join('|') + ')', 'gi');
    return String(text).split(re).map((part, i) => i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('');
  }

  /* ----- อนิเมชันเลื่อนตอนเปลี่ยนหมวด -----
     เนื้อหาเก่าเลื่อนออก → วาดใหม่ → เนื้อหาใหม่เลื่อนเข้ามาจากทิศทางเดียวกับที่ชิปถูกเลือก
     (เลือกหมวดที่อยู่ขวา = เลื่อนไปทางซ้าย, เลือกหมวดที่อยู่ซ้าย = เลื่อนไปทางขวา) */
  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const catOrder = () => ['all'].concat(cats.map(c => c.k));
  const dirTo = k => { const o = catOrder(), a = o.indexOf(state.cat), b = o.indexOf(k); return b === a ? 0 : (b > a ? 1 : -1); };
  let sliding = false, pending = null;
  function changeCat(k){
    const dir = dirTo(k);
    const apply = () => { state.cat = k; render(); };
    const m = $('.ct-main');
    if(!dir || reduceMotion() || !m || !m.animate){ apply(); return; }
    if(sliding){ pending = {apply, dir}; return; }   // กดรัว: ใช้ค่าล่าสุดเท่านั้น
    sliding = true;
    const out = m.animate(
      [{opacity:1, transform:'translateX(0)'}, {opacity:0, transform:`translateX(${-dir * 36}px)`}],
      {duration:150, easing:'cubic-bezier(.4,0,1,1)', fill:'forwards'});
    const enter = job => {
      job.apply();
      const inn = m.animate(
        [{opacity:0, transform:`translateX(${job.dir * 56}px)`}, {opacity:1, transform:'translateX(0)'}],
        {duration:420, easing:'cubic-bezier(.2,.9,.3,1)'});
      out.cancel();
      inn.onfinish = inn.oncancel = () => {
        if(pending){ const p = pending; pending = null; sliding = false; changeCatJob(p); }
        else sliding = false;
      };
    };
    out.onfinish = () => enter({apply, dir});
  }
  function changeCatJob(job){ job.apply(); }   // งานที่ค้างตอนกดรัว: วาดทันที

  /* ----- วาดหน้า ----- */
  function renderChips(){
    const base = baseList();
    const total = base.length;
    const chips = [{k:'all', n:'ທັງໝົດ', c:total}].concat(cats.map(c => ({k:c.k, n:c.n, c:base.filter(p => p.cat === c.k).length})));
    const box = $('#ctChips');
    const have = box.querySelectorAll('[data-chip]');
    const same = have.length === chips.length && chips.every((c, i) => have[i].dataset.chip === c.k);
    const dimOf = c => c.k !== 'all' && !c.c && (state.q || state.stock);
    if(same){
      /* อัปเดตของเดิม ไม่สร้างใหม่ → สีชิปเปลี่ยนแบบนุ่ม ๆ และเลื่อนแถบชิปได้ลื่น */
      chips.forEach((c, i) => {
        const el = have[i];
        el.classList.toggle('on', state.cat === c.k);
        el.classList.toggle('dim', !!dimOf(c));
        el.setAttribute('aria-selected', state.cat === c.k);
        const b = el.querySelector('b'); if(b && b.textContent !== String(c.c)) b.textContent = c.c;
      });
    } else {
      box.innerHTML = chips.map(c =>
        `<button type="button" class="ct-chip${state.cat === c.k ? ' on' : ''}${dimOf(c) ? ' dim' : ''}" role="tab" aria-selected="${state.cat === c.k}" data-chip="${esc(c.k)}">${esc(c.n)}<b>${c.c}</b></button>`
      ).join('');
    }
    centerChip(box);
  }
  function centerChip(box){
    const on = box.querySelector('.on'); if(!on) return;
    const left = on.offsetLeft - (box.clientWidth - on.offsetWidth) / 2;
    try { box.scrollTo({ left: Math.max(0, left), behavior: reduceMotion() ? 'auto' : 'smooth' }); }
    catch(e){ box.scrollLeft = Math.max(0, left); }
  }

  function renderCats(){
    const sec = $('#ctCatsSec');
    const toks = tokens();
    const showCats = state.cat === 'all';
    let list = cats.filter(c => !toks.length || matchAll(catHay(c), toks) || baseList().some(p => p.cat === c.k));
    sec.hidden = !showCats || !list.length;
    if(sec.hidden) return;
    $('#catCount').textContent = list.length;
    $('#catList').innerHTML = list.map(c => `
      <button class="cat${state.cat === c.k ? ' is-on' : ''}" data-cat="${esc(c.k)}" type="button">
        <div class="cb cb-img">${artCat(c.img)}</div>
        <div class="cat-b"><div><h3>${hl(c.n)}</h3></div><span class="cnt">${products.filter(p => p.cat === c.k).length} ສິນຄ້າ</span></div>
      </button>`).join('');
    if(typeof addCatTabs === 'function') addCatTabs($('#catList'));
  }

  function renderProducts(){
    let list = baseList();
    if(state.cat !== 'all') list = list.filter(p => p.cat === state.cat);
    shown = sortList(list);
    const c = catOf(state.cat);
    $('#prodTitle').textContent = state.q ? 'ຜົນການຄົ້ນຫາ' : (c ? c.n : 'ສິນຄ້າທັງໝົດ');
    $('#prodCount').textContent = shown.length + ' ລາຍການ';
    $('#grid').innerHTML = shown.length
      ? shown.map((p, i) => productCardHTML(p, i, hl(p.n))).join('')
      : emptyHTML(c);
  }

  function emptyHTML(c){
    if(!window.productsLoaded) return `<div class="ct-empty">${ic('search')}<b>ກຳລັງໂຫຼດສິນຄ້າ...</b></div>`;
    const filtered = state.q || state.stock || state.cat !== 'all';
    const msg = state.q ? 'ລອງຄຳຄົ້ນຫາອື່ນ ຫຼື ລ້າງຕົວກອງ'
      : state.stock ? 'ຍັງບໍ່ມີສິນຄ້າທີ່ພ້ອມຂາຍໃນຕອນນີ້'
      : c ? 'ຍັງບໍ່ມີສິນຄ້າໃນໝວດນີ້' : 'ຍັງບໍ່ມີສິນຄ້າ';
    return `<div class="ct-empty">${ic('search')}<b>${state.q ? 'ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ' : 'ບໍ່ມີສິນຄ້າ'}</b><p>${msg}</p>${filtered ? `<button type="button" data-reset>ລ້າງຕົວກອງທັງໝົດ</button>` : ''}</div>`;
  }

  function renderStatus(){
    const el = $('#ctStatus');
    const active = state.q || state.stock || state.cat !== 'all' || state.sort !== 'default';
    if(!active){ el.innerHTML = ''; return; }
    el.innerHTML = `<span>ພົບ ${shown.length} ລາຍການ</span><button type="button" data-reset>${ic('reset')}<span>ລ້າງຕົວກອງ</span></button>`;
  }

  function render(){
    renderChips(); renderCats(); renderProducts(); renderStatus();
    $('#qClear').hidden = !state.q;
    $('#stockOnly').setAttribute('aria-checked', state.stock);
    $('#sort').value = state.sort;
    syncURL();
  }

  /* ----- URL ----- (ส่งลิงก์ค้นหา/หมวดให้คนอื่นได้ เช่น categories.html?cat=fivem&q=unban) */
  function syncURL(){
    const p = new URLSearchParams();
    if(state.q) p.set('q', state.q);
    if(state.cat !== 'all') p.set('cat', state.cat);
    if(state.sort !== 'default') p.set('sort', state.sort);
    if(state.stock) p.set('stock', '1');
    const s = p.toString();
    try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); } catch(e){}
  }
  function readURL(){
    const p = new URLSearchParams(location.search);
    state.q = (p.get('q') || '').slice(0, 80);
    const c = p.get('cat'); state.cat = c && catOf(c) ? c : 'all';
    const s = p.get('sort'); state.sort = SORTS.includes(s) ? s : 'default';
    state.stock = p.get('stock') === '1';
    $('#q').value = state.q;
  }

  /* ----- ประวัติค้นหาล่าสุด ----- */
  const getRecent = () => { try { const r = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); return Array.isArray(r) ? r.filter(x => typeof x === 'string').slice(0, RECENT_MAX) : []; } catch(e){ return []; } };
  const setRecent = r => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(r)); } catch(e){} };
  function saveRecent(){
    const q = state.q.trim();
    if(q.length < 2) return;
    setRecent([q].concat(getRecent().filter(x => x.toLowerCase() !== q.toLowerCase())).slice(0, RECENT_MAX));
  }
  function showRecent(){
    const box = $('#ctRecent'), r = getRecent();
    if(state.q || !r.length){ box.hidden = true; return; }
    $('#recentList').innerHTML = r.map(x => `<button type="button" data-recent="${esc(x)}">${esc(x)}</button>`).join('');
    box.hidden = false;
  }
  const hideRecent = () => { $('#ctRecent').hidden = true; };

  /* ----- เหตุการณ์ ----- */
  const q = $('#q');
  let t;
  q.addEventListener('input', () => {
    state.q = q.value.slice(0, 80);
    clearTimeout(t);
    t = setTimeout(render, 120);
    if(state.q) hideRecent(); else showRecent();
  });
  q.addEventListener('focus', showRecent);
  q.addEventListener('blur', () => { setTimeout(hideRecent, 120); if(shown.length) saveRecent(); });
  q.addEventListener('keydown', e => {
    if(e.key === 'Escape'){ if(state.q){ state.q = ''; q.value = ''; render(); showRecent(); } else q.blur(); }
  });
  $('#ctForm').addEventListener('submit', e => {
    e.preventDefault();
    clearTimeout(t); state.q = q.value.slice(0, 80); render(); saveRecent();
    q.blur();
    scrollToResults();
  });
  $('#qClear').addEventListener('click', () => { state.q = ''; q.value = ''; render(); q.focus(); });

  $('#ctRecent').addEventListener('mousedown', e => e.preventDefault());   // กดแล้วไม่ให้ช่องค้นหาเสียโฟกัส
  $('#ctRecent').addEventListener('click', e => {
    if(e.target.closest('#recentClear')){ setRecent([]); hideRecent(); return; }
    const b = e.target.closest('[data-recent]'); if(!b) return;
    state.q = b.dataset.recent; q.value = state.q; render(); hideRecent(); q.blur(); scrollToResults();
  });

  $('#ctChips').addEventListener('click', e => {
    const b = e.target.closest('[data-chip]'); if(!b) return;
    changeCat(b.dataset.chip);
  });
  $('#catList').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if(!b) return;
    changeCat(b.dataset.cat); scrollToResults();
  });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
  $('#stockOnly').addEventListener('click', () => { state.stock = !state.stock; render(); });

  function resetAll(){ state.q = ''; state.cat = 'all'; state.sort = 'default'; state.stock = false; q.value = ''; render(); }
  document.addEventListener('click', e => { if(e.target.closest('[data-reset]')) resetAll(); });

  /* กดการ์ดสินค้า */
  let snackT;
  function snack(msg){ const s = $('#snack'); s.textContent = msg; s.classList.add('show'); clearTimeout(snackT); snackT = setTimeout(() => s.classList.remove('show'), 2400); }
  function buy(el){
    const p = shown[+el.dataset.buy]; if(!p) return;
    if(p.update || p.soldout){ snack(p.update ? 'ກຳລັງອັບເດດ' : 'ສິນຄ້າໝົດສະຕັອກ'); return; }
    location.href = BUY_URL(p);
  }
  $('#grid').addEventListener('click', e => { const a = e.target.closest('[data-buy]'); if(a) buy(a); });
  $('#grid').addEventListener('keydown', e => {
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const a = e.target.closest('[data-buy]'); if(a){ e.preventDefault(); buy(a); }
  });

  /* กด "/" เพื่อไปที่ช่องค้นหา */
  document.addEventListener('keydown', e => {
    if(e.key === '/' && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)){ e.preventDefault(); q.focus(); }
  });

  function scrollToResults(){
    const sticky = $('.ct-sticky'), sec = $('#ctProdsSec');
    const pinned = parseFloat(getComputedStyle(sticky).top) + sticky.offsetHeight;
    window.scrollTo({ top: Math.max(0, sec.getBoundingClientRect().top + window.scrollY - pinned - 8), behavior: 'smooth' });
  }

  /* ธีมสว่าง/มืด (แชร์ค่าเดียวกับหน้าแรก) */
  (function(){
    const root = document.documentElement, btn = $('#btnTheme');
    const apply = th => { root.dataset.theme = th; btn.innerHTML = ic(th === 'dark' ? 'moon' : 'sun'); };
    apply(root.dataset.theme === 'dark' ? 'dark' : 'light');
    btn.addEventListener('click', () => {
      const n = root.dataset.theme === 'dark' ? 'light' : 'dark'; apply(n);
      try { localStorage.setItem('theme', n); } catch(e){}
    });
  })();

  /* ปุ่มกลับ: ถ้ามีหน้าก่อนหน้าให้ย้อนกลับ ไม่งั้นไปหน้าแรก */
  $('#ctBack').addEventListener('click', e => {
    if(document.referrer && history.length > 1){ e.preventDefault(); history.back(); }
  });

  readURL();
  render();
  /* สินค้ามาจากฐานข้อมูล: โหลดเสร็จ/อัปเดต → วาดใหม่ */
  document.addEventListener('products:ready', render);
  document.addEventListener('agent:ready', render);
  /* หมวดหมู่มาจากฐานข้อมูล: โหลดเสร็จ → อ่านหมวดจากลิงก์ (?cat=...) แล้ววาดใหม่ */
  document.addEventListener('cats:ready', () => {
    const c = new URLSearchParams(location.search).get('cat');
    if(state.cat === 'all' && c && catOf(c)) state.cat = c;
    else if(state.cat !== 'all' && !catOf(state.cat)) state.cat = 'all';
    render();
  });
})();
