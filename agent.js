/* ===== agent.js — หน้าสมัครตัวแทน (agent.html) ===== */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var M = { bad_session: 'ເຊດຊັນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່', already: 'ບັນຊີນີ້ເປັນຕົວແທນແລ້ວ', notfound: 'ບໍ່ພົບ API Key ນີ້', closed: 'API Key ນີ້ຖືກປິດໃຊ້ງານແລ້ວ', used: 'API Key ນີ້ມີຄົນໃຊ້ແລ້ວ' };
  var K = { key: '<svg class="i" viewBox="0 0 24 24"><path d="m21 2-2 2m-7.600 7.600a5.500 5.500 0 1 1-7.800 7.800 5.500 5.500 0 0 1 7.800-7.800zm0 0L15.500 7.500m0 0 3 3L22 7l-3-3m-3.500 3.500L19 4"/></svg>', ok: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>', paste: '<svg class="i" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>' };
  var card = $('#agKeyCard'), tt;
  var money = function (n) { return (Math.round(Number(n) || 0)).toLocaleString('en-US') + ' ₭'; };
  function toast(m) { var t = $('#agToast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, 2400); }

  /* ----- ช่องทางติดต่อ ----- */
  function loadContacts() {
    var box = $('#agContacts');
    if (!window.exContactsLoad) { box.innerHTML = '<div class="ag-ce">ໂຫຼດບໍ່ສຳເລັດ</div>'; return; }
    exContactsLoad().then(function (list) {
      box.innerHTML = list.length ? list.map(exContactHTML).join('') : '<div class="ag-ce">ຍັງບໍ່ມີຊ່ອງທາງຕິດຕໍ່</div>';
    }).catch(function () { box.innerHTML = '<div class="ag-ce">ໂຫຼດບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່</div>'; });
  }

  /* ----- การ์ดสถานะ ----- */
  function showLogin() {
    card.innerHTML = '<div class="ag-h"><span class="ag-hi">' + K.key + '</span><div><b>ໃສ່ API Key ຕົວແທນ</b><small>ຕ້ອງເຂົ້າສູ່ລະບົບກ່ອນ ຈຶ່ງຈະເປີດໃຊ້ Key ໄດ້</small></div></div>' +
      '<button class="ag-go" id="agLogin" type="button">ເຂົ້າສູ່ລະບົບ</button>';
    $('#agLogin').onclick = function () { if (window.exNeedLogin) exNeedLogin('agent.html'); };
  }
  function showForm() {
    card.innerHTML = '<div class="ag-h"><span class="ag-hi">' + K.key + '</span><div><b>ໃສ່ API Key ຕົວແທນ</b><small>ວາງ Key ທີ່ແອດມິນສົ່ງໃຫ້ ເພື່ອເປີດລາຄາຕົວແທນ</small></div></div>' +
      '<form class="ag-f" id="agForm" novalidate><label for="agKey">API Key</label>' +
      '<div class="ag-in">' + K.key + '<input id="agKey" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="40" placeholder="EX-XXXXXXXX-XXXXXXXX">' +
      '<button class="ag-pst" id="agPst" type="button">' + K.paste + 'ວາງ</button></div>' +
      '<div class="ag-e" id="agE"></div>' +
      '<button class="ag-go" id="agGo" type="submit"><span id="agGoT">ເປີດໃຊ້ຕົວແທນ</span></button></form>';
    var inp = $('#agKey'), er = $('#agE'), go = $('#agGo');
    inp.addEventListener('input', function () { er.textContent = ''; });
    var pst = $('#agPst');
    if (!(navigator.clipboard && navigator.clipboard.readText)) pst.hidden = true;
    pst.onclick = function () { navigator.clipboard.readText().then(function (t) { inp.value = String(t || '').trim(); inp.focus(); }).catch(function () { toast('ວາງບໍ່ໄດ້ ກະລຸນາວາງເອງໃນຊ່ອງ'); }); };
    $('#agForm').addEventListener('submit', function (e) {
      e.preventDefault();
      if (go.disabled) return;
      var k = inp.value.trim().toUpperCase();
      if (!k) { er.textContent = 'ກະລຸນາໃສ່ API Key'; inp.focus(); return; }
      go.disabled = true; $('#agGoT').innerHTML = '<span class="ag-sp"></span>';
      exRpc('member_agent_redeem', { p_token: exToken(), p_key: k }).then(function (j) {
        if (j && j.ok) { toast('ເປີດໃຊ້ຕົວແທນສຳເລັດ'); loadStatus(); return; }
        go.disabled = false; $('#agGoT').textContent = 'ເປີດໃຊ້ຕົວແທນ';
        er.textContent = M[j && j.code] || 'ເປີດໃຊ້ບໍ່ສຳເລັດ';
      }).catch(function () { go.disabled = false; $('#agGoT').textContent = 'ເປີດໃຊ້ຕົວແທນ'; er.textContent = 'ເຊື່ອມຕໍ່ເຊີບເວີບໍ່ໄດ້'; });
    });
  }
  function nameOf(id) {
    var a = window.products || (typeof products !== 'undefined' ? products : []);
    for (var i = 0; i < a.length; i++) if (String(a[i].id) === String(id)) return a[i];
    return null;
  }

  /* =====================================================================
     ພາບລວມຕົວແທນ (แดชบอร์ดตัวแทน) — แสดงแทนส่วนสมัครเมื่อเป็นตัวแทนแล้ว
     ข้อมูลทั้งหมดคำนวณจาก RPC ที่มีอยู่แล้ว: member_agent_prices / member_order_list / member_me
     (ไม่ต้องแก้ฐานข้อมูล)
     ===================================================================== */
  var FLAG = 'exIsAgent';                       // จำว่าเป็นตัวแทน → เมนู/หน้านี้เปลี่ยนชื่อทันทีไม่กะพริบ
  function setFlag(on) { try { if (on) localStorage.setItem(FLAG, '1'); else localStorage.removeItem(FLAG); } catch (e) {} }
  var join = $('#agJoin'), dash = $('#agDash'), built = false, started = false, ordersState = 'load', orders = [], srv = null, bal = null;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var stamp = function (t) { var d = new Date(t); return isNaN(d) ? '' : pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  var WD = ['ອາ', 'ຈັນ', 'ອັງ', 'ພຸດ', 'ພຫ', 'ສຸກ', 'ເສົາ'];
  var compact = function (n) { n = Number(n) || 0; if (n >= 1e6) return (Math.round(n / 1e5) / 10) + 'M'; if (n >= 1e3) return Math.round(n / 1e3) + 'K'; return String(Math.round(n)); };
  var ic = function (id) { return '<svg class="i"><use href="#' + id + '"/></svg>'; };
  var amt = function (n) { return (Math.round(Number(n) || 0)).toLocaleString('en-US') + '<em>₭</em>'; };

  function setTitles(on) {
    $('#agTitle').textContent = on ? 'ພາບລວມຕົວແທນ' : 'ສະໝັກຕົວແທນ';
    $('#agH2').textContent = on ? 'ພາບລວມຕົວແທນ' : 'ສະໝັກຕົວແທນ';
    $('#agSub').textContent = on ? 'ສະຫຼຸບຍອດຊື້ ແລະ ລາຄາຕົວແທນຂອງທ່ານ' : 'ຊື້ສິນຄ້າໃນລາຄາຕົວແທນ ສຳລັບຜູ້ທີ່ຊື້ເພື່ອຂາຍຕໍ່ ໃສ່ API Key ເພື່ອເປີດໃຊ້ໄດ້ທັນທີ';
    document.title = on ? 'ພາບລວມຕົວແທນ' : 'ສະໝັກຕົວແທນ';
  }
  /* เป็นตัวแทนแล้ว: ส่วนสมัคร/ขั้นตอน/คำถาม จางเบลอหายไป แล้วแดชบอร์ดค่อยๆ ชัดขึ้นมาแทน */
  function enterAgent() {
    setFlag(true); setTitles(true); dash.hidden = false;
    if (document.body.classList.contains('is-agent')) return;
    if (reduce) { document.body.classList.add('is-agent'); dash.classList.add('ad-in'); return; }
    join.classList.add('ag-fade');
    setTimeout(function () { document.body.classList.add('is-agent'); join.classList.remove('ag-fade'); dash.classList.add('ad-in'); window.scrollTo(0, 0); }, 560);
  }
  function leaveAgent() {
    setFlag(false); setTitles(false);
    document.body.classList.remove('is-agent'); dash.hidden = true; dash.classList.remove('ad-in');
  }

  function buildShell() {
    if (built) return; built = true;
    dash.innerHTML =
      '<div class="ag-ok">' + K.ok + '<div><b>ທ່ານເປັນຕົວແທນແລ້ວ</b><small>ລາຄາຕົວແທນມີຜົນທຸກການຊື້</small></div></div>' +
      '<div class="ad-hd"><h3 class="hw-h">ສະຫຼຸບຍອດຊື້</h3><button class="ad-rf" id="adRf" type="button" aria-label="ອັບເດດ">' + ic('a-refresh') + '<span>ອັບເດດ</span></button></div>' +
      '<div id="adStats"></div>' +
      '<div class="ad-wal"><span class="ad-wi">' + ic('a-wallet') + '</span><div class="ad-wt"><small>ຍອດຄົງເຫຼືອ</small><b id="adBal">—</b></div><a class="ad-top" href="topup.html">+ ເຕີມເງິນ</a></div>' +
      '<div class="ad-acts">' +
        '<a href="categories.html">' + ic('a-cart') + '<span>ຊື້ສິນຄ້າ</span></a>' +
        '<a href="orders.html">' + ic('a-clock') + '<span>ປະຫວັດ</span></a>' +
        '<a href="topups.html">' + ic('a-wallet') + '<span>ເຕີມເງິນ</span></a>' +
        '<button type="button" id="adCt">' + ic('a-chat') + '<span>ແອດມິນ</span></button>' +
      '</div>' +
      '<div id="adMore"></div>' +
      '<details class="ad-card ad-pd" open><summary><span class="ad-sh">' + ic('a-tag') + 'ລາຄາຕົວແທນຂອງຂ້ອຍ <em id="adPc"></em></span>' + ic('a-down') + '</summary>' +
        '<div class="ag-pl" id="agPl"><div class="ag-pe"><span class="ag-sp"></span></div></div></details>' +
      '<div class="ad-tip">' + ic('a-alert') + '<span>ສິນຄ້າທີ່ບໍ່ມີລາຄາຕົວແທນ ຈະຊື້ໃນລາຄາປົກກະຕິ ຍອດຊື້ດ້ານເທິງນັບຈາກປະຫວັດການສັ່ງຊື້ຂອງບັນຊີນີ້</span></div>';
    $('#adRf').onclick = function () { var b = this; b.classList.add('spin'); loadOrders(); loadBalance(); setTimeout(function () { b.classList.remove('spin'); }, 900); };
    $('#adCt').onclick = function () { if (window.exOpenContacts) exOpenContacts(); else toast('ກຳລັງພັດທະນາ'); };
    drawStats();
    var cb = $('#adBal');
    var lb = null; try { lb = JSON.parse(localStorage.getItem('exshop_balance') || 'null'); } catch (e) {}
    if (lb != null) { bal = Number(lb) || 0; cb.innerHTML = amt(bal); }
  }

  function calc() {
    var now = new Date(), Y = now.getFullYear(), M0 = now.getMonth(), D = now.getDate();
    var S = { today: 0, todayN: 0, total: 0, n: orders.length, items: 0, month: 0, monthN: 0, saved: 0, days: [], top: [] };
    for (var i = 6; i >= 0; i--) { var dt = new Date(Y, M0, D - i); S.days.push({ y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate(), w: WD[dt.getDay()], sum: 0, now: i === 0 }); }
    var tp = {};
    orders.forEach(function (o) {
      var t = Number(o.total) || 0, q = Number(o.qty) || 0, at = new Date(o.at);
      S.total += t; S.items += q; S.saved += Number(o.discount) || 0;
      if (!isNaN(at)) {
        var y = at.getFullYear(), m = at.getMonth(), d = at.getDate();
        if (y === Y && m === M0) { S.month += t; S.monthN++; }
        if (y === Y && m === M0 && d === D) { S.today += t; S.todayN++; }
        for (var k = 0; k < 7; k++) if (S.days[k].y === y && S.days[k].m === m && S.days[k].d === d) { S.days[k].sum += t; break; }
      }
      var nm = o.name || 'ສິນຄ້າ';
      (tp[nm] = tp[nm] || { name: nm, qty: 0, sum: 0, n: 0 }); tp[nm].qty += q; tp[nm].sum += t; tp[nm].n++;
    });
    S.top = Object.keys(tp).map(function (k) { return tp[k]; }).sort(function (a, b) { return b.sum - a.sum; }).slice(0, 5);
    S.recent = orders.slice().sort(function (a, b) { return new Date(b.at) - new Date(a.at); }).slice(0, 5);
    S.avg = S.n ? S.total / S.n : 0;
    return S;
  }

  /* ยอดรวมจากเซิร์ฟเวอร์ (member_agent_stats) — นับทุกอ็อเดอร์ ไม่ติดลิมิต 200 */
  function fromServer(j) {
    var S = { today: +j.today || 0, todayN: +j.today_n || 0, total: +j.total || 0, n: +j.orders || 0, items: +j.items || 0, month: +j.month || 0, monthN: +j.month_n || 0, saved: +j.saved || 0, top: j.top || [], recent: j.recent || [] };
    S.top = S.top.map(function (t) { return { name: t.name, qty: +t.qty || 0, sum: +t.sum || 0, n: +t.n || 0 }; });
    var now = new Date();
    S.days = (j.days || []).map(function (x, i, a) { var p = String(x.d).split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]); return { d: dt.getDate(), w: WD[dt.getDay()], sum: +x.sum || 0, now: i === a.length - 1 }; });
    S.avg = S.n ? S.total / S.n : 0;
    return S;
  }
  function tile(cls, icon, label, val, sub) {
    return '<div class="ad-t ' + cls + '"><span class="ad-ti">' + ic(icon) + '</span><small>' + label + '</small><b>' + val + '</b><i>' + sub + '</i></div>';
  }
  function drawStats() {
    var box = $('#adStats'), more = $('#adMore'); if (!box) return;
    if (ordersState === 'load') {
      box.innerHTML = '<div class="ad-grid">' + '<div class="ad-t ad-sk"></div>'.repeat(6) + '</div>'; more.innerHTML = ''; return;
    }
    if (ordersState === 'err') {
      box.innerHTML = '<div class="ad-err"><span>ໂຫຼດຂໍ້ມູນຍອດຊື້ບໍ່ສຳເລັດ</span><button type="button" class="ad-rt" id="adRt">ລອງໃໝ່</button></div>'; more.innerHTML = '';
      $('#adRt').onclick = function () { loadOrders(); };
      return;
    }
    var S = srv ? fromServer(srv) : calc();
    box.innerHTML = '<div class="ad-grid">' +
      tile('ad-hot', 'a-sun', 'ຍອດຊື້ມື້ນີ້', amt(S.today), S.todayN + ' ອໍເດີ') +
      tile('ad-hot2', 'a-bag', 'ຍອດຊື້ທັງໝົດ', amt(S.total), S.n + ' ອໍເດີ · ' + S.items + ' ຊິ້ນ') +
      tile('', 'a-calendar', 'ຍອດຊື້ເດືອນນີ້', amt(S.month), S.monthN + ' ອໍເດີ') +
      tile('', 'a-pkg', 'ສິນຄ້າທີ່ຊື້ທັງໝົດ', S.items.toLocaleString('en-US') + '<em>ຊິ້ນ</em>', S.n + ' ອໍເດີ') +
      tile('', 'a-trend', 'ສະເລ່ຍຕໍ່ອໍເດີ', amt(S.avg), 'ຈາກທຸກອໍເດີ') +
      tile('', 'a-tag', 'ສ່ວນຫຼຸດທີ່ໄດ້ຮັບ', amt(S.saved), 'ລວມທຸກອໍເດີ') +
      '</div>';
    if (!S.n) { more.innerHTML = '<div class="ad-card ad-empty">ຍັງບໍ່ມີປະຫວັດການຊື້<small>ເມື່ອຊື້ສິນຄ້າແລ້ວ ຍອດຕ່າງໆຈະສະແດງຢູ່ບ່ອນນີ້</small><a class="hw-go" href="categories.html">' + ic('a-cart') + 'ໄປເລືອກຊື້ສິນຄ້າ</a></div>'; return; }
    var mx = Math.max.apply(null, S.days.map(function (d) { return d.sum; })) || 1, w7 = S.days.reduce(function (a, d) { return a + d.sum; }, 0);
    var chart = '<div class="ad-card"><div class="ad-sh">' + ic('a-trend') + '7 ວັນຫຼ້າສຸດ<em>' + money(w7) + '</em></div><div class="ad-bars">' +
      S.days.map(function (d) {
        var h = d.sum ? Math.max(6, Math.round(d.sum / mx * 100)) : 3;
        return '<div class="ad-bc' + (d.now ? ' now' : '') + '" title="' + esc(money(d.sum)) + '"><span class="ad-bv">' + (d.sum ? compact(d.sum) : '') + '</span><div class="ad-bw"><i style="height:' + h + '%"></i></div><span class="ad-bl">' + d.w + '<br>' + pad(d.d) + '</span></div>';
      }).join('') + '</div></div>';
    var tmx = S.top.length ? S.top[0].sum || 1 : 1;
    var top = '<div class="ad-card"><div class="ad-sh">' + ic('a-bag') + 'ສິນຄ້າທີ່ຊື້ຫຼາຍສຸດ</div><div class="ad-tp">' +
      S.top.map(function (t, i) {
        return '<div class="ad-tr"><span class="ad-rk">' + (i + 1) + '</span><div class="ad-tn"><b>' + esc(t.name) + '</b><small>' + t.qty + ' ຊິ້ນ · ' + t.n + ' ອໍເດີ</small><span class="ad-tb"><i style="width:' + Math.max(4, Math.round(t.sum / tmx * 100)) + '%"></i></span></div><strong>' + money(t.sum) + '</strong></div>';
      }).join('') + '</div></div>';
    var rec = '<div class="ad-card"><div class="ad-sh">' + ic('a-clock') + 'ອໍເດີຫຼ້າສຸດ<a href="orders.html">ເບິ່ງທັງໝົດ</a></div><div class="ad-rc">' +
      S.recent.map(function (o) {
        return '<a class="ad-ro" href="orders.html"><div><b>' + esc(o.name || 'ສິນຄ້າ') + '</b><small>' + esc((o.opt ? o.opt + ' × ' : '× ') + o.qty) + ' · ' + esc(stamp(o.at)) + '</small></div><strong>-' + money(o.total) + '</strong></a>';
      }).join('') + '</div></div>';
    more.innerHTML = chart + top + rec;
  }
  function loadOrders() {
    ordersState = 'load'; drawStats();
    var bad = function () { if (window.exClearLocal) exClearLocal(); setFlag(false); if (window.exNeedLogin) exNeedLogin('agent.html'); };
    var legacy = function () {   // ถ้ายังไม่ได้สร้างฟังก์ชัน member_agent_stats → ใช้วิธีเดิม (นับจาก 200 อ็อเดอร์ล่าสุด)
      exRpc('member_order_list', { p_token: exToken(), p_limit: 200 }).then(function (j) {
        if (j && j.ok) { orders = Array.isArray(j.orders) ? j.orders : []; srv = null; ordersState = 'ok'; }
        else if (j && j.code === 'bad_session') { bad(); return; }
        else ordersState = 'err';
        drawStats();
      }).catch(function () { ordersState = 'err'; drawStats(); });
    };
    exRpc('member_agent_stats', { p_token: exToken(), p_tz: -new Date().getTimezoneOffset() }).then(function (j) {
      if (j && j.ok) { srv = j; ordersState = 'ok'; drawStats(); }
      else if (j && j.code === 'bad_session') bad();
      else legacy();
    }).catch(legacy);
  }
  function loadBalance() {
    exRpc('member_me', { p_token: exToken() }).then(function (j) {
      if (j && j.ok) { bal = Number(j.balance) || 0; try { localStorage.setItem('exshop_balance', JSON.stringify(bal)); } catch (e) {} var c = $('#adBal'); if (c) c.innerHTML = amt(bal); }
    }).catch(function () {});
  }

  var lastPrices = null, pricesBound = false;
  function renderPrices() {
    var box = $('#agPl'); if (!box || !lastPrices) return;
    var pc = $('#adPc'); if (pc) pc.textContent = '(' + lastPrices.length + ')';
    var rows = lastPrices.map(function (x) {
      var p = nameOf(x.product_id);
      if (!p && window.productsLoaded) return '';
      var nm = p ? p.n : 'ສິນຄ້າ #' + x.product_id;
      var reg = null;
      if (p) { if (x.dur_label && p.durs) { var d = p.durs.filter(function (d) { return d.label === x.dur_label; })[0]; reg = d ? Number(d.price) : null; } else if (!x.dur_label) reg = Number(p.price); }
      var ag = Number(x.price) || 0, off = reg && reg > ag ? Math.round((reg - ag) / reg * 100) : 0;
      return '<div class="ag-pr"><span>' + esc(nm) + (x.dur_label ? ' <em>· ' + esc(x.dur_label) + '</em>' : '') + '</span>' + (off ? '<u class="ad-off">-' + off + '%</u>' : '') + (reg && reg > ag ? '<s>' + money(reg) + '</s>' : '') + '<b>' + money(ag) + '</b></div>';
    }).join('');
    box.innerHTML = rows || '<div class="ag-pe">ຍັງບໍ່ມີສິນຄ້າທີ່ຕັ້ງລາຄາຕົວແທນ ສິນຄ້າທັງໝົດຈະຊື້ໃນລາຄາປົກກະຕິ</div>';
  }
  function showAgent(j) {
    lastPrices = j.prices || [];
    buildShell(); enterAgent(); renderPrices();
    if (!started) { started = true; loadOrders(); loadBalance(); }
    if (!pricesBound) { pricesBound = true; document.addEventListener('products:ready', renderPrices); }
  }
  function loadStatus() {
    if (!(window.exLoggedIn && exLoggedIn())) { leaveAgent(); showLogin(); return; }
    exRpc('member_agent_prices', { p_token: exToken() }).then(function (j) {
      if (j && j.ok && j.agent) showAgent(j);
      else if (j && j.ok === false && j.code === 'bad_session') { leaveAgent(); showLogin(); }
      else { leaveAgent(); showForm(); }
    }).catch(function () {
      if (document.body.classList.contains('is-agent')) return;   // เคยเป็นตัวแทน: ใช้ข้อมูลที่โหลดไว้แสดงต่อ
      card.innerHTML = '<div class="ag-load">ເຊື່ອມຕໍ່ເຊີບເວີບໍ່ໄດ້</div><button class="ag-go" type="button" id="agRe">ລອງໃໝ່</button>';
      $('#agRe').onclick = function () { card.innerHTML = '<div class="ag-load"><span class="ag-sp"></span></div>'; loadStatus(); };
    });
  }
  /* เคยเป็นตัวแทน (จำไว้ในเครื่อง): แสดงแดชบอร์ดทันทีไม่ต้องรอเช็กสถานะ */
  if (document.body.classList.contains('is-agent')) { setTitles(true); dash.hidden = false; dash.classList.add('ad-in'); buildShell(); started = true; loadOrders(); loadBalance(); }
  var back = $('#agBack');
  if (back) back.addEventListener('click', function (e) { if (history.length > 1) { e.preventDefault(); history.back(); } });
  loadStatus(); loadContacts();
})();
