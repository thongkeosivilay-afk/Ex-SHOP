/* ตัวช่วยเช็กสถานะล็อกอิน (ใช้ร่วมทุกหน้า)
   exLoggedIn()  = มี session token หรือไม่ (จำบัญชี → localStorage, ไม่จำ → sessionStorage)
   exNeedLogin() = พากลับหน้าแรกพร้อมเปิดหน้าต่างเข้าสู่ระบบ และจำหน้าที่ต้องการไว้ ล็อกอินเสร็จจะพากลับมา
   หมายเหตุ: นี่คือการซ่อน/กั้นฝั่งหน้าเว็บเพื่อ UX เท่านั้น การซื้อ/เติมเงินจริงต้องตรวจ token ฝั่ง Supabase ด้วยเสมอ */
(function () {
  window.exLoggedIn = function () {
    try { return !!(localStorage.getItem('exSession') || sessionStorage.getItem('exSession')); } catch (e) { return false; }
  };
  window.exNeedLogin = function (next) {
    try { sessionStorage.setItem('exNext', next || (location.pathname.split('/').pop() + location.search)); } catch (e) {}
    location.href = 'index.html?auth=login';
  };
})();
