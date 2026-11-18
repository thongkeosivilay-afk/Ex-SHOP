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
  var lastPrices = null;
  function renderPrices() {
    var box = $('#agPl'); if (!box || !lastPrices) return;
    var rows = lastPrices.map(function (x) {
      var p = nameOf(x.product_id);
      if (!p && window.productsLoaded) return '';
      var nm = p ? p.n : 'ສິນຄ້າ #' + x.product_id;
      var reg = null;
      if (p) { if (x.dur_label && p.durs) { var d = p.durs.filter(function (d) { return d.label === x.dur_label; })[0]; reg = d ? Number(d.price) : null; } else if (!x.dur_label) reg = Number(p.price); }
      var ag = Number(x.price) || 0;
      return '<div class="ag-pr"><span>' + esc(nm) + (x.dur_label ? ' <em>· ' + esc(x.dur_label) + '</em>' : '') + '</span>' + (reg && reg > ag ? '<s>' + money(reg) + '</s>' : '') + '<b>' + money(ag) + '</b></div>';
    }).join('');
    box.innerHTML = rows || '<div class="ag-pe">ຍັງບໍ່ມີສິນຄ້າທີ່ຕັ້ງລາຄາຕົວແທນ ສິນຄ້າທັງໝົດຈະຊື້ໃນລາຄາປົກກະຕິ</div>';
  }
  function showAgent(j) {
    lastPrices = j.prices || [];
    card.innerHTML = '<div class="ag-ok">' + K.ok + '<div><b>ທ່ານເປັນຕົວແທນແລ້ວ</b><small>ລາຄາຕົວແທນມີຜົນທຸກການຊື້</small></div></div>' +
      '<div class="ag-ph">ລາຄາຂອງຂ້ອຍ (' + lastPrices.length + ')</div><div class="ag-pl" id="agPl"><div class="ag-pe"><span class="ag-sp"></span></div></div>';
    renderPrices();
    if (!window.productsLoaded) document.addEventListener('products:ready', renderPrices, { once: true });
    else document.addEventListener('products:ready', renderPrices);
  }
  function loadStatus() {
    if (!(window.exLoggedIn && exLoggedIn())) { showLogin(); return; }
    exRpc('member_agent_prices', { p_token: exToken() }).then(function (j) {
      if (j && j.ok && j.agent) showAgent(j);
      else if (j && j.ok === false && j.code === 'bad_session') showLogin();
      else showForm();
    }).catch(function () {
      card.innerHTML = '<div class="ag-load">ເຊື່ອມຕໍ່ເຊີບເວີບໍ່ໄດ້</div><button class="ag-go" type="button" id="agRe">ລອງໃໝ່</button>';
      $('#agRe').onclick = function () { card.innerHTML = '<div class="ag-load"><span class="ag-sp"></span></div>'; loadStatus(); };
    });
  }
  var back = $('#agBack');
  if (back) back.addEventListener('click', function (e) { if (history.length > 1) { e.preventDefault(); history.back(); } });
  loadStatus(); loadContacts();
})();
