/* หน้าโปรไฟล์: ข้อมูลบัญชี · เวลาใช้งานสด · ยอดเงิน · สถิติเติม/ซื้อ · ประวัติ · เปลี่ยนรหัสผ่าน · ออกจากระบบ
   ต้องใช้: guard.js (exRpc, exToken, exLogout, exSessionStart) และ exlog.js (ExLog) */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const fmt = n => '₭' + Math.round(Number(n) || 0).toLocaleString('en-US');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const stamp = t => { const d = new Date(t); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  let toastT;
  function toast(msg, kind) {
    const t = $('#pfToast'); t.dataset.k = kind || 'ok';
    $('use', t).setAttribute('href', kind === 'error' ? '#p-alert' : '#p-check');
    $('span', t).textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3600);
  }

  /* ---------- กลับ ---------- */
  $('#pfBack').addEventListener('click', e => { if (document.referrer && history.length > 1) { e.preventDefault(); history.back(); } });

  /* ---------- ชื่อผู้ใช้ ---------- */
  function setName(n) {
    n = String(n || '');
    $('#pfName').textContent = n || '—';
    $('#pfAv').textContent = n ? n.charAt(0) : '?';
  }
  (function () { let u = null; try { u = JSON.parse(localStorage.getItem('exUser') || 'null'); } catch (e) {} setName(u && u.name); })();

  /* ตรวจ token กับเซิร์ฟเวอร์ — หมดอายุ = ล้างแล้วพาไปล็อกอินใหม่ / ออฟไลน์ = ใช้ข้อมูลในเครื่องต่อ */
  const tok = exToken();
  exRpc('member_me', { p_token: tok }).then(j => {
    if (j && j.ok) { setName(j.username); try { localStorage.setItem('exUser', JSON.stringify({ name: j.username })); } catch (e) {} }
    else { exClearLocal(); exNeedLogin('profile.html'); }
  }).catch(() => {});

  /* อีเมล / วันที่สมัคร (ใช้ได้เมื่อรันไฟล์ SQL member_profile แล้ว — ถ้ายังไม่มีก็แค่ไม่แสดง) */
  exRpc('member_profile', { p_token: tok }).then(j => {
    if (!j || !j.ok) return;
    const rows = [];
    if (j.email) rows.push(`<span><svg class="i"><use href="#p-mail"/></svg>${esc(j.email)}</span>`);
    if (j.created_at) { const d = new Date(j.created_at); if (!isNaN(d)) rows.push(`<span><svg class="i"><use href="#p-cal"/></svg>ສະໝັກເມື່ອ ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}</span>`); }
    $('#pfMeta').innerHTML = rows.join('');
  }).catch(() => {});

  /* ---------- เวลาใช้งานสด ---------- */
  const start = exSessionStart();
  { const d = new Date(start); $('#pfSince').textContent = 'ເຂົ້າສູ່ລະບົບເມື່ອ ' + stamp(d); }
  function tick() {
    let s = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    $('#pfTimer').textContent = (d ? d + ' ວັນ ' : '') + pad(h) + ':' + pad(m) + ':' + pad(x);
  }
  tick(); setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  /* ---------- ยอดเงิน + สถิติ + ประวัติ ---------- */
  function paint() {
    let bal = 0; try { bal = Number(JSON.parse(localStorage.getItem('exshop_balance') || '0')) || 0; } catch (e) {}
    $('#pfBal').textContent = fmt(bal);

    const s = ExLog.stats();
    $('#stTopAll').textContent = fmt(s.topupAll);  $('#stTopAllN').textContent = s.topupAllN + ' ຄັ້ງ';
    $('#stTop7').textContent = fmt(s.topup7);      $('#stTop7N').textContent = s.topup7N + ' ຄັ້ງ';
    $('#stBuyAll').textContent = s.buyAll.toLocaleString('en-US');
    $('#stBuyAllN').textContent = s.buyAllOrders + ' ຄຳສັ່ງຊື້ · ໃຊ້ໄປ ' + fmt(s.spentAll);
    $('#stBuy7').textContent = s.buy7.toLocaleString('en-US');
    $('#stBuy7N').textContent = s.buy7Orders + ' ຄຳສັ່ງຊື້ · ໃຊ້ໄປ ' + fmt(s.spent7);

    const rows = ExLog.topups().map(r => ({ t: r.t, kind: 'top', title: 'ເຕີມເງິນ', sub: r.bank && r.bank !== 'demo' ? String(r.bank).toUpperCase() : 'ເຕີມເງິນ', amt: '+' + fmt(r.amount) }))
      .concat(ExLog.orders().map(r => ({ t: r.t, kind: 'buy', title: r.name || 'ສິນຄ້າ', sub: (r.opt ? r.opt + ' × ' : '× ') + r.qty + (r.no ? ' · ' + r.no : ''), amt: '-' + fmt(r.total) })))
      .sort((a, b) => b.t - a.t).slice(0, 10);
    $('#pfHist').innerHTML = rows.length
      ? rows.map(r => `<div class="pf-row is-${r.kind}"><div class="pf-ri"><svg class="i"><use href="#${r.kind === 'top' ? 'p-wallet' : 'p-bag'}"/></svg></div>
          <div class="pf-rt"><b>${esc(r.title)}</b><small>${esc(r.sub)} · ${stamp(r.t)}</small></div><span class="pf-ra">${esc(r.amt)}</span></div>`).join('')
      : '<div class="pf-empty">ຍັງບໍ່ມີກິດຈະກຳ — ເຕີມເງິນ ຫຼື ຊື້ສິນຄ້າເພື່ອເລີ່ມຕົ້ນ</div>';
  }
  paint();
  window.addEventListener('pageshow', paint);
  window.addEventListener('storage', paint);

  /* ---------- เปลี่ยนรหัสผ่าน ---------- */
  const form = $('#pwForm'), fOld = $('#pwOld'), fNew = $('#pwNew'), fNew2 = $('#pwNew2'), go = $('#pwGo');
  const MSG = {
    old: 'ກະລຸນາປ້ອນລະຫັດຜ່ານເກົ່າ', short: 'ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ', long: 'ລະຫັດຜ່ານຍາວເກີນໄປ (ສູງສຸດ 72 ໄບຕ໌)',
    same: 'ລະຫັດຜ່ານໃໝ່ຕ້ອງຕ່າງຈາກລະຫັດເກົ່າ', match: 'ລະຫັດຜ່ານບໍ່ກົງກັນ'
  };
  const rules = {
    pwOld: v => v ? '' : MSG.old,
    pwNew: v => v.length < 6 ? MSG.short : new TextEncoder().encode(v).length > 72 ? MSG.long : v === fOld.value ? MSG.same : '',
    pwNew2: v => v && v === fNew.value ? '' : MSG.match
  };
  function check(inp) {
    const m = rules[inp.id](inp.value), f = inp.closest('.pf-f');
    f.classList.toggle('bad', !!m); $('.pf-e', f).textContent = m; inp.setAttribute('aria-invalid', !!m);
    return !m;
  }
  [fOld, fNew, fNew2].forEach(i => {
    i.addEventListener('blur', () => { if (i.value) check(i); });
    i.addEventListener('input', () => {
      if (i.closest('.pf-f').classList.contains('bad')) check(i);
      if (i === fNew && fNew2.value) check(fNew2);
    });
  });
  const LV = ['', 'ອ່ອນ', 'ພໍໃຊ້', 'ດີ', 'ແຂງແຮງ'];
  fNew.addEventListener('input', () => {
    const v = fNew.value; let l = 0;
    if (v.length >= 6) l++;
    if (v.length >= 10) l++;
    if (/[a-z]/i.test(v) && /\d/.test(v)) l++;
    if (/[^A-Za-z0-9]/.test(v) && v.length >= 8) l++;
    if (!v) l = 0;
    $('#pwStr').dataset.l = l; $('#pwStrT').textContent = LV[l];
  });
  form.querySelectorAll('.pf-eye').forEach(b => b.addEventListener('click', () => {
    const inp = $('input', b.parentNode), on = inp.type === 'password';
    inp.type = on ? 'text' : 'password'; b.setAttribute('aria-pressed', on);
    b.setAttribute('aria-label', on ? 'ເຊື່ອງລະຫັດຜ່ານ' : 'ສະແດງລະຫັດຜ່ານ');
    $('use', b).setAttribute('href', on ? '#p-eye-off' : '#p-eye');
  }));
  const CODE = {
    bad_old: 'ລະຫັດຜ່ານເກົ່າບໍ່ຖືກຕ້ອງ', bad_password: MSG.short, same: MSG.same,
    locked: 'ລອງຜິດຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າ 10 ນາທີ ແລ້ວລອງໃໝ່', bad_session: 'ເຊດຊັນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
  };
  let busy = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const bad = [fOld, fNew, fNew2].filter(i => !check(i));
    if (bad.length) { bad[0].focus(); return; }
    busy = true; go.classList.add('busy'); go.disabled = true;
    try {
      const j = await exRpc('member_change_password', { p_token: exToken(), p_old: fOld.value, p_new: fNew.value });
      if (j && j.ok) {
        form.reset(); $('#pwStr').dataset.l = 0; $('#pwStrT').textContent = '';
        toast('ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ');
      } else if (j && j.code === 'bad_session') {
        toast(CODE.bad_session, 'error'); setTimeout(() => { exClearLocal(); exNeedLogin('profile.html'); }, 1400);
      } else {
        const c = j && j.code;
        if (c === 'bad_old') { const f = fOld.closest('.pf-f'); f.classList.add('bad'); $('.pf-e', f).textContent = CODE.bad_old; fOld.focus(); }
        toast(CODE[c] || 'ປ່ຽນລະຫັດຜ່ານບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່', 'error');
      }
    } catch (err) {
      const missing = err && (err.status === 404 || (err.body && err.body.code === 'PGRST202'));
      toast(missing ? 'ຍັງບໍ່ໄດ້ຕິດຕັ້ງຟັງຊັນປ່ຽນລະຫັດຜ່ານໃນຖານຂໍ້ມູນ (ຮັນ supabase_profile.sql)' : 'ເຊື່ອມຕໍ່ເຊີບເວີບໍ່ໄດ້ ກະລຸນາກວດອິນເຕີເນັດແລ້ວລອງໃໝ່', 'error');
    }
    busy = false; go.classList.remove('busy'); go.disabled = false;
  });

  /* ---------- ออกจากระบบ ---------- */
  $('#pfOut').addEventListener('click', () => { if (confirm('ຕ້ອງການອອກຈາກລະບົບບໍ?')) exLogout(); });
})();
