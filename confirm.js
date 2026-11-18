/* ===== confirm.js — หน้ายืนยันสั่งซื้อ (confirm.html) =====
   สินค้า/ตัวเลือก/รูป มาจากฐานข้อมูลผ่าน data.js (products) — ลิงก์: confirm.html?p=<id สินค้า> */

/* ===== หน้ายืนยันสั่งซื้อ (ขายจริง) =====
   - ยอดเงิน: member_me (ฝั่งเซิร์ฟเวอร์)    - ตรวจโค้ดส่วนลด: member_promo
   - ซื้อ: member_buy → ตัดเงินสมาชิก + ตัดโค้ดจากคลัง + บันทึกออเดอร์ ในธุรกรรมเดียว (หน้าเว็บทำได้แค่ขอซื้อ ตัดสินใจที่เซิร์ฟเวอร์) */
(function(){
  let ag = null;    // ราคาตัวแทน { 'รหัสสินค้า|ตัวเลือก': ราคา } (null = ไม่ใช่ตัวแทน)
  let bal = null;   // ยอดเงินสมาชิก (null = ยังไม่ล็อกอิน/ยังโหลดไม่เสร็จ)
  /* ตัวเลือกของสินค้า = ตัวเลือกราคาที่ตั้งในหน้าแอดมิน; สต็อกแยกตามตัวเลือก (จำนวนโค้ดที่เหลือ) ไม่มีตัวเลือก = ขายตามราคาสินค้า */
  function optionsOf(p){
    const tot = Number(p.left) || 0;
    /* ราคาตัวแทน (ถ้าบัญชีนี้เป็นตัวแทน): ใช้ราคาที่ตั้งไว้แทนราคาปกติ — เซิร์ฟเวอร์คิดราคาเดียวกันตอนซื้อจริง */
    const A = (k, v) => { const a = ag && ag[p.id + '|' + k]; return a == null ? v : a; };
    if(p.durs && p.durs.length) return p.durs.map(d => { const v = A(d.label, d.price); return { l: d.label, k: d.label, o: d.price, p: v, s: d.stock == null ? tot : d.stock }; });
    const v = A('', p.price);
    return [{ l: p.n, k: '', o: p.price, p: v, s: tot }];
  }

  /* ยอดเงินบนแถบหัว/โปรไฟล์ อ่านจาก localStorage 'exshop_balance' → ซิงก์ค่าจริงจากเซิร์ฟเวอร์ลงไป */
  const setBal = n => { bal = n; try{ localStorage.setItem('exshop_balance', JSON.stringify(n)); }catch(e){} };
  const loggedIn = () => !!(window.exLoggedIn && exLoggedIn());
  function loadBal(){
    if(!loggedIn()){ bal = null; if(cur) render(); return; }
    exRpc('member_me', { p_token: exToken() }).then(j => {
      if(j && j.ok){ setBal(Number(j.balance) || 0); }
      else { exClearLocal(); bal = null; }
      if(cur) render();
    }, () => { if(cur) render(); });
    exRpc('member_agent_prices', { p_token: exToken() }).then(j => {
      if(!(j && j.ok && j.agent)) return;
      ag = {}; (j.prices || []).forEach(x => { ag[x.product_id + '|' + (x.dur_label || '')] = Number(x.price) || 0; });
      if(cur){ const k = opts[sel] && opts[sel].k; opts = optionsOf(cur); const i = opts.findIndex(o => o.k === k); sel = i < 0 ? 0 : i; render(); }
    }, () => {});
  }
  const $ = (s,r=document)=>r.querySelector(s);
  let toastT; function toast(m){ const s=$('#snack'); s.textContent=m; s.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>s.classList.remove('show'),2200); }
  const fmt = n => '₭' + (Math.round(n*100)/100).toLocaleString('en-US');
  const m2 = n => (Math.round(n)).toLocaleString('en-US') + ' ₭';
  const X = '<svg class="i" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  const CART = '<svg class="i" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>';
  const OKI = '<svg class="i" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
  const LIST = '<svg class="i" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r=".6"/><circle cx="3.5" cy="12" r=".6"/><circle cx="3.5" cy="18" r=".6"/></svg>';
  const TICKET = '<svg class="i" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>';
  const AGI = '<svg class="i" viewBox="0 0 24 24"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m15 9-6 6"/><path d="M9 9h.01M15 15h.01"/></svg>';
  const CHEV = '<svg class="i" viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>';

  const root = document.getElementById('cfApp');
  root.innerHTML = `<div class="cf-form">
      <div class="cf-hero" id="cfImg"></div>
      <div class="cf-meta"><div class="cf-th" id="cfTh"></div>
        <div class="cf-mt"><div class="cf-title" id="cfName"></div><div class="cf-stock" id="cfStock"></div></div></div>

      <div class="cf-box" id="cfBox">
        <button class="cf-bh" id="cfBh" type="button">
          <span class="cf-bi">${LIST}</span><span class="cf-bt">ຕົວເລືອກ</span><span class="cf-chev">${CHEV}</span>
        </button>
        <div class="cf-bb"><div class="cf-bw"><div class="cf-bp">
          <input class="cf-search" id="cfSearch" placeholder="ຄົ້ນຫາຕົວເລືອກ..." autocomplete="off">
          <div class="cf-list" id="cfOpts"></div>
        </div></div></div>
      </div>

      <div class="cf-info"><div class="a"><span>ລາຄາຕໍ່ຊິ້ນ</span><b id="cfRange"></b></div><div class="b"><span>ສ່ວນຫຼຸດສິນຄ້າ</span><b id="cfPct"></b></div></div>
      <div class="cf-qty"><div class="cf-lb" style="margin:14px 0 0">ຈຳນວນ</div>
        <div class="cf-step" style="margin-top:10px"><button id="cfMinus">−</button><output id="cfQty">1</output><button id="cfPlus">+</button></div></div>
      <button class="cf-cp" id="cfCp" type="button">${TICKET}<span class="cf-cpt">ຄູປອງສ່ວນຫຼຸດ</span><span class="cf-cpst" id="cfCpSt"></span><span class="cf-cpc">${CHEV}</span></button>
      <div class="cf-pw" id="cfPw"><div class="cf-pwi"><div class="cf-pwp">
        <div class="cf-promo"><input id="cfCode" placeholder="EX10 / SAVE5" autocomplete="off"><button id="cfApply" disabled>ໃຊ້</button></div>
        <div class="cf-hint" id="cfHint"></div>
      </div></div></div>
      <div class="cf-sum">
        <div class="cf-row tot"><span>ຍອດທີ່ຕ້ອງຈ່າຍ</span><b id="cfTot"></b></div>
        <div class="cf-row"><span>ຍອດເງິນຂອງທ່ານ</span><b id="cfBal"></b></div>
        <div class="cf-row rem"><span>ເຫຼືອຫຼັງຊື້</span><b id="cfRem"></b></div>
      </div>
      <div class="cf-warn" id="cfWarn"><span id="cfWarnT">ຍອດເງິນບໍ່ພໍ ກະລຸນາເຕີມເງິນ</span><button id="cfTop">ເຕີມເງິນ</button></div>
      <div class="cf-act"><button class="cf-ok" id="cfOk">${OKI}ຢືນຢັນຊື້</button></div>
      <div class="cf-det" id="cfDet">
        <h4>ລາຍລະອຽດສິນຄ້າ</h4>
        <div class="cf-notice" id="cfNotice" hidden></div>
        <div class="cf-rich" id="cfDesc"></div>
      </div>
    </div>
    <div class="cf-done rs" id="cfRes" data-s="load" aria-live="polite">
      <div class="rs-ic" id="rsIc">
        <svg viewBox="0 0 96 96" aria-hidden="true">
          <circle class="rs-track" cx="48" cy="48" r="40"/>
          <circle class="rs-arc" cx="48" cy="48" r="40"/>
          <path class="rs-ck" pathLength="1" d="M31 50l12 12 23-26"/>
          <path class="rs-x" pathLength="1" d="M35 35l26 26M61 35L35 61"/>
        </svg>
      </div>
      <h3 class="rs-h rs-in" id="rsH">ກຳລັງດຳເນີນການ...</h3>
      <p class="rs-p rs-in" id="rsP">ກະລຸນາລໍຖ້າ ຢ່າປິດໜ້ານີ້</p>
      <div class="rs-body" id="rsBody"></div>
    </div>
  `;

  let cur=null, opts=[], sel=0, qty=1, applied=null, typed=null, q='', pseq=0, pt;
  const totalStock = () => opts.reduce((s,o)=>s+o.s,0);
  const disc = (sub, pr) => !pr ? 0 : Math.min(sub, pr.type==='pct' ? sub*pr.v/100 : pr.v);
  const toPromo = j => ({ code: j.code, type: j.kind, v: Number(j.value) || 0, t: j.kind === 'pct' ? 'ຫຼຸດ ' + j.value + '%' : 'ຫຼຸດ ' + fmt(j.value) });
  /* ตรวจโค้ดกับเซิร์ฟเวอร์ (หน่วงเล็กน้อยระหว่างพิมพ์) → typed = โค้ดที่ถูกต้อง (ยังไม่กด "ใช้") */
  function checkCode(){
    clearTimeout(pt); typed = null; applied = null;
    const c = $('#cfCode').value.trim();
    render();
    if(!c || !loggedIn()) return;
    const my = ++pseq;
    pt = setTimeout(() => exRpc('member_promo', { p_token: exToken(), p_code: c }).then(j => {
      if(my !== pseq) return;
      typed = (j && j.ok) ? toPromo(j) : false; render();
    }, () => { if(my === pseq){ typed = false; render(); } }), 350);
  }

  function renderList(){
    const kw = q.trim().toLowerCase();
    const rows = opts.map((o,i)=>({o,i})).filter(({o})=>!kw || o.l.toLowerCase().includes(kw));
    $('#cfOpts').innerHTML = rows.length ? rows.map(({o,i})=>`
      <button class="cf-or${i===sel?' on':''}${o.s?'':' off'}" data-i="${i}" ${o.s?'':'disabled'}>
        <span class="cf-oi">${artSq('', cur.img)}</span>
        <span class="cf-ot"><b>${escH(o.l)}</b><span class="cf-op">${o.o > o.p ? `<s>${m2(o.o)}</s>` : ''}<em>${m2(o.p)}</em>${o.o > o.p ? `<i class="cf-ag">${AGI}ຕົວແທນ</i>` : ''}</span></span>
        <span class="cf-ob ${o.s?'ok':'no'}">${o.s ? o.s+' ຊິ້ນ' : 'ສິນຄ້າໝົດ'}</span>
      </button>`).join('') : '<div class="cf-none">ບໍ່ພົບຕົວເລືອກ</div>';
  }

  function render(){
    const o = opts[sel], unit = o.p, stock = o.s;
    qty = Math.max(1, Math.min(qty, stock || 1));
    $('#cfStock').textContent = 'ເຫຼືອລວມ ' + totalStock() + ' ຊິ້ນ · ຕົວເລືອກນີ້ ' + stock + ' ຊິ້ນ';
    renderList();
    const ps=opts.map(x=>x.p), mx=Math.max(...opts.map(x=>x.o ? (1-x.p/x.o)*100 : 0));
    const lo=Math.min(...ps), hi=Math.max(...ps);
    const rg = (a,b) => a===b ? m2(a) : m2(a)+' – '+m2(b);
    const os=opts.map(x=>x.o), olo=Math.min(...os), ohi=Math.max(...os);
    $('#cfRange').innerHTML = (olo>lo || ohi>hi ? `<s>${rg(olo,ohi)}</s>` : '') + `<span>${rg(lo,hi)}</span>`;
    $('#cfPct').textContent = mx.toFixed(2)+' %';
    document.querySelector('.cf-info .b').style.display = mx>0 ? '' : 'none';
    $('#cfQty').textContent = qty;
    $('#cfMinus').disabled = qty<=1; $('#cfPlus').disabled = qty>=stock;
    const sub = unit*qty, d = disc(sub, applied), tot = sub-d, rem = bal == null ? null : bal-tot;
    $('#cfTot').textContent = fmt(tot);
    $('#cfBal').textContent = bal == null ? (loggedIn() ? '...' : '—') : fmt(bal);
    const r = $('#cfRem'); r.textContent = rem == null ? '—' : fmt(rem); r.classList.toggle('neg', rem != null && rem<0);
    $('#cfWarnT').textContent = loggedIn() ? 'ຍອດເງິນບໍ່ພໍ ກະລຸນາເຕີມເງິນ' : 'ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງຍອດເງິນ ແລະ ຊື້ສິນຄ້າ';
    $('#cfTop').textContent = loggedIn() ? 'ເຕີມເງິນ' : 'ເຂົ້າສູ່ລະບົບ';
    $('#cfWarn').classList.toggle('show', rem != null ? rem<0 : !loggedIn());
    $('#cfOk').disabled = !stock;   // เงินไม่พอก็กดได้ → ไปหน้าผลลัพธ์แบบ ✕
    const h = $('#cfHint'); h.className='cf-hint';
    if(applied){ h.classList.add('ok'); h.textContent = '✓ ໃຊ້ໂຄ້ດແລ້ວ · ' + applied.t + ' (-' + fmt(d) + ')'; }
    else if(typed){ h.classList.add('ok'); h.textContent = 'ຈະໄດ້ຮັບສ່ວນຫຼຸດ -' + fmt(disc(sub,typed)) + ' · ກົດ "ໃຊ້" ເພື່ອຢືນຢັນ'; }
    else if($('#cfCode').value.trim()){
      if(!loggedIn()){ h.textContent = 'ເຂົ້າສູ່ລະບົບເພື່ອໃຊ້ໂຄ້ດສ່ວນຫຼຸດ'; }
      else if(typed === false){ h.classList.add('bad'); h.textContent = 'ໂຄ້ດບໍ່ຖືກຕ້ອງ ຫຼື ໝົດສິດແລ້ວ'; }
    }
    $('#cfApply').disabled = !typed || !!applied;
    const st=$('#cfCpSt'); st.textContent = applied ? '✓ ' + applied.code : ''; st.classList.toggle('on', !!applied);
  }

  function open(p){
    cur = p;
    opts = optionsOf(p);
    sel = Math.max(0, opts.findIndex(o=>o.s>0));
    qty = 1; applied = null; typed = null; q = ''; $('#cfCode').value = ''; $('#cfSearch').value = '';
    $('#cfBox').classList.remove('closed'); $('#cfPw').classList.remove('open'); $('#cfCp').classList.remove('open');
    root.classList.remove('done');
    const cfForm = root.querySelector('.cf-form'); if(cfForm) cfForm.style.opacity = '';   // เลิกจางตอนข้อมูลมาแล้ว (เดิมค้างที่ .5)
    $('#cfName').textContent = p.n;
    const dh = cleanHTML(p.desc);
    $('#cfDesc').innerHTML = dh; $('#cfDesc').hidden = !dh.trim();
    const nt = $('#cfNotice'); nt.textContent = p.notice || ''; nt.hidden = !p.notice;
    $('#cfDet').hidden = !dh.trim() && !p.notice;   // ไม่มีรายละเอียดที่แอดมินใส่ = ไม่โชว์กล่อง
    $('#cfImg').innerHTML = artSq('', p.img);
    $('#cfTh').innerHTML = artSq('', p.img, true);
    render(); loadBal();
  }
  function home(){ location.href = 'index.html'; }

  /* คนยังไม่ลงชื่อ: ดูสินค้า/ราคา/ตัวเลือกได้ แต่กดยืนยันซื้อหรือเติมเงินไม่ได้ → พาไปเข้าสู่ระบบแล้วกลับมาหน้านี้ */
  function needLogin(){
    if(window.exLoggedIn && exLoggedIn()) return false;
    toast('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນຊື້ສິນຄ້າ'); setTimeout(()=>exNeedLogin(), 900); return true;
  }
  /* ===== หน้าผลการสั่งซื้อ =====
     ไอคอนโหลดโผล่แบบเบลอ → หมุน → เป็น ✓ (สำเร็จ) หรือ ✕ (เงินไม่พอ) แล้วการ์ดโผล่ตามแบบเบลอ→คม
     ฟังก์ชัน: คัดลอกทีละโค้ด / คัดลอกทั้งหมด / ซ่อน-แสดงโค้ด / บันทึกเป็นไฟล์ .txt / ซื้ออีก / เลขที่ออเดอร์+เวลา */
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICON = {
    copy: '<svg class="i" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
    eye:  '<svg class="i" viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff:'<svg class="i" viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.7A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
    dl:   '<svg class="i" viewBox="0 0 24 24"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/></svg>',
    wallet:'<svg class="i" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z"/><circle cx="16.5" cy="14.5" r="1"/></svg>'
  };
  let busy = false, order = null;
  const res = $('#cfRes'), rsH = $('#rsH'), rsP = $('#rsP'), rsBody = $('#rsBody');

  function setHead(h, p){
    rsH.textContent = h; rsP.textContent = p;
    [rsH, rsP].forEach(el => { el.classList.remove('rs-in'); void el.offsetWidth; el.classList.add('rs-in'); });
  }
  function copyText(t){
    const fb = () => { const a=document.createElement('textarea'); a.value=t; a.style.cssText='position:fixed;opacity:0'; document.body.appendChild(a); a.select(); try{ document.execCommand('copy'); }catch(e){} a.remove(); };
    return (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject()).catch(fb);
  }
  const pad = n => String(n).padStart(2,'0');
  const stamp = d => pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes());
  const rnd = () => Math.random().toString(36).slice(2,6).toUpperCase();

  function showLoading(){
    window.scrollTo(0,0);
    rsBody.innerHTML = '';
    res.dataset.s = 'load';
    const ic = $('#rsIc'); ic.style.animation = 'none'; void ic.offsetWidth; ic.style.animation = '';   // เล่นแอนิเมชันโผล่ใหม่ทุกครั้ง
    setHead('ກຳລັງດຳເນີນການ...', 'ກະລຸນາລໍຖ້າ ຢ່າປິດໜ້ານີ້');
    root.classList.add('done');
  }
  /* หมุนอย่างน้อย 2 รอบให้จบรอบพอดีแล้วค่อยเปลี่ยนเป็น ✓/✕ (ไม่กระตุก) */
  function spinThen(cb){
    const arc = $('#cfRes .rs-arc'); let fired = false;
    const fire = () => { if(fired) return; fired = true; arc.removeEventListener('animationiteration', onIt); cb(); };
    let n = 0; const onIt = () => { if(++n >= 2) fire(); };
    if(REDUCE){ setTimeout(fire, 700); return; }
    arc.addEventListener('animationiteration', onIt);
    setTimeout(fire, 3500);
  }

  const ERR = {
    unavailable: ['ຊື້ບໍ່ໄດ້', 'ສິນຄ້ານີ້ກຳລັງອັບເດດ ຫຼື ປິດຂາຍຊົ່ວຄາວ'],
    notfound: ['ຊື້ບໍ່ໄດ້', 'ບໍ່ພົບສິນຄ້ານີ້ ຫຼື ປິດຂາຍແລ້ວ'],
    dur_notfound: ['ຊື້ບໍ່ໄດ້', 'ຕົວເລືອກນີ້ຖືກປ່ຽນແປງແລ້ວ ກະລຸນາເລືອກໃໝ່'],
    bad_promo: ['ຊື້ບໍ່ໄດ້', 'ໂຄ້ດສ່ວນຫຼຸດບໍ່ຖືກຕ້ອງ ຫຼື ໝົດສິດແລ້ວ'],
    bad_qty: ['ຊື້ບໍ່ໄດ້', 'ຈຳນວນບໍ່ຖືກຕ້ອງ'],
    net: ['ເຊື່ອມຕໍ່ບໍ່ໄດ້', 'ກະລຸນາກວດຍອດເງິນກ່ອນລອງຊື້ໃໝ່ ຖ້າເງິນຖືກຕັດແລ້ວ ຕິດຕໍ່ແອດມິນພ້ອມຊື່ບັນຊີ']
  };
  function doPurchase(){
    if(busy || needLogin()) return;
    const o = opts[sel]; if(!o.s) return;
    const code = applied ? applied.code : null;
    busy = true; showLoading();
    /* ส่งคำขอซื้อไปเซิร์ฟเวอร์ทันที — ไอคอนหมุนอย่างน้อย 2 รอบระหว่างรอผล */
    const req = exRpc('member_buy', { p_token: exToken(), p_product_id: Number(cur.id), p_dur_label: o.k, p_qty: qty, p_promo: code })
      .catch(() => ({ ok:false, code:'net' }));
    spinThen(() => req.then(j => {
      if(j && j.ok) return success(o, j);
      const c = j && j.code;
      if(c === 'credit'){ if(j.have != null) setBal(Number(j.have) || 0); return fail(Number(j.need) || 0, Number(j.have) || 0); }
      if(c === 'bad_session'){ busy = false; exClearLocal(); root.classList.remove('done'); toast('ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'); setTimeout(()=>exNeedLogin(), 900); return; }
      if(c === 'stock') return failMsg('ສິນຄ້າບໍ່ພໍ', 'ເຫຼືອພຽງ ' + (Number(j.have) || 0) + ' ຊິ້ນ ກະລຸນາປັບຈຳນວນ');
      const e = ERR[c] || ['ຊື້ບໍ່ສຳເລັດ', 'ມີບາງຢ່າງຜິດພາດ ກະລຸນາລອງໃໝ່'];
      failMsg(e[0], e[1]);
    }));
  }

  function success(o, j){
    const tot = Number(j.total) || 0, d = Number(j.discount) || 0;
    setBal(Number(j.balance) || 0); o.s = Math.max(0, o.s - qty);
    const codes = Array.isArray(j.codes) ? j.codes : [];
    order = { no:j.no, at:new Date(j.at), name:cur.n, opt:o.l, qty:qty, codes:codes };
    if(window.ExLog) ExLog.addOrder({ no:order.no, name:order.name, opt:order.opt, qty:qty, total:tot });   // ประวัติในเครื่อง (หน้าโปรไฟล์)
    res.dataset.s = 'ok';
    setHead('ສັ່ງຊື້ສຳເລັດ!', 'ໂຄ້ດສິນຄ້າຂອງທ່ານພ້ອມແລ້ວ');
    const row = (l, v, c) => `<div class="rs-r${c?' '+c:''}"><span>${l}</span><b>${v}</b></div>`;
    let i = 0;
    const sum = `<div class="rs-card" style="--i:${i++}">
      ${row('ເລກທີ່ຄຳສັ່ງຊື້', order.no)}${row('ວັນທີ / ເວລາ', stamp(order.at))}
      ${row('ສິນຄ້າ', escH(order.name)+' · '+escH(order.opt)+' × '+qty)}
      ${d>0 ? row('ສ່ວນຫຼຸດ', '-'+fmt(d), 'ok') : ''}
      ${row('ຈ່າຍແລ້ວ', fmt(tot))}${row('ເງິນຄົງເຫຼືອ', fmt(bal))}
    </div>`;
    const cards = codes.map((c,k) => `<div class="rs-card" style="--i:${i++}">
      <div class="rs-ch"><span class="rs-th">${artSq('', cur.img)}</span>
        <div class="rs-ct"><b>${escH(cur.n)}</b><span>${escH(o.l)}</span></div><span class="rs-no">${k+1}/${codes.length}</span></div>
      <div class="rs-cd"><code class="rs-code">${escH(c)}</code>
        <button class="rs-ib" data-eye type="button" aria-label="ເຊື່ອງ / ສະແດງໂຄ້ດ">${ICON.eye}</button>
        <button class="rs-ib" data-copy="${escH(c)}" type="button" aria-label="ຄັດລອກໂຄ້ດ">${ICON.copy}</button></div>
    </div>`).join('');
    rsBody.innerHTML = sum + cards + `<div class="rs-act" style="--i:${i++}">
      <div class="rs-row2"><button class="rs-sec" data-all type="button">${ICON.copy}ຄັດລອກທັງໝົດ</button><button class="rs-sec" data-dl type="button">${ICON.dl}ບັນທຶກເປັນໄຟລ໌</button></div>
      <button class="cf-ok" data-home type="button">ກັບໄປໜ້າຮ້ານ</button>
      <button class="rs-link" data-again type="button">ຊື້ອີກ</button></div>
      <p class="rs-note" style="--i:${i++}">ກະລຸນາບັນທຶກໂຄ້ດໄວ້ · ບໍ່ສາມາດຄືນເງິນໄດ້ຫຼັງຈາກໄດ້ຮັບໂຄ້ດແລ້ວ<br>ຖ້າໃຊ້ງານບໍ່ໄດ້ ຕິດຕໍ່ແອດມິນໄດ້ທຸກເວລາ</p>`;
    busy = false;
  }

  function fail(need, have){
    res.dataset.s = 'no';
    setHead('ຊື້ບໍ່ສຳເລັດ', 'ຍອດເງິນຂອງທ່ານບໍ່ພໍ');
    const row = (l, v, c) => `<div class="rs-r${c?' '+c:''}"><span>${l}</span><b>${v}</b></div>`;
    rsBody.innerHTML = `<div class="rs-card" style="--i:0">
      ${row('ຍອດທີ່ຕ້ອງຈ່າຍ', fmt(need))}${row('ຍອດເງິນຂອງທ່ານ', fmt(have))}${row('ຍັງຂາດອີກ', fmt(need-have), 'neg')}
    </div>
    <div class="rs-act" style="--i:1">
      <button class="cf-ok" data-topup type="button">${ICON.wallet}ເຕີມເງິນ</button>
      <button class="rs-sec" data-back type="button">ກັບໄປແກ້ໄຂຄຳສັ່ງຊື້</button>
      <button class="rs-link" data-home type="button">ກັບໄປໜ້າຮ້ານ</button></div>`;
    busy = false;
  }
  /* ผิดพลาดอื่นๆ (สต็อกไม่พอ/สินค้าปิดขาย/เน็ตหลุด ฯลฯ) — โหลดสต็อกล่าสุดก่อนกลับไปแก้ไข */
  function failMsg(h, p){
    res.dataset.s = 'no';
    setHead(h, p);
    rsBody.innerHTML = `<div class="rs-act" style="--i:0">
      <button class="cf-ok" data-back type="button">ກັບໄປແກ້ໄຂຄຳສັ່ງຊື້</button>
      <button class="rs-link" data-home type="button">ກັບໄປໜ້າຮ້ານ</button></div>`;
    busy = false; loadBal();
    loadProducts().then(() => { const np = products.find(x => String(x.id) === String(cur.id)); if(np) cur = np; });
  }

  function orderText(){
    return ['EXSHOP', '------------------------', 'ເລກທີ່ຄຳສັ່ງຊື້: '+order.no, 'ວັນທີ: '+stamp(order.at),
      'ສິນຄ້າ: '+order.name+' · '+order.opt+' × '+order.qty, '', ...order.codes].join('\n');
  }
  rsBody.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    if(b.dataset.copy){
      copyText(b.dataset.copy).then(()=>{ b.classList.add('ok'); b.innerHTML = OKI; toast('ຄັດລອກໂຄ້ດແລ້ວ');
        setTimeout(()=>{ b.classList.remove('ok'); b.innerHTML = ICON.copy; }, 1600); });
    } else if(b.hasAttribute('data-eye')){
      const cd = b.closest('.rs-cd'), h = cd.classList.toggle('hid'); b.innerHTML = h ? ICON.eyeOff : ICON.eye;
    } else if(b.hasAttribute('data-all')){
      copyText(order.codes.join('\n')).then(()=>toast('ຄັດລອກໂຄ້ດທັງໝົດແລ້ວ'));
    } else if(b.hasAttribute('data-dl')){
      const a = document.createElement('a'), u = URL.createObjectURL(new Blob([orderText()], {type:'text/plain;charset=utf-8'}));
      a.href = u; a.download = order.no + '.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u), 1500);
    } else if(b.hasAttribute('data-again') || b.hasAttribute('data-back')){
      window.scrollTo(0,0); open(cur);
    } else if(b.hasAttribute('data-topup')){ location.href = 'topup.html';
    } else if(b.hasAttribute('data-home')){ home(); }
  });

  $('#cfOpts').addEventListener('click', e=>{ const b=e.target.closest('[data-i]'); if(!b||b.disabled) return; sel=+b.dataset.i; qty=1; render(); });
  $('#cfCp').onclick = ()=>{ const o=$('#cfPw').classList.toggle('open'); $('#cfCp').classList.toggle('open',o); if(o) setTimeout(()=>$('#cfCode').focus(),350); };
  $('#cfBh').onclick = ()=> $('#cfBox').classList.toggle('closed');
  $('#cfSearch').addEventListener('input', e=>{ q=e.target.value; renderList(); });
  $('#cfMinus').onclick = ()=>{ qty--; render(); };
  $('#cfPlus').onclick = ()=>{ qty++; render(); };
  $('#cfCode').addEventListener('input', checkCode);
  $('#cfApply').onclick = ()=>{ applied = typed || null; render(); };
  $('#cfTop').onclick = ()=>{ if(needLogin()) return; location.href = 'topup.html'; };
  $('#cfOk').onclick = doPurchase;

  // อ่านสินค้าจาก URL: confirm.html?p=<id>  (ส่งมาจากการ์ดสินค้า) — รอข้อมูลจากฐานข้อมูล
  const key = new URLSearchParams(location.search).get('p');
  function start(){
    const p = products.find(x => String(x.id) === String(key));
    if(p){ open(p); return; }
    if(!window.productsLoaded) return;
    root.innerHTML = '<div class="cf-form"><div class="cf-notice" style="margin-top:30px">' + (window.productsFailed ? 'ໂຫຼດຂໍ້ມູນບໍ່ໄດ້ ກະລຸນາລອງໃໝ່' : 'ບໍ່ພົບສິນຄ້ານີ້ ຫຼື ປິດຂາຍແລ້ວ') + '</div><div class="cf-act"><button class="cf-ok" type="button" onclick="location.href=\'index.html\'">ກັບໄປໜ້າຮ້ານ</button></div></div>';
  }
  let started = false;
  document.addEventListener('products:ready', () => {
    if(!started && products.find(x => String(x.id) === String(key))){ started = true; start(); }
    else if(!started) start();
  });
  if(window.productsLoaded) start();
  else root.querySelector('.cf-form').style.opacity = '.5';   // ระหว่างรอข้อมูลเท่านั้น — open() จะล้างค่านี้ออก
})();
