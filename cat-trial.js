/* ทดลอง: ตัวเลขสถานะบนแท็บมุมขวาบนของการ์ดหมวดหมู่
   แดง  = จำนวนสินค้าที่ไม่พร้อมขาย (คงเหลือ = 0)
   เขียว = จำนวนสินค้าที่พร้อมขาย (คงเหลือ > 0)
   นับจากรายการ products ใน script.js — อยากกำหนดเองใส่ no:10, ok:20 ในรายการ cats */
(function(){
  if (typeof cats === 'undefined' || typeof products === 'undefined') return;
  document.querySelectorAll('.cat[data-cat]').forEach(function(b){
    var c = cats.find(function(x){ return x.k === b.dataset.cat; }); if (!c) return;
    var list = products.filter(function(p){ return p.cat === c.k; });
    var ok = typeof c.ok === 'number' ? c.ok : list.filter(function(p){ return +p.left > 0; }).length;
    var no = typeof c.no === 'number' ? c.no : list.filter(function(p){ return !(+p.left > 0); }).length;
    var t = document.createElement('span');
    t.className = 'ctab';
    t.innerHTML = '<b class="n no">' + no + '</b><i class="dv"></i><b class="n ok">' + ok + '</b>';
    b.appendChild(t);
  });
})();
