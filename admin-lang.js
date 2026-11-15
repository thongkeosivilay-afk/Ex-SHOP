/* ปุ่มเลือกภาษาในเมนูแอดมิน — ใช้ภาษาเดียวกับหน้าร้าน (localStorage 'lang') และเปลี่ยนทุกหน้าแอดมินพร้อมกัน
   ต้องโหลดต่อจาก i18n.js (ที่มี window.setLang) · ปุ่ม: <button class="alg" data-lang="th"> ในเมนู .alang */
(function(){
  function mark(l){
    document.querySelectorAll('.alg').forEach(function(b){
      var on = b.dataset.lang === l;
      b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.alg');
    if(!b || typeof window.setLang !== 'function') return;
    e.stopPropagation();
    window.setLang(b.dataset.lang, true);
  });
  document.addEventListener('langchange', function(e){ mark(e.detail); });
  var cur = 'lo'; try{ cur = localStorage.getItem('lang') || 'lo'; }catch(e){}
  mark(cur);
  /* เมนูถูกสร้างทีหลัง (admin-nav.js) → ทำเครื่องหมายอีกครั้งเมื่อโหลดเสร็จ */
  window.addEventListener('DOMContentLoaded', function(){ mark(document.documentElement.dataset.lang || cur); });
  /* หน้าอื่นเปลี่ยนภาษา (แท็บอื่นของเบราว์เซอร์) → ตามทันที */
  window.addEventListener('storage', function(e){ if(e.key === 'lang' && typeof window.setLang === 'function') window.setLang(e.newValue || 'lo', false); });
})();
