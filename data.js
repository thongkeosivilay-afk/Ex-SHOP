/* ===== ข้อมูลกลาง: สินค้า + หมวดหมู่ + ฟังก์ชันสร้างการ์ด =====
   ใช้ร่วมกันทั้ง index.html (script.js) และ categories.html (categories.js)
   สินค้า: เพิ่ม/แก้/ลบที่หน้าแอดมิน (ดึงจาก Supabase) — หมวดหมู่: แก้รายการ cats ในไฟล์นี้ ============================== */
/* รูปสินค้า/หมวดหมู่: ใส่ path รูปที่ IMG (ใช้ทุกการ์ด) หรือใส่ img:'...' ในแต่ละสินค้า/หมวด
   ถ้าเว้นว่างไว้ จะโชว์ข้อความแนะนำขนาดรูปแทน
   - สินค้า: 1000 × 960 px   - หมวดหมู่: 1500 × 512 px   - แบนเนอร์หน้าแรก: 1500 × 512 px */
const IMG = { product:'', category:'', banner:'' };
/* ชื่อร้าน + โลโก้ (แสดงมุมซ้ายของแถบหัวเว็บ) — logo: ใส่ path/URL รูป (แนะนำสี่เหลี่ยมจัตุรัส 256×256 px)
   ถ้าเว้นว่าง จะโชว์ตัวย่อ 2 ตัวแรกของชื่อร้านในวงกลมสีแดงแทน */
const SITE = { fit:{ p:false, c:false }, recSpeed:40, name:'EXSHOP', logo:'', desc:'', marquee:'', announce:'', why:{}, whyCfg:{ s:5, b:9 }, stat:{}, real:{} };
/* ตั้งค่าเว็บไซต์ (ชื่อ / โลโก้ / แบนเนอร์ / คำอธิบาย) — ดึงจาก Supabase (shop_site) แก้ได้ที่หน้าแอดมิน → ການຕັ້ງຄ່າເວັບໄຊ
   โหลดเสร็จแล้วยิงอีเวนต์ 'site:ready' ให้หน้าวาดส่วนหัว/แบนเนอร์/คำอธิบายใหม่ */
/* ===== ปรับภาพพอดีอัตโนมัติ (เปิด/ปิดที่ แอดมิน → ตั้งค่าเว็บ → ปรับภาพพอดีอัตโนมัติ) =====
   เปิดแล้ว: ความ "ยาว" ของการ์ดสินค้า / การ์ดหมวดหมู่ จะปรับตามสัดส่วนรูปจริง (ความกว้างการ์ดคงเดิม) · ปิด = ใช้สัดส่วนเดิมของการ์ด
   ทำงานด้วย class บน <html>: fit-p (สินค้า) · fit-c (หมวดหมู่) + ตัวแปร --ar บนกล่องรูปแต่ละใบ (ดู style.css / catcard.css) */
const FIT_LIM = [0.4, 3.2];   // ช่วงสัดส่วน กว้าง/สูง ที่ยอมให้ปรับ (กันรูปแปลก ๆ ทำให้การ์ดสูง/เตี้ยเกินไป)
function exFitBox(img){
  if(!(img instanceof HTMLImageElement)) return null;
  const pb = img.closest('.pci .pimg'); if(pb) return { box: pb, on: SITE.fit.p };
  const cb = img.closest('.cat .cb-img'); if(cb) return { box: cb, on: SITE.fit.c };
  return null;
}
function exFitImg(img){
  const t = exFitBox(img); if(!t) return;
  if(!t.on){ t.box.style.removeProperty('--ar'); return; }
  if(img.loading === 'lazy') img.loading = 'eager';   // ต้องรู้ขนาดรูปก่อน จึงไม่รอโหลดแบบ lazy
  if(img.complete && img.naturalWidth > 0 && img.naturalHeight > 0){
    const r = Math.max(FIT_LIM[0], Math.min(FIT_LIM[1], img.naturalWidth / img.naturalHeight));
    t.box.style.setProperty('--ar', r.toFixed(4));
  }
}
function exFitScan(root){ (root || document).querySelectorAll('.pci .pimg img, .cat .cb-img img').forEach(exFitImg); }
function exFitApply(){
  const h = document.documentElement;
  h.classList.toggle('fit-p', !!SITE.fit.p);
  h.classList.toggle('fit-c', !!SITE.fit.c);
  exFitScan();
}
document.addEventListener('load', e => { if(e.target && e.target.tagName === 'IMG') exFitImg(e.target); }, true);   // load ไม่ bubble → ดักตอน capture
new MutationObserver(ms => {
  if(!SITE.fit.p && !SITE.fit.c) return;
  ms.forEach(m => m.addedNodes.forEach(n => {
    if(n.nodeType !== 1) return;
    if(n.tagName === 'IMG') exFitImg(n); else exFitScan(n);
  }));
}).observe(document.documentElement, { childList: true, subtree: true });

