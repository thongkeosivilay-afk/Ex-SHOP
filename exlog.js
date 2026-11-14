/* บันทึกประวัติเติมเงิน / สั่งซื้อ (ใช้ร่วมทุกหน้า) — เก็บใน localStorage ตัวเดียวกับยอดเงินจำลอง (exshop_balance)
   ExLog.addTopup(จำนวนเงิน, ธนาคาร)      เรียกตอนเติมเงินสำเร็จ
   ExLog.addOrder({no,name,opt,qty,total}) เรียกตอนสั่งซื้อสำเร็จ
   ExLog.stats()                            สรุปยอดทั้งหมด + 7 วันที่ผ่านมา (หน้าโปรไฟล์ใช้)
   เมื่อเชื่อมระบบจริง: ให้ stats()/topups()/orders() ดึงจากตารางใน Supabase แทน (ฝั่งเซิร์ฟเวอร์นับ) */
(function () {
  var TK = 'exshop_topups', OK = 'exshop_orders', MAX = 500, WEEK = 7 * 24 * 3600 * 1000;
  function rd(k) { try { var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function push(k, row) { try { var a = rd(k); a.push(row); localStorage.setItem(k, JSON.stringify(a.slice(-MAX))); } catch (e) {} }
  function num(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }
  window.ExLog = {
    addTopup: function (amount, bank) { amount = num(amount); if (amount) push(TK, { t: Date.now(), amount: amount, bank: String(bank || '') }); },
    addOrder: function (o) {
      o = o || {};
      push(OK, { t: Date.now(), no: String(o.no || ''), name: String(o.name || ''), opt: String(o.opt || ''), qty: Math.max(1, num(o.qty) || 1), total: num(o.total) });
    },
    topups: function () { return rd(TK); },
    orders: function () { return rd(OK); },
    stats: function () {
      var now = Date.now(), tp = rd(TK), od = rd(OK), s = {
        topupAll: 0, topupAllN: 0, topup7: 0, topup7N: 0,
        buyAll: 0, buyAllOrders: od.length, buy7: 0, buy7Orders: 0, spentAll: 0, spent7: 0
      };
      tp.forEach(function (r) { var a = num(r.amount); s.topupAll += a; s.topupAllN++; if (now - r.t <= WEEK) { s.topup7 += a; s.topup7N++; } });
      od.forEach(function (r) { var q = num(r.qty) || 1, p = num(r.total); s.buyAll += q; s.spentAll += p; if (now - r.t <= WEEK) { s.buy7 += q; s.buy7Orders++; s.spent7 += p; } });
      return s;
    }
  };
})();
