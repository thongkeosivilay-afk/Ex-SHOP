/* ตัวเลขสถานะอยู่ข้างชื่อหมวดในแท็บมุมซ้ายล่างของการ์ดหมวดหมู่
   แดง  = จำนวนสินค้าที่ไม่พร้อมขาย (คงเหลือ = 0)
   เขียว = จำนวนสินค้าที่พร้อมขาย (คงเหลือ > 0)
   นับจากรายการ products ใน data.js — อยากกำหนดเองใส่ no:10, ok:20 ในรายการ cats
   เรียก addCatTabs(root) ซ้ำได้ทุกครั้งที่วาดการ์ดใหม่ (หน้าหมวดหมู่ใช้ตอนค้นหา) */
function addCatTabs(root){
  if (typeof cats === 'undefined' || typeof products === 'undefined') return;
  (root || document).querySelectorAll('.cat[data-cat]').forEach(function(b){
    if (b.querySelector('.ctab')) return;
    var c = cats.find(function(x){ return x.k === b.dataset.cat; }); if (!c) return;
    var list = products.filter(function(p){ return p.cat === c.k; });
    var ok = typeof c.ok === 'number' ? c.ok : list.filter(function(p){ return +p.left > 0; }).length;
    var no = typeof c.no === 'number' ? c.no : list.filter(function(p){ return !(+p.left > 0); }).length;
    var t = document.createElement('span');
    t.className = 'ctab';
    t.innerHTML = '<b class="n no">' + no + '</b><i class="dv"></i><b class="n ok">' + ok + '</b>';
    var tab = b.querySelector('.cat-b') || b;
    tab.appendChild(t);
  });
}
addCatTabs(document);
/* สินค้ามาจากฐานข้อมูล → ตัวเลขบนแท็บเปลี่ยนตามเมื่อโหลดเสร็จ (หน้าแรกวาดการ์ดหมวดใหม่เองแล้วเรียก addCatTabs) */
