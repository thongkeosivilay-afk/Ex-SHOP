/* หน้าประวัติการสั่งซื้อ — ดึงจาก Supabase ผ่าน RPC member_order_list (ตรวจ token ฝั่งเซิร์ฟเวอร์)
   ต้องใช้: guard.js (exRpc, exToken, exClearLocal, exNeedLogin) */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const fmt = n => '₭' + Math.round(Number(n) || 0).toLocaleString('en-US');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const stamp = t => { const d = new Date(t); return isNaN(d) ? '' : pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const ic = id => `<svg class="i"><use href="#${id}"/></svg>`;

  const list = $('#ohList'), q = $('#ohQ'), clr = $('#ohClr'), cnt = $('#ohCount');
  let orders = [], open = null, toastT;

  $('#ohBack').addEventListener('click', e => { if (document.referrer && history.length > 1) { e.preventDefault(); history.back(); } });

  function toast(msg, kind) {
    const t = $('#ohToast'); t.dataset.k = kind || 'ok';
    $('use', t).setAttribute('href', kind === 'error' ? '#o-alert' : '#o-check');
    $('span', t).textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }
  function copy(text) {
    const fb = () => { const a = document.createElement('textarea'); a.value = text; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove(); };
    return (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text).catch(fb) : (fb(), Promise.resolve()));
  }
  const codesOf = o => Array.isArray(o.codes) ? o.codes.map(String).filter(Boolean) : [];

  const BANK = { bcel: 'BCEL', ldb: 'LDB', jdb: 'JDB', apb: 'APB' };
  const ST = { pending: 'ລໍຖ້າກວດສອບ', approved: 'ສຳເລັດ', rejected: 'ບໍ່ຜ່ານ' };
  const bankName = r => BANK[String(r.bank || '').toLowerCase()] || String(r.bank || 'ເຕີມເງິນ').toUpperCase();
  const stName = r => ST[r.status] || String(r.status || '');
  const badge = r => `<span class="tp-st ${esc(r.status)}">${esc(stName(r))}</span>`;
  function card(o, i) {
    const k = String(o.bank || '').toLowerCase(), done = o.status === 'approved';
    const logo = k ? `<img src="logos/${esc(k)}.png" alt="" loading="lazy" onerror="this.parentNode.classList.remove('bank');this.replaceWith(Object.assign(document.createElement('span'),{innerHTML:'${ic('o-wallet').replace(/'/g, "\\'")}'}).firstChild)">` : ic('o-wallet');
    return `<article class="oh-card${open === o.id ? ' open' : ''}" data-i="${i}">
      <button class="oh-sum" type="button" aria-expanded="${open === o.id}">
        <span class="oh-si${k ? ' bank' : ''}">${logo}</span>
        <span class="oh-mid"><b>ເຕີມເງິນ · ${esc(bankName(o))}</b><small>${esc(stamp(o.at))}</small></span>
        <span class="oh-end"><span class="oh-amt${done ? ' plus' : ''}">${done ? '+' : ''}${fmt(o.amount)}</span>${badge(o)}</span>
      </button>
      <div class="oh-more"><div><div class="oh-in">
        <div class="oh-kv"><span>ເລກທີ່ລາຍການ</span><b>#${esc(o.id)}</b></div>
        <div class="oh-kv"><span>ທະນາຄານ</span><b>${esc(bankName(o))}</b></div>
        <div class="oh-kv"><span>ຈຳນວນເງິນ</span><b>${fmt(o.amount)}</b></div>
        <div class="oh-kv"><span>ສົ່ງເມື່ອ</span><b>${esc(stamp(o.at))}</b></div>
        <div class="oh-kv"><span>ສະຖານະ</span>${badge(o)}</div>
        ${o.reviewed_at ? `<div class="oh-kv"><span>ກວດສອບເມື່ອ</span><b>${esc(stamp(o.reviewed_at))}</b></div>` : ''}
      </div></div></div>
    </article>`;
  }

  function skeleton() { list.innerHTML = '<div class="oh-sk"></div><div class="oh-sk"></div><div class="oh-sk"></div>'; cnt.textContent = ''; }

  function render() {
    const k = q.value.trim().toLowerCase();
    const rows = orders.map((o, i) => ({ o, i })).filter(({ o }) => !k || [bankName(o), stName(o), o.status, o.id, o.amount, fmt(o.amount)].some(v => String(v == null ? '' : v).toLowerCase().includes(k)));
    if (!orders.length) { cnt.textContent = ''; list.innerHTML = '<div class="oh-empty">ຍັງບໍ່ມີປະຫວັດເຕີມເງິນ<small>ເມື່ອເຕີມເງິນແລ້ວ ລາຍການຈະມາຢູ່ບ່ອນນີ້</small></div>'; return; }
    cnt.textContent = k ? `ພົບ ${rows.length} ຈາກ ${orders.length} ລາຍການ` : `ທັງໝົດ ${orders.length} ລາຍການ`;
    list.innerHTML = rows.length ? rows.map(({ o, i }) => card(o, i)).join('') : '<div class="oh-empty">ບໍ່ພົບລາຍການທີ່ຄົ້ນຫາ</div>';
  }

  function fail(msg) {
    cnt.textContent = '';
    list.innerHTML = `<div class="oh-empty err"><span>${esc(msg)}</span><button class="oh-mini" type="button" id="ohRetry">ລອງໃໝ່</button></div>`;
    $('#ohRetry').onclick = load;
  }

  function load() {
    skeleton();
    exRpc('member_topup_list', { p_token: exToken() }).then(j => {
      if (j && j.ok) { orders = Array.isArray(j.rows) ? j.rows : []; render(); }
      else if (j && j.code === 'bad_session') { exClearLocal(); exNeedLogin('topups.html'); }
      else fail('ໂຫຼດປະຫວັດບໍ່ສຳເລັດ');
    }).catch(err => {
      const missing = err && (err.status === 404 || (err.body && err.body.code === 'PGRST202'));
      fail(missing ? 'ຍັງບໍ່ໄດ້ຕິດຕັ້ງຟັງຊັນ member_topup_list ໃນຖານຂໍ້ມູນ' : 'ເຊື່ອມຕໍ່ເຊີບເວີບໍ່ໄດ້ ກະລຸນາກວດອິນເຕີເນັດ');
    });
  }

  /* กดการ์ด = กาง/ย่อ · ปุ่มคัดลอก/บันทึกในการ์ด */
  list.addEventListener('click', e => {
    const el = e.target.closest('.oh-card'); if (!el) return;
    const o = orders[Number(el.dataset.i)]; if (!o) return;
    if (e.target.closest('.oh-sum')) {
      const was = el.classList.contains('open');
      list.querySelectorAll('.oh-card.open').forEach(c => { c.classList.remove('open'); $('.oh-sum', c).setAttribute('aria-expanded', 'false'); });
      open = was ? null : o.id;
      if (!was) { el.classList.add('open'); $('.oh-sum', el).setAttribute('aria-expanded', 'true'); }
    }
  });

  let st;
  q.addEventListener('input', () => { clr.hidden = !q.value; clearTimeout(st); st = setTimeout(render, 120); });
  clr.addEventListener('click', () => { q.value = ''; clr.hidden = true; render(); q.focus(); });
  window.addEventListener('pageshow', e => { if (e.persisted) load(); });

  load();
})();
