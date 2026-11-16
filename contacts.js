/* ช่องทางติดต่อร้าน — ใช้ร่วมกันทั้งหน้าแอดมิน / หน้าเติมเงิน / เมนูหน้าแรก
   ข้อมูลเก็บใน Supabase (site_contacts) · อ่านด้วย shop_contacts · แอดมินบันทึกด้วย admin_contacts_save
   ต้องโหลด guard.js (exRpc) ก่อน */
(function () {
  const svg = d => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const KINDS = {
    discord:   { n: 'Discord',   c: '#5865F2', s: 'D', ph: 'ລິ້ງເຊີນ Discord (discord.gg/xxxx)' },
    facebook:  { n: 'Facebook',  c: '#1877F2', s: 'f', ph: 'ລິ້ງເພຈ/ໂປຣໄຟລ໌ ຫຼື ຊື່ຜູ້ໃຊ້' },
    whatsapp:  { n: 'WhatsApp',  c: '#25D366', s: 'W', ph: 'ເບີ WhatsApp ເຊັ່ນ 8562012345678' },
    telegram:  { n: 'Telegram',  c: '#229ED9', s: 'T', ph: '@ຊື່ຜູ້ໃຊ້ ຫຼື ລິ້ງ t.me/...' },
    line:      { n: 'LINE',      c: '#06C755', s: 'L', ph: 'LINE ID ຫຼື @ບັນຊີທາງການ ຫຼື ລິ້ງ' },
    tiktok:    { n: 'TikTok',    c: '#FE2C55', s: 'T', ph: '@ຊື່ຜູ້ໃຊ້ ຫຼື ລິ້ງ TikTok' },
    instagram: { n: 'Instagram', c: '#E1306C', s: 'I', ph: '@ຊື່ຜູ້ໃຊ້ ຫຼື ລິ້ງ Instagram' },
    youtube:   { n: 'YouTube',   c: '#FF0000', s: 'Y', ph: 'ລິ້ງຊ່ອງ YouTube' },
    phone:     { n: 'ໂທລະສັບ',    c: '#22c55e', s: svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'), ph: 'ເບີໂທ ເຊັ່ນ 020 12345678' },
    email:     { n: 'ອີເມວ',      c: '#f59e0b', s: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'), ph: 'name@example.com' },
    website:   { n: 'ເວັບໄຊ',     c: '#8b5cf6', s: svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/>'), ph: 'ລິ້ງເວັບໄຊ https://...' }
  };
  const ORDER = Object.keys(KINDS);

  const isUrl = v => /^https?:\/\//i.test(v);
  function safeUrl(v) {
    v = String(v || '').trim();
    if (!v || /\s/.test(v)) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(v) && !isUrl(v)) return '';          // กัน javascript: / data: ฯลฯ
    try { const u = new URL(isUrl(v) ? v : 'https://' + v); return /^https?:$/.test(u.protocol) && u.hostname.includes('.') ? u.href : ''; } catch (e) { return ''; }
  }
  const user = v => String(v || '').trim().replace(/^@+/, '');
  const okUser = v => /^[A-Za-z0-9._-]{2,64}$/.test(v);

  /* สร้างลิงก์จริงจากสิ่งที่แอดมินกรอก — คืน '' ถ้ากรอกไม่ถูกรูปแบบ */
  function href(kind, value) {
    const v = String(value || '').trim();
    if (!v) return '';
    switch (kind) {
      case 'phone': { const d = v.replace(/[^\d+]/g, ''); return d.replace(/\D/g, '').length >= 6 ? 'tel:' + d : ''; }
      case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'mailto:' + v : '';
      case 'whatsapp': { if (isUrl(v) || /^(wa\.me|api\.whatsapp\.com)/i.test(v)) return safeUrl(v); const d = v.replace(/\D/g, ''); return d.length >= 8 ? 'https://wa.me/' + d : ''; }
      case 'telegram': { if (isUrl(v) || /^t\.me\//i.test(v)) return safeUrl(v); const u = user(v); return okUser(u) ? 'https://t.me/' + u : ''; }
      case 'line': { if (isUrl(v) || /^line\.me\//i.test(v)) return safeUrl(v); const u = v.replace(/^~/, ''); if (u[0] === '@') return okUser(u.slice(1)) ? 'https://line.me/R/ti/p/@' + u.slice(1) : ''; return okUser(u) ? 'https://line.me/R/ti/p/~' + u : ''; }
      case 'tiktok': { if (isUrl(v) || /^(www\.)?tiktok\.com\//i.test(v)) return safeUrl(v); const u = user(v); return okUser(u) ? 'https://www.tiktok.com/@' + u : ''; }
      case 'instagram': { if (isUrl(v) || /^(www\.)?instagram\.com\//i.test(v)) return safeUrl(v); const u = user(v); return okUser(u) ? 'https://www.instagram.com/' + u : ''; }
      case 'facebook': { if (isUrl(v) || /^((www|m)\.)?(facebook|fb)\.com\/|^m\.me\//i.test(v)) return safeUrl(v); const u = user(v); return okUser(u) ? 'https://www.facebook.com/' + u : ''; }
      case 'discord': return isUrl(v) || /^(discord\.gg|discord\.com|discordapp\.com)\//i.test(v) ? safeUrl(v) : '';
      default: return safeUrl(v);                                           // youtube / website
    }
  }

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* รายการสำหรับแสดงผล: { name, hint, color, short, href } */
  function view(c) {
    const k = KINDS[c.kind] || KINDS.website, v = String(c.value || '').trim();
    const raw = ['phone', 'email', 'whatsapp', 'telegram', 'line'].includes(c.kind) && !isUrl(v);
    return { kind: c.kind, name: c.label || k.n, hint: raw ? v : (c.label ? k.n : ''), color: k.c, short: k.s, href: href(c.kind, v) };
  }
  const itemHTML = c => `<a href="${esc(c.href)}"${/^https?:/.test(c.href) ? ' target="_blank"' : ''} rel="noopener noreferrer"><span class="d" style="background:${c.color}">${c.short}</span>${esc(c.name)}<em>${esc(c.hint)}</em></a>`;

  async function load() {
    const rows = await exRpc('shop_contacts', {});
    return (Array.isArray(rows) ? rows : []).map(view).filter(c => c.href);
  }

  /* ===== แผ่นเลือกช่องทางติดต่อ (เปิดจากเมนูบัญชีหน้าแรก) ===== */
  let styled = false;
  function openSheet() {
    if (!styled) {
      styled = true;
      const st = document.createElement('style');
      st.textContent = `.exct{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.6);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;transition:opacity .2s}
.exct.show{opacity:1}
.exct-p{width:100%;max-width:520px;max-height:82vh;display:flex;flex-direction:column;background:var(--card,#0b0b0b);color:var(--text,#f2f2f2);border:1px solid var(--border,#222);border-bottom:0;border-radius:24px 24px 0 0;padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 18px);transform:translateY(24px);transition:transform .25s cubic-bezier(.2,1,.3,1)}
.exct.show .exct-p{transform:none}
.exct-h{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:4px}
.exct-h b{font-size:18px;font-weight:700}
.exct-x{width:32px;height:32px;border-radius:50%;background:rgba(128,128,128,.18);color:inherit;font-size:15px;border:0;cursor:pointer}
.exct-s{font-size:13px;color:var(--muted,#888);margin-bottom:12px}
.exct-l{display:flex;flex-direction:column;gap:9px;overflow-y:auto;overscroll-behavior:contain}
.exct-l a{display:flex;align-items:center;gap:12px;min-height:52px;padding:8px 14px;border-radius:14px;background:var(--bg,#000);border:1px solid var(--border,#222);color:inherit;text-decoration:none;font-size:15px;font-weight:600}
.exct-l a:active{transform:scale(.98)}
.exct-l a .d{width:34px;height:34px;flex:none;border-radius:10px;display:flex;align-items:center;justify-content:center;font:800 14px sans-serif;color:#fff}
.exct-l a em{margin-left:auto;font-style:normal;font-weight:300;font-size:12.5px;color:var(--muted,#888);max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.exct-e{padding:26px 8px;text-align:center;color:var(--muted,#888);font-size:14px;border:1px dashed var(--border,#333);border-radius:14px}`;
      document.head.appendChild(st);
    }
    const o = document.createElement('div');
    o.className = 'exct';
    o.innerHTML = `<div class="exct-p" role="dialog" aria-modal="true" aria-label="ຕິດຕໍ່ແອດມິນ"><div class="exct-h"><b>ຕິດຕໍ່ແອດມິນ</b><button class="exct-x" type="button" aria-label="ປິດ">✕</button></div><div class="exct-s">ເລືອກຊ່ອງທາງທີ່ສະດວກ</div><div class="exct-l"><div class="exct-e">ກຳລັງໂຫຼດ...</div></div></div>`;
    document.body.appendChild(o);
    requestAnimationFrame(() => o.classList.add('show'));
    const close = () => { o.classList.remove('show'); setTimeout(() => o.remove(), 220); document.removeEventListener('keydown', key); };
    const key = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', key);
    o.addEventListener('click', e => { if (e.target === o || e.target.closest('.exct-x')) close(); else if (e.target.closest('a')) setTimeout(close, 150); });
    load().then(list => {
      $l().innerHTML = list.length ? list.map(itemHTML).join('') : '<div class="exct-e">ຍັງບໍ່ມີຊ່ອງທາງຕິດຕໍ່</div>';
    }).catch(() => { $l().innerHTML = '<div class="exct-e">ໂຫຼດບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່</div>'; });
    function $l() { return o.querySelector('.exct-l'); }
  }


  /* ===== ไอคอนแอป (ใช้โชว์ท้ายหน้าแรก) ===== */
  const GRAD = {
    discord: 'linear-gradient(145deg,#6b78ff,#3b45e6)', facebook: 'linear-gradient(145deg,#2f9bff,#0a5bd8)',
    whatsapp: 'linear-gradient(145deg,#3eea84,#10a04b)', telegram: 'linear-gradient(145deg,#41bdf2,#1a86c8)',
    line: 'linear-gradient(145deg,#34e676,#05a844)', tiktok: 'linear-gradient(145deg,#ff4d7a,#c4143f)',
    instagram: 'linear-gradient(45deg,#fdb94a 0%,#f2622d 28%,#d62976 58%,#962fbf 82%,#5b5fe0 100%)',
    youtube: 'linear-gradient(145deg,#ff4545,#c80000)', phone: 'linear-gradient(145deg,#3bd882,#15a04c)',
    email: 'linear-gradient(145deg,#ffbb3a,#ea8200)', website: 'linear-gradient(145deg,#a678ff,#6a3bef)'
  };
  const sk = d => `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const fl = (d, extra) => `<svg viewBox="0 0 24 24" fill="#fff" ${extra || ''} aria-hidden="true">${d}</svg>`;
  const GLYPH = {
    facebook: fl('<path d="M22 12a10 10 0 1 0-11.560 9.880v-6.990H7.900V12h2.540V9.800c0-2.500 1.490-3.890 3.770-3.890 1.090 0 2.240.2 2.240.2v2.460h-1.260c-1.240 0-1.630.77-1.630 1.560V12h2.780l-.44 2.890h-2.340v6.990A10 10 0 0 0 22 12z"/>'),
    discord: fl('<path d="M20.300 4.400A19.800 19.800 0 0 0 15.400 3l-.2.500a18.300 18.300 0 0 0-6.400 0L8.600 3a19.800 19.800 0 0 0-4.900 1.400C.6 9-.3 13.500.1 17.900a19.900 19.900 0 0 0 6 3l1.200-2a13 13 0 0 1-2-1l.5-.4a14.200 14.200 0 0 0 12.200 0l.5.400c-.6.400-1.300.7-2 1l1.200 2a19.900 19.900 0 0 0 6-3c.5-5.100-.8-9.600-3.400-13.500zM8 15.200c-1.200 0-2.100-1.100-2.100-2.400S6.800 10.400 8 10.400s2.100 1.100 2.100 2.400-.9 2.400-2.100 2.400zm8 0c-1.200 0-2.100-1.100-2.100-2.400s.9-2.400 2.100-2.400 2.100 1.100 2.100 2.400-.9 2.400-2.100 2.400z"/>'),
    whatsapp: sk('<path d="M3 21l1.650-4.900A9 9 0 1 1 8 19.300z"/>') .replace('</svg>', '<path d="M9 8.800c-.4 2.600 3.200 6.400 6 6.200l1.100-1.200-2-1.200-.9.800a4 4 0 0 1-1.900-1.900l.8-.9-1.200-2z" fill="#fff" stroke="none"/></svg>'),
    telegram: fl('<path fill-rule="evenodd" d="M21.500 3.500 2.600 10.800c-.8.300-.8 1.400 0 1.700l4.700 1.500 1.800 5.600c.2.600.9.800 1.400.4l2.600-2.200 4.600 3.400c.6.400 1.400.1 1.600-.6L23 4.800c.2-.9-.7-1.600-1.500-1.300zM9.300 13.700l9-5.600-7 6.800-.4 3.500z"/>'),
    line: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 3C6.500 3 2 6.600 2 11c0 3.900 3.500 7.200 8.300 7.900.3.100.8.200.9.500.1.300 0 .7 0 1l-.1.800c0 .2-.2.900.8.500s5.100-3 6.900-5.100C20.300 15.200 22 13.200 22 11c0-4.400-4.500-8-10-8z"/><text x="12" y="12.600" text-anchor="middle" font-size="5.400" font-weight="800" font-family="Arial,sans-serif" style="fill:var(--c)">LINE</text></svg>',
    tiktok: fl('<path d="M16.600 5.800A4.300 4.300 0 0 1 15.500 3h-3.100v12.400a2.600 2.600 0 1 1-2.600-2.600c.3 0 .5 0 .8.100V9.700a5.700 5.700 0 1 0 4.900 5.600V9a7.400 7.400 0 0 0 4.300 1.400V7.300a4.300 4.300 0 0 1-3.200-1.500z"/>'),
    instagram: sk('<rect x="3" y="3" width="18" height="18" rx="5.500"/><circle cx="12" cy="12" r="4.200"/><circle cx="17.300" cy="6.700" r="1" fill="#fff" stroke="none"/>'),
    youtube: fl('<path fill-rule="evenodd" d="M21.600 7.200a2.500 2.500 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800C22 15.200 22 12 22 12s0-3.200-.4-4.800zM10 15V9l5.200 3z"/>'),
    phone: sk('<path d="M22 16.900v3a2 2 0 0 1-2.200 2 19.800 19.800 0 0 1-8.600-3.100 19.500 19.500 0 0 1-6-6A19.800 19.800 0 0 1 2.100 4.200 2 2 0 0 1 4.100 2h3a2 2 0 0 1 2 1.700c.1 1 .4 1.900.7 2.800a2 2 0 0 1-.5 2.100L8.100 9.900a16 16 0 0 0 6 6l1.300-1.300a2 2 0 0 1 2.100-.4c.9.300 1.800.6 2.800.7a2 2 0 0 1 1.700 2z"/>'),
    email: sk('<rect x="2.500" y="4.500" width="19" height="15" rx="2.500"/><path d="m21.500 8-9.500 6L2.500 8"/>'),
    website: sk('<circle cx="12" cy="12" r="9.500"/><path d="M2.500 12h19"/><path d="M12 2.500a14.500 14.500 0 0 1 0 19 14.500 14.500 0 0 1 0-19z"/>')
  };
  const iconHTML = (c, i) => `<a class="ftc-a" href="${esc(c.href)}"${/^https?:/.test(c.href) ? ' target="_blank"' : ''} rel="noopener noreferrer" aria-label="${esc(c.name)}" title="${esc(c.name)}" style="--i:${i};--c:${c.color};--g:${GRAD[c.kind] || c.color}"><span class="ftc-t">${GLYPH[c.kind] || c.short}</span><span class="ftc-n">${esc(c.name)}</span></a>`;

  let iconCss = false;
  function mountIcons(el) {
    if (!el) return;
    if (!iconCss) {
      iconCss = true;
      const st = document.createElement('style');
      st.textContent = `.ftc{display:flex;flex-direction:column;align-items:center;gap:14px;width:100%}
.ftc-h{font-size:12.5px;letter-spacing:.4px;color:var(--muted,#888)}
.ftc-l{display:flex;flex-wrap:wrap;justify-content:center;gap:16px 10px;max-width:440px}
.ftc-a{width:72px;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--muted,#888);font-size:11.5px;text-decoration:none;-webkit-tap-highlight-color:transparent;opacity:0;transform:translateY(10px) scale(.88);animation:ftcIn .55s cubic-bezier(.2,1.25,.4,1) forwards;animation-delay:calc(var(--i)*70ms)}
.ftc-t{position:relative;width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:var(--g);box-shadow:0 10px 22px -8px var(--c),inset 0 1px 0 rgba(255,255,255,.4),inset 0 -12px 18px rgba(0,0,0,.2);transition:transform .2s cubic-bezier(.2,1.4,.4,1),box-shadow .2s}
.ftc-t::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(160deg,rgba(255,255,255,.32),rgba(255,255,255,0) 52%);pointer-events:none}
.ftc-t svg{position:relative;width:28px;height:28px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.25))}
.ftc-a:active .ftc-t{transform:scale(.88)}
@media (hover:hover){.ftc-a:hover .ftc-t{transform:translateY(-3px) scale(1.06);box-shadow:0 14px 26px -8px var(--c),inset 0 1px 0 rgba(255,255,255,.4)}}
.ftc-n{max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@keyframes ftcIn{to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.ftc-a{animation:none;opacity:1;transform:none}.ftc-t{transition:none}}`;
      document.head.appendChild(st);
    }
    load().then(list => {
      if (!list.length) { el.hidden = true; return; }
      el.innerHTML = `<div class="ftc"><div class="ftc-h">ຕິດຕໍ່ພວກເຮົາ</div><div class="ftc-l">${list.map(iconHTML).join('')}</div></div>`;
      el.hidden = false;
    }).catch(() => { el.hidden = true; });
  }
  const auto = () => mountIcons(document.getElementById('footCt'));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();

  window.exContactKinds = KINDS;
  window.exContactOrder = ORDER;
  window.exContactHref = href;
  window.exContactsLoad = load;
  window.exContactHTML = itemHTML;
  window.exOpenContacts = openSheet;
  window.exMountContactIcons = mountIcons;
})();
