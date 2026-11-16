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

  function card(o, i) {
    const codes = codesOf(o), opt = o.opt ? o.opt + ' × ' + o.qty : '× ' + o.qty;
    const disc = Number(o.discount) || 0;
    return `<article class="oh-card${open === o.no ? ' open' : ''}" data-i="${i}">
      <button class="oh-sum" type="button" aria-expanded="${open === o.no}">
        <span class="oh-si${o.img ? ' has-img' : ''}">${o.img ? `<img src="${esc(o.img)}" alt="" loading="lazy" decoding="async" onerror="this.parentNode.classList.remove('has-img');this.replaceWith(Object.assign(document.createElement('span'),{innerHTML:'${ic('o-bag').replace(/'/g,"\\'")}'}).firstChild)">` : ic('o-bag')}</span>
        <span class="oh-mid"><b>${esc(o.name || 'ສິນຄ້າ')}</b><small>${esc(opt)} · ${esc(stamp(o.at))}</small></span>
        <span class="oh-end"><span class="oh-amt">-${fmt(o.total)}</span>${ic('o-chev').replace('class="i"', 'class="i oh-chev"')}</span>
      </button>
      <div class="oh-more"><div><div class="oh-in">
        <div class="oh-kv"><span>ເລກທີ່ຄຳສັ່ງຊື້</span><b>${esc(o.no)}</b></div>
        <div class="oh-kv"><span>ວັນທີ / ເວລາ</span><b>${esc(stamp(o.at))}</b></div>
        <div class="oh-kv"><span>ຈຳນວນ</span><b>${esc(o.qty)} ຊິ້ນ</b></div>
        ${disc > 0 ? `<div class="oh-kv off"><span>ສ່ວນຫຼຸດ</span><b>-${fmt(disc)}</b></div>` : ''}
        <div class="oh-kv"><span>ຍອດຊຳລະ</span><b>${fmt(o.total)}</b></div>
        <div class="oh-codes">
          <div class="oh-ch"><span>ຄີ / ໂຄ້ດ (${codes.length})</span>${codes.length ? `<div class="oh-tools">
            <button class="oh-mini" type="button" data-act="all">${ic('o-copy')}ຄັດລອກທັງໝົດ</button>
            <button class="oh-mini" type="button" data-act="dl">${ic('o-dl')}ບັນທຶກ</button></div>` : ''}</div>
          ${codes.length ? codes.map((c, k) => `<div class="oh-code"><code>${esc(c)}</code><button type="button" data-act="one" data-k="${k}" aria-label="ຄັດລອກ">${ic('o-copy')}</button></div>`).join('')
            : '<div class="oh-nocode">ບໍ່ມີຂໍ້ມູນຄີສຳລັບຄຳສັ່ງຊື້ນີ້</div>'}
        </div>
      </div></div></div>
    </article>`;
  }

  function skeleton() { list.innerHTML = '<div class="oh-sk"></div><div class="oh-sk"></div><div class="oh-sk"></div>'; cnt.textContent = ''; }

  function render() {
    const k = q.value.trim().toLowerCase();
    const rows = orders.map((o, i) => ({ o, i })).filter(({ o }) => !k || [o.name, o.opt, o.no].some(v => String(v || '').toLowerCase().includes(k)));
    if (!orders.length) { cnt.textContent = ''; list.innerHTML = '<div class="oh-empty">ຍັງບໍ່ມີປະຫວັດການສັ່ງຊື້<small>ເມື່ອຊື້ສິນຄ້າແລ້ວ ລາຍການຈະມາຢູ່ບ່ອນນີ້</small></div>'; return; }
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
    exRpc('member_order_list', { p_token: exToken(), p_limit: 200 }).then(j => {
      if (j && j.ok) { orders = Array.isArray(j.orders) ? j.orders : []; render(); }
      else if (j && j.code === 'bad_session') { exClearLocal(); exNeedLogin('orders.html'); }
      else fail('ໂຫຼດປະຫວັດບໍ່ສຳເລັດ');
    }).catch(err => {
      const missing = err && (err.status === 404 || (err.body && err.body.code === 'PGRST202'));
      fail(missing ? 'ຍັງບໍ່ໄດ້ຕິດຕັ້ງຟັງຊັນ member_order_list ໃນຖານຂໍ້ມູນ' : 'ເຊື່ອມຕໍ່ເຊີບເວີບໍ່ໄດ້ ກະລຸນາກວດອິນເຕີເນັດ');
    });
  }

  /* กดการ์ด = กาง/ย่อ · ปุ่มคัดลอก/บันทึกในการ์ด */
  list.addEventListener('click', e => {
    const el = e.target.closest('.oh-card'); if (!el) return;
    const o = orders[Number(el.dataset.i)]; if (!o) return;
    const b = e.target.closest('[data-act]');
    if (b) {
      const codes = codesOf(o), act = b.dataset.act;
      if (act === 'one') { copy(codes[Number(b.dataset.k)] || '').then(() => { b.classList.add('ok'); setTimeout(() => b.classList.remove('ok'), 1200); toast('ຄັດລອກແລ້ວ'); }); }
      else if (act === 'all') { copy(codes.join('\n')).then(() => toast('ຄັດລອກໂຄ້ດທັງໝົດແລ້ວ')); }
      else if (act === 'dl') {
        const txt = ['EXSHOP', '------------------------', 'ເລກທີ່ຄຳສັ່ງຊື້: ' + o.no, 'ວັນທີ: ' + stamp(o.at), 'ສິນຄ້າ: ' + (o.name || '') + ' · ' + (o.opt || '') + ' × ' + o.qty, '', ...codes].join('\n');
        const a = document.createElement('a'), u = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
        a.href = u; a.download = o.no + '.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1500);
      }
      return;
    }
    if (e.target.closest('.oh-sum')) {
      const was = el.classList.contains('open');
      list.querySelectorAll('.oh-card.open').forEach(c => { c.classList.remove('open'); $('.oh-sum', c).setAttribute('aria-expanded', 'false'); });
      open = was ? null : o.no;
      if (!was) { el.classList.add('open'); $('.oh-sum', el).setAttribute('aria-expanded', 'true'); }
    }
  });

  let st;
  q.addEventListener('input', () => { clr.hidden = !q.value; clearTimeout(st); st = setTimeout(render, 120); });
  clr.addEventListener('click', () => { q.value = ''; clr.hidden = true; render(); q.focus(); });
  window.addEventListener('pageshow', e => { if (e.persisted) load(); });

  load();
})();
