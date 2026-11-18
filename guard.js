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

  /* เวลาเริ่มใช้งาน (เก็บที่เดียวกับ token) — หน้าโปรไฟล์ใช้นับเวลาสด */
  window.exSessionStart = function () {
    try {
      var st = localStorage.getItem('exSession') ? localStorage : sessionStorage;
      var t = Number(st.getItem('exSessionAt')) || 0;
      if (!t) { t = Date.now(); st.setItem('exSessionAt', String(t)); }
      return t;
    } catch (e) { return Date.now(); }
  };
  /* ออกจากระบบ: แจ้งเซิร์ฟเวอร์ลบ token → ล้างข้อมูลในเครื่อง → กลับหน้าแรก
     (ค่า Supabase ตรงนี้ต้องตรงกับ AUTH ใน auth.js — publishable key ใส่ในเว็บได้) */
  var SB = { url: 'https://mjalctpfeizjukuprqti.supabase.co', key: 'sb_publishable_3EZ-Ulah6h9Xzze_DE0xow_E6iGHNiJ' };
  window.EX_SB = SB;
  window.exRpc = function (fn, body) {
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 15000);
    return fetch(SB.url + '/rest/v1/rpc/' + fn, {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', apikey: SB.key, Authorization: 'Bearer ' + SB.key },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (j) {
        if (!r.ok) { var e = new Error('http ' + r.status); e.status = r.status; e.body = j; throw e; }
        return j;
      });
    }).finally(function () { clearTimeout(t); });
  };
  window.exToken = function () { try { return localStorage.getItem('exSession') || sessionStorage.getItem('exSession') || ''; } catch (e) { return ''; } };
  window.exClearLocal = function () {
    try {
      ['exSession', 'exSessionAt'].forEach(function (k) { localStorage.removeItem(k); sessionStorage.removeItem(k); });
      localStorage.removeItem('exUser'); localStorage.removeItem('exIsAgent'); localStorage.removeItem('exAgentCache');
    } catch (e) {}
  };
  window.exLogout = function () {
    var tok = window.exToken();
    var fin = function () { window.exClearLocal(); location.href = 'index.html'; };
    if (!tok) return fin();
    window.exRpc('member_logout', { p_token: tok }).then(fin, fin);
  };
})();
