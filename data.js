/* ===== ข้อมูลกลาง: สินค้า + หมวดหมู่ + ฟังก์ชันสร้างการ์ด =====
   ใช้ร่วมกันทั้ง index.html (script.js) และ categories.html (categories.js)
   สินค้า: เพิ่ม/แก้/ลบที่หน้าแอดมิน (ดึงจาก Supabase) — หมวดหมู่: แก้รายการ cats ในไฟล์นี้ ============================== */
/* รูปสินค้า/หมวดหมู่: ใส่ path รูปที่ IMG (ใช้ทุกการ์ด) หรือใส่ img:'...' ในแต่ละสินค้า/หมวด
   ถ้าเว้นว่างไว้ จะโชว์ข้อความแนะนำขนาดรูปแทน
   - สินค้า: 1000 × 960 px   - หมวดหมู่: 1500 × 512 px   - แบนเนอร์หน้าแรก: 1500 × 512 px */
const IMG = { product:'', category:'', banner:'' };
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
    update: r.status === 'update'
  };
}
function setProducts(rows){
  products.length = 0;
  (Array.isArray(rows) ? rows : []).forEach(r => products.push(mapProduct(r)));
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

/* categories */
const cats = [
  {k:'fivem', t1:'EXSHOP', n:'EXSHOP', d:'ໂປຣແກຣມຊ່ວຍຫຼິ້ນ Fivem', c:0},
  {k:'cheat', t1:'EXSHOP', n:'EXSHOP', d:'ໂປຣແກຣມຊ່ວຍຫຼິ້ນ', c:0},
  {k:'random', t1:'EXSHOP', n:'EXSHOP', d:'ສຸ່ມໄອດີເກມ', c:0},
  {k:'freefire', t1:'EXSHOP', n:'EXSHOP', d:'ໂປຣແກຣມຊ່ວຍຫຼິ້ນ Free Fire', c:0}
];

/* การ์ดสินค้า 1 ใบ (ใช้ร่วมกันทั้งหน้าแรกและหน้าหมวดหมู่)
   i = ลำดับในรายการที่แสดง (ใส่ใน data-buy), nameHTML = ชื่อสินค้าที่ไฮไลต์คำค้นแล้ว (ไม่ใส่ = ใช้ชื่อปกติ) */
function productCardHTML(p, i, nameHTML){
  return `
    <article class="pc${(p.update || p.soldout) ? ' is-upd' : ''}${(p.soldout && !p.update) ? ' is-out' : ''}" data-buy="${i}" role="button" tabindex="0"${(p.update || p.soldout) ? ' aria-disabled="true"' : ''}>
      <div class="pci">
        <div class="pimg">
          ${artSq('', p.img)}
          ${p.hot === false ? '' : `<div class="ptab"><span class="pti"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg></span><span class="ptt">ຍອດນິຍົມ</span></div>`}
          <div class="pnotch"><span class="pfrom">ເລີ່ມ</span><span class="pnow">${escH(p.p)}</span></div>
        </div>
        <h3 class="pname">${nameHTML || escH(p.n)}</h3>
        <div class="pst">
          <span class="pk"><i>ຄັງ</i><b>${escH(p.left)}</b></span>
          <span class="pdv"></span>
          <span class="pk"><i>ຂາຍແລ້ວ</i><b class="g">${escH(p.sold)}</b></span>
        </div>
      </div>
      ${p.update ? `<div class="pupd"><span class="pupd-a">UPDATE</span><span class="pupd-b">ກຳລັງອັບເດດ</span></div>` : p.soldout ? `<div class="pupd"><span class="pupd-a">SOLD OUT</span><span class="pupd-b">ສິນຄ້າໝົດສະຕັອກ</span></div>` : ''}
    </article>`;
}

loadProducts();