const SCACHE = 'exSiteCache';
function setSite(j){
  if(!j || typeof j !== 'object') return;
  if(j.name) SITE.name = String(j.name);
  SITE.logo = j.logo || '';
  SITE.desc = j.description || '';
  SITE.marquee = j.marquee || '';
  SITE.announce = j.announce || '';
  SITE.stat = { users:j.stat_users, products:j.stat_products, orders:j.stat_orders, sold:j.stat_sold };
  SITE.real = { users:j.real_users, orders:j.real_orders };
  /* ตั้งค่าการสลับการ์ด "ทำไมต้องเลือกเรา": เก็บต่อท้ายข้อความการ์ด 1 เป็น \n#why=วินาทีที่คั้ง,เวลาเบลอ(หน่วย 0.1 วินาที) */
  const wm = /\n#why=(\d+),(\d+)\s*$/.exec(String(j.why1_text || ''));
  SITE.whyCfg = { s: wm ? Math.max(2, Math.min(20, +wm[1])) : 5, b: wm ? Math.max(2, Math.min(20, +wm[2])) : 9 };
  /* ความเร็วแถบ "ซื้อล่าสุด" (px/วินาที): เก็บต่อท้ายข้อความการ์ด 2 เป็น \n#rec=ตัวเลข */
  /* ปรับภาพพอดีอัตโนมัติ (ปรับเฉพาะ "ความยาว" การ์ดตามสัดส่วนรูป): เก็บต่อท้ายสุดของข้อความการ์ด 2 เป็น \n#fit=สินค้า,หมวดหมู่ (1 = เปิด · 0 = ปิด)
     ลำดับท้ายข้อความ: ...\n#rec=ตัวเลข\n#fit=P,C  (อ่าน #fit ออกก่อน แล้วค่อยอ่าน #rec) */
  const w2raw = String(j.why2_text || '');
  const fm = /\n#fit=([01]),([01])\s*$/.exec(w2raw);
  SITE.fit = { p: !!(fm && fm[1] === '1'), c: !!(fm && fm[2] === '1') };
  const w2 = w2raw.replace(/\n#fit=[01],[01]\s*$/, '');
  const rm = /\n#rec=(\d+)\s*$/.exec(w2);
  SITE.recSpeed = rm ? Math.max(10, Math.min(120, +rm[1])) : 40;
  SITE.why = { t1:j.why1_title||'', d1:String(j.why1_text||'').replace(/\n#why=\d+,\d+\s*$/, ''), t2:j.why2_title||'', d2:w2.replace(/\n#rec=\d+\s*$/, '') };
  exFitApply();
  IMG.banner = j.banner || '';
  document.dispatchEvent(new Event('site:ready'));
}
function loadSite(){
  if(window.EX_NO_FETCH) return Promise.resolve();
  if(!window.EX_NO_CACHE){ try { setSite(JSON.parse(localStorage.getItem(SCACHE) || 'null')); } catch(e){} }
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
  return fetch(EX_DB.url + '/rest/v1/rpc/shop_site', {
    method: 'POST', signal: ctl.signal,
    headers: { 'Content-Type': 'application/json', apikey: EX_DB.key, Authorization: 'Bearer ' + EX_DB.key },
    body: '{}'
  }).then(r => { if(!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(j => { try { localStorage.setItem(SCACHE, JSON.stringify(j)); } catch(e){} setSite(j); })
    .catch(() => {})
    .finally(() => clearTimeout(to));
}
function artSq(key, src, mini){
  src = src || IMG.product;
  if(src) return `<img class="pimg-img" src="${escH(src)}" alt="" loading="lazy" draggable="false">`;
  if(mini) return `<div class="fph">1000×960</div>`;
  return `<div class="pph"><span class="pph-a">ຂະໜາດຮູບທີ່ແນະນຳ</span><span class="pph-n">1000 × 960<small>px</small></span><span class="pph-b">ສຳລັບຮູບສິນຄ້າ</span><span class="pph-c">ຮູບສີ່ຫຼ່ຽມ · PNG ຫຼື JPG</span></div>`;
}
function artBanner(src){
  src = src || IMG.banner;
  if(src) return `<img src="${escH(src)}" alt="" draggable="false">`;
  return `<div class="cph"><span class="cph-a">ຂະໜາດຮູບທີ່ແນະນຳ</span><span class="cph-n">1500 × 512<small>px</small></span><span class="cph-b">ສຳລັບຮູບແບນເນີ · ຮູບແນວນອນ · PNG ຫຼື JPG</span></div>`;
}
function artCat(src){
  src = src || IMG.category;
  if(src) return `<img src="${escH(src)}" alt="" loading="lazy" draggable="false">`;
  return `<div class="cph"><span class="cph-a">ຂະໜາດຮູບທີ່ແນະນຳ</span><span class="cph-n">1500 × 512<small>px</small></span><span class="cph-b">ສຳລັບຮູບໝວດໝູ່ · ຮູບແນວນອນ · PNG ຫຼື JPG</span></div>`;
}

/* การ์ดหมวดหมู่ (ใช้ร่วมกันทั้งหน้าแรกและหน้าหมวดหมู่) — ดีไซน์ตามรูปอ้างอิง
   ชื่อหมวด (มีขีดแดงนำหน้า) อยู่เหนือการ์ด · การ์ดเป็นรูปแบนเนอร์ + รอยบากมุมซ้ายบนมีไอคอนกล่องสีแดง + "จำนวนสินค้า"
   ยังไม่ใส่รูป = พื้นเทาเข้มมีไอคอนกล่องจาง ๆ กลางการ์ด · รูปที่แนะนำ: แนวนอน อัตราส่วน ~3.3:1 (เช่น 1500 × 455 px)
   nameHTML = ชื่อที่ไฮไลต์คำค้นแล้ว (ไม่ใส่ = ใช้ชื่อปกติ) · on = หมวดที่เลือกอยู่ (หน้าหมวดหมู่)
   class "ctab" บนรอยบาก = บอก addCatTabs (cat-trial.js) ว่าการ์ดนี้มีตัวเลขแล้ว ไม่ต้องเติมซ้ำ */
function catCardHTML(c, nameHTML, on){
  const n = products.filter(p => p.cat === c.k).length;
  const CUBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';
  const PKG = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';
  const art = c.img ? `<img src="${escH(c.img)}" alt="" loading="lazy" draggable="false">` : `<div class="cat-ph">${CUBE}</div>`;
  return `<button class="cat${on ? ' is-on' : ''}" data-cat="${escH(c.k)}" type="button">
    <h3 class="cat-nm"><i aria-hidden="true"></i><span>${nameHTML || escH(c.n)}</span></h3>
    <div class="cat-cd">
      <div class="cb cb-img">${art}</div>
      <span class="cat-tg ctab"><span class="cat-tg-bg" aria-hidden="true"></span><span class="cat-tg-in"><span class="cat-ti">${PKG}</span><b>${n}</b><em>ສິນຄ້າ</em></span></span>
    </div>
  </button>`;
}

/* products — ดึงจากฐานข้อมูล Supabase (ฟังก์ชัน shop_products) ไม่มีสินค้าตายตัวในไฟล์แล้ว
   เพิ่ม/แก้/ลบสินค้าที่หน้าแอดมิน (admin.html → ຈັດການສິນຄ້າ & ໝວດໝູ່)
   - products เป็น array เดียวที่ถูกเติมข้อมูลหลังโหลดเสร็จ → ทุกหน้าฟังอีเวนต์ 'products:ready' แล้ววาดใหม่
   - window.productsLoaded = โหลดครั้งแรกเสร็จแล้วหรือยัง (ยังไม่เสร็จ = โชว์ "กำลังโหลด" แทนคำว่าไม่มีสินค้า) */
const products = [];
window.productsLoaded = false;
window.productsFailed = false;
const EX_DB = { url: 'https://mjalctpfeizjukuprqti.supabase.co', key: 'sb_publishable_3EZ-Ulah6h9Xzze_DE0xow_E6iGHNiJ' };
const PCACHE = 'exProductsCache';

const fmtKip = n => '₭' + (Number(n) || 0).toLocaleString('en-US');
const escH = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* รายละเอียดสินค้า (HTML จากตัวแก้ไขในแอดมิน) → กรองให้เหลือแท็ก/สไตล์ที่ปลอดภัยก่อนแสดง (กัน script/onclick แฝง) */
function cleanHTML(html){
  if(!html) return '';
  const OK = {P:1,BR:1,B:1,STRONG:1,I:1,EM:1,U:1,S:1,STRIKE:1,DEL:1,SPAN:1,DIV:1,UL:1,OL:1,LI:1,H1:1,H2:1,H3:1,H4:1,BLOCKQUOTE:1,FONT:1};
  const STY = /^(color|background-color|text-align|font-weight|font-style|text-decoration(-line)?)$/;
  const VAL = /^[#\w\s,.()%-]+$/;
  const doc = new DOMParser().parseFromString('<body>' + html, 'text/html');
  (function walk(n){
    [...n.childNodes].forEach(c => {
      if(c.nodeType === 3) return;
      if(c.nodeType !== 1){ c.remove(); return; }
      if(!OK[c.tagName]){ const t = c.tagName; if(t === 'SCRIPT' || t === 'STYLE' || t === 'IFRAME' || t === 'OBJECT' || t === 'EMBED') { c.remove(); return; } walk(c); while(c.firstChild) c.parentNode.insertBefore(c.firstChild, c); c.remove(); return; }
      [...c.attributes].forEach(a => {
        if(a.name === 'style'){
          const keep = a.value.split(';').map(x => x.trim()).filter(x => { const i = x.indexOf(':'); return i > 0 && STY.test(x.slice(0,i).trim().toLowerCase()) && VAL.test(x.slice(i+1).trim()); });
          keep.length ? c.setAttribute('style', keep.join(';')) : c.removeAttribute('style');
        } else if(!(c.tagName === 'FONT' && a.name === 'color' && VAL.test(a.value))) c.removeAttribute(a.name);
      });
      walk(c);
    });
  })(doc.body);
  return doc.body.innerHTML;
}

/* แถวจากฐานข้อมูล → รูปแบบที่การ์ดสินค้าใช้ */
function mapProduct(r){
  const imgs = Array.isArray(r.imgs) ? r.imgs.filter(Boolean) : [];
  const durs = (Array.isArray(r.durs) ? r.durs : []).map(d => ({ label: String(d.label || ''), price: Number(d.price) || 0, stock: d.stock == null ? null : Number(d.stock) || 0 }));
  const from = durs.length ? Math.min(...durs.map(d => d.price)) : (Number(r.price) || 0);
  return {
    id: r.id, n: r.name || '', cat: r.cat || '',
    p: fmtKip(from), price: from,
    left: String(Number(r.stock) || 0), sold: String(Number(r.sold) || 0),
    img: imgs[0] || '', imgs, desc: r.desc || '', notice: r.notice || '', durs,
    update: r.status === 'update',
    soldout: (Number(r.stock) || 0) <= 0   // สต็อกเป็น 0 = ขึ้นป้ายหมดสีแดงอัตโนมัติ
  };
}
/* ป้าย "ຍອດນິຍົມ" — ขึ้นเฉพาะสินค้าที่ขายดีของแต่ละหมวดหมู่ (p.hot = true)
   นับจากจำนวน "ຂາຍແລ້ວ" ในหมวดเดียวกัน เอาอันดับต้น ๆ: ประมาณ 1 ใน 3 ของสินค้าในหมวด อย่างน้อย 1 อัน มากสุด HOT_MAX อัน
   สินค้าที่ยังขายไม่ได้ (0) ไม่ได้ป้าย — ปรับจำนวนสูงสุดที่ HOT_MAX */
const HOT_MAX = 3;
function markHot(){
  const by = {};
  products.forEach(p => { p.hot = false; (by[p.cat || ''] = by[p.cat || ''] || []).push(p); });
  Object.keys(by).forEach(k => {
    const list = by[k], n = Math.min(HOT_MAX, Math.max(1, Math.ceil(list.length / 3)));
    list.slice().sort((a, b) => (+b.sold || 0) - (+a.sold || 0)).slice(0, n).forEach(p => { if((+p.sold || 0) > 0) p.hot = true; });
  });
}
function setProducts(rows){
  products.length = 0;
  (Array.isArray(rows) ? rows : []).forEach(r => products.push(mapProduct(r)));
  markHot();
  if(typeof cats !== 'undefined') cats.forEach(c => { c.c = products.filter(p => p.cat === c.k).length; });
  window.productsLoaded = true;
  document.dispatchEvent(new Event('products:ready'));
}
function loadProducts(){
  if(window.EX_NO_FETCH) return Promise.resolve();
  /* โชว์ของที่จำไว้ครั้งก่อนทันที (ถ้ามี) แล้วค่อยอัปเดตด้วยข้อมูลสดจากฐานข้อมูล */
  if(!window.EX_NO_CACHE){ try { const c = JSON.parse(localStorage.getItem(PCACHE) || 'null'); if(Array.isArray(c)) setProducts(c); } catch(e){} }
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
  return fetch(EX_DB.url + '/rest/v1/rpc/shop_products', {
    method: 'POST', signal: ctl.signal,
    headers: { 'Content-Type': 'application/json', apikey: EX_DB.key, Authorization: 'Bearer ' + EX_DB.key },
    body: '{}'
  }).then(r => { if(!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(rows => {
      if(!Array.isArray(rows)) throw new Error('bad');
      window.productsFailed = false;
      try { localStorage.setItem(PCACHE, JSON.stringify(rows)); } catch(e){}
      setProducts(rows);
    })
    .catch(() => { window.productsFailed = true; if(!window.productsLoaded){ window.productsLoaded = true; document.dispatchEvent(new Event('products:ready')); } })
    .finally(() => clearTimeout(to));
}

/* categories — ดึงจากฐานข้อมูล Supabase (ฟังก์ชัน shop_categories) ไม่มีหมวดตายตัวในไฟล์แล้ว
   เพิ่ม/แก้/ลบหมวดที่หน้าแอดมิน (admin.html → ຈັດການໝວດໝູ່) — โหลดเสร็จแล้วยิงอีเวนต์ 'cats:ready' ให้ทุกหน้าวาดใหม่ */
const cats = [];
window.catsLoaded = false;
const CCACHE = 'exCatsCache';
function setCats(rows){
  cats.length = 0;
  (Array.isArray(rows) ? rows : []).forEach(r => cats.push({ id: r.id, k: String(r.k || ''), n: r.name || '', img: r.img || '', c: 0 }));
  cats.forEach(c => { c.c = products.filter(p => p.cat === c.k).length; });
  window.catsLoaded = true;
  document.dispatchEvent(new Event('cats:ready'));
}
function loadCategories(){
  if(window.EX_NO_FETCH) return Promise.resolve();
  if(!window.EX_NO_CACHE){ try { const c = JSON.parse(localStorage.getItem(CCACHE) || 'null'); if(Array.isArray(c)) setCats(c); } catch(e){} }
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
  return fetch(EX_DB.url + '/rest/v1/rpc/shop_categories', {
    method: 'POST', signal: ctl.signal,
    headers: { 'Content-Type': 'application/json', apikey: EX_DB.key, Authorization: 'Bearer ' + EX_DB.key },
    body: '{}'
  }).then(r => { if(!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(rows => {
      if(!Array.isArray(rows)) throw new Error('bad');
      try { localStorage.setItem(CCACHE, JSON.stringify(rows)); } catch(e){}
      setCats(rows);
    })
    .catch(() => { if(!window.catsLoaded){ window.catsLoaded = true; document.dispatchEvent(new Event('cats:ready')); } })
    .finally(() => clearTimeout(to));
}

/* ราคาตัวแทน (บัญชีที่เปิดใช้ API Key ตัวแทนแล้ว): ดึงจาก member_agent_prices → window.exAgentMap = { 'รหัสสินค้า|ตัวเลือก': ราคา }
   null = ไม่ใช่ตัวแทน/ยังไม่ล็อกอิน · โหลดเสร็จ (หรือเปลี่ยน) แล้วยิงอีเวนต์ 'agent:ready' ให้หน้าวาดการ์ดใหม่
   จำผลไว้ใน localStorage 'exAgentCache' (ผูกกับ token) เพื่อให้การ์ดขึ้นราคาตัวแทนทันทีไม่กะพริบ */
const AGCACHE = 'exAgentCache';
window.exAgentMap = null;
function agTok(){ try { return localStorage.getItem('exSession') || sessionStorage.getItem('exSession') || ''; } catch(e){ return ''; } }
function agSet(prices){
  if(!Array.isArray(prices)){ window.exAgentMap = null; return; }
  const m = {}; prices.forEach(x => { m[x.product_id + '|' + (x.dur_label || '')] = Number(x.price) || 0; });
  window.exAgentMap = m;
}
function loadAgentPrices(){
  if(window.EX_NO_FETCH) return;
  const t = agTok(), key = t.slice(0, 16);
  if(!t){ try { localStorage.removeItem(AGCACHE); } catch(e){} agSet(null); return; }
  try {
    const c = JSON.parse(localStorage.getItem(AGCACHE) || 'null');
    if(c && c.t === key && Array.isArray(c.p)){ agSet(c.p); document.dispatchEvent(new Event('agent:ready')); }
    else if(c){ localStorage.removeItem(AGCACHE); }
  } catch(e){}
  fetch(EX_DB.url + '/rest/v1/rpc/member_agent_prices', {
    method: 'POST', headers: { 'Content-Type': 'application/json', apikey: EX_DB.key, Authorization: 'Bearer ' + EX_DB.key },
    body: JSON.stringify({ p_token: t })
  }).then(r => r.json()).then(j => {
    const had = !!window.exAgentMap;
    if(j && j.ok && j.agent){
      try { localStorage.setItem(AGCACHE, JSON.stringify({ t: key, p: j.prices || [] })); } catch(e){}
      agSet(j.prices || []); document.dispatchEvent(new Event('agent:ready'));
    } else if(j && (j.ok === false || j.agent === false)){
      try { localStorage.removeItem(AGCACHE); } catch(e){}
      agSet(null); if(had) document.dispatchEvent(new Event('agent:ready'));
    }
  }).catch(() => {});
}
/* ราคาเริ่มต้นสำหรับการ์ด: คืน { now: ราคาตัวแทนที่ถูกสุด, old: ราคาปกติของตัวเลือกเดียวกัน } เมื่อถูกกว่าราคาปกติ ไม่งั้น null */
function exAgentFrom(p){
  const m = window.exAgentMap; if(!m) return null;
  const opts = p.durs && p.durs.length ? p.durs.map(d => ({ k: d.label, v: d.price })) : [{ k: '', v: p.price }];
  let best = null;
  opts.forEach(o => { const a = m[p.id + '|' + o.k], now = a == null ? o.v : a; if(!best || now < best.now) best = { now, old: o.v }; });
  return best && best.now < best.old ? best : null;
}

/* การ์ดสินค้า 1 ใบ (ใช้ร่วมกันทั้งหน้าแรกและหน้าหมวดหมู่)
   i = ลำดับในรายการที่แสดง (ใส่ใน data-buy), nameHTML = ชื่อสินค้าที่ไฮไลต์คำค้นแล้ว (ไม่ใส่ = ใช้ชื่อปกติ) */
function productCardHTML(p, i, nameHTML){
  const ag = exAgentFrom(p);
  const AGI = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m15 9-6 6"/><path d="M9 9h.01M15 15h.01"/></svg>';
  return `
    <article class="pc${(p.update || p.soldout) ? ' is-upd' : ''}${ag ? ' is-ag' : ''}${(p.soldout && !p.update) ? ' is-out' : ''}" data-buy="${i}" role="button" tabindex="0"${(p.update || p.soldout) ? ' aria-disabled="true"' : ''}>
      <div class="pci">
        <div class="pimg">
          ${artSq('', p.img)}
          ${ag ? `<div class="ptab"><span class="pti ag">${AGI}</span><span class="ptt">ລາຄາຕົວແທນ</span></div>` : ''}${(ag || p.hot === false) ? '' : `<div class="ptab"><span class="pti"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg></span><span class="ptt">ຍອດນິຍົມ</span></div>`}
          <div class="pnotch"><span class="pfrom">ເລີ່ມ</span><span class="pnow">${escH(ag ? fmtKip(ag.now) : p.p)}</span></div>
        </div>
        ${ag ? `<div class="pold"><s>${escH(fmtKip(ag.old))}</s></div>` : ''}
        <h3 class="pname">${nameHTML || escH(p.n)}</h3>
        <div class="pst">
          <span class="pk"><i>ຄັງ</i><b>${escH(p.left)}</b></span>
          <span class="pdv"></span>
          <span class="pk"><i>ຂາຍແລ້ວ</i><b class="g">${escH(p.sold)}</b></span>
        </div>
      </div>
      ${p.update ? `<div class="pupd"><span class="pupd-a">UPDATE</span><span class="pupd-b">ກຳລັງອັບເດດ</span></div>` : p.soldout ? `<div class="pupd"><span class="pupd-a">ໝົດ</span><span class="pupd-b">ສິນຄ້າໝົດສະຕັອກ</span></div>` : ''}
    </article>`;
}

loadProducts();
loadCategories();
loadAgentPrices();
loadSite();
