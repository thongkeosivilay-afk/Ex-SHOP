/* ===== ข้อมูลกลาง: สินค้า + หมวดหมู่ + ฟังก์ชันสร้างการ์ด =====
   ใช้ร่วมกันทั้ง index.html (script.js) และ categories.html (categories.js)
   เพิ่ม/แก้สินค้าและหมวดหมู่ที่ไฟล์นี้ที่เดียว ============================== */
/* รูปสินค้า/หมวดหมู่: ใส่ path รูปที่ IMG (ใช้ทุกการ์ด) หรือใส่ img:'...' ในแต่ละสินค้า/หมวด
   ถ้าเว้นว่างไว้ จะโชว์ข้อความแนะนำขนาดรูปแทน
   - สินค้า: 1000 × 960 px   - หมวดหมู่: 1500 × 512 px   - แบนเนอร์หน้าแรก: 1500 × 512 px */
const IMG = { product:'', category:'', banner:'' };
function artSq(key, src, mini){
  src = src || IMG.product;
  if(src) return `<img class="pimg-img" src="${src}" alt="" loading="lazy" draggable="false">`;
  if(mini) return `<div class="fph">1000×960</div>`;
  return `<div class="pph"><span class="pph-a">ຂະໜາດຮູບທີ່ແນະນຳ</span><span class="pph-n">1000 × 960<small>px</small></span><span class="pph-b">ສຳລັບຮູບສິນຄ້າ</span><span class="pph-c">ຮູບສີ່ຫຼ່ຽມ · PNG ຫຼື JPG</span></div>`;
}
function artBanner(src){
  src = src || IMG.banner;
  if(src) return `<img src="${src}" alt="" draggable="false">`;
  return `<div class="cph"><span class="cph-a">ຂະໜາດຮູບທີ່ແນະນຳ</span><span class="cph-n">1500 × 512<small>px</small></span><span class="cph-b">ສຳລັບຮູບແບນເນີ · ຮູບແນວນອນ · PNG ຫຼື JPG</span></div>`;
}
function artCat(src){
  src = src || IMG.category;
  if(src) return `<img src="${src}" alt="" loading="lazy" draggable="false">`;
  return `<div class="cph"><span class="cph-a">ຂະໜາດຮູບທີ່ແນະນຳ</span><span class="cph-n">1500 × 512<small>px</small></span><span class="cph-b">ສຳລັບຮູບໝວດໝູ່ · ຮູບແນວນອນ · PNG ຫຼື JPG</span></div>`;
}

/* products */
const products = [
  {n:'EXSHOP', p:'₭0', left:'0', sold:'0', art:'unban', cat:'fivem'},
  {n:'EXSHOP', p:'₭0', left:'0', sold:'0', art:'devil', cat:'fivem'},
  {n:'EXSHOP', p:'₭0', left:'0', sold:'0', art:'card', cat:'fivem'},
  {n:'EXSHOP', p:'₭0', left:'0', sold:'0', art:'setting', cat:'fivem'},
  {soldout:true, n:'EXSHOP', p:'₭0', left:'0', sold:'0', art:'xlight', cat:'fivem'},
  {soldout:true, n:'EXSHOP', p:'₭0', left:'0', sold:'0', art:'unlock', cat:'fivem'},
  {update:true, n:'EXSHOP', p:'₭0', left:'0', sold:'0', art:'collection', cat:'fivem'},
  {update:true, n:'EXSHOP', p:'₭0', left:'0', sold:'0', art:'upcri', cat:'fivem'}
];

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
          ${artSq(p.art, p.img)}
          ${p.hot === false ? '' : `<div class="ptab"><span class="pti"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg></span><span class="ptt">ຍອດນິຍົມ</span></div>`}
          <div class="pnotch"><span class="pfrom">ເລີ່ມ</span><span class="pnow">${p.p}</span></div>
        </div>
        <h3 class="pname">${nameHTML || p.n}</h3>
        <div class="pst">
          <span class="pk"><i>ຄັງ</i><b>${p.left}</b></span>
          <span class="pdv"></span>
          <span class="pk"><i>ຂາຍແລ້ວ</i><b class="g">${p.sold}</b></span>
        </div>
      </div>
      ${p.update ? `<div class="pupd"><span class="pupd-a">UPDATE</span><span class="pupd-b">ກຳລັງອັບເດດ</span></div>` : p.soldout ? `<div class="pupd"><span class="pupd-a">SOLD OUT</span><span class="pupd-b">ສິນຄ້າໝົດສະຕັອກ</span></div>` : ''}
    </article>`;
}
