/* ===== confirm.js — หน้ายืนยันสั่งซื้อ (confirm.html) =====
   ข้อมูลภาพสินค้าด้านล่างคัดลอกมาจาก script.js เพื่อให้หน้านี้ทำงานแยกอิสระ */
const arts = {
  unban:{bg:'radial-gradient(90% 70% at 50% 40%,#7a1218,#2a0508 70%,#120204)', top:'<div style="position:absolute;left:24%;top:17%;width:52%;aspect-ratio:1;border:9px solid #FF0000;border-radius:50%"></div><div style="position:absolute;left:49%;top:14%;width:9px;height:58%;background:#FF0000;transform:rotate(45deg);transform-origin:50% 40%"></div>', t:[['UNBAN FIVEM','#fff','8.2cqw','66%'],['ປົດແບນບໍ່ມີໂດນຍ້ອນຫຼັງ','#fff','4.4cqw','80%']]},
  devil:{bg:'linear-gradient(160deg,#0c0d1c,#2a0a14 60%,#1a0508)', top:'<div style="position:absolute;left:12%;right:10%;top:14%;height:52%;background:linear-gradient(120deg,#25306a,#3a1c3a);clip-path:polygon(0 100%,8% 30%,25% 8%,42% 22%,55% 5%,75% 12%,90% 40%,100% 100%);opacity:.9"></div>', t:[['DEVIL STAR','#FF0000','13cqw','72%']]},
  card:{bg:'linear-gradient(180deg,#0b0e1f,#101a4a 70%,#090d28)', top:'<div style="position:absolute;left:15%;right:15%;top:20%;height:34%;background:linear-gradient(135deg,#1f2a66,#0a0f2c);border:1px solid #3d4fb0;border-radius:6px"></div>', t:[['CARD','#1d3fe0','13cqw','72%']]},
  setting:{bg:'linear-gradient(170deg,#1b0609,#3d0a10 60%,#150407)', top:'<div style="position:absolute;left:25%;right:12%;top:8%;height:60%;background:linear-gradient(180deg,#444,#111);clip-path:polygon(15% 100%,20% 25%,50% 6%,80% 25%,90% 100%);opacity:.7"></div>', t:[['SETTING PERFECTX','#FF0000','8.4cqw','74%']]},
  xlight:{bg:'linear-gradient(180deg,#14090b,#2c0a0e)', top:'<div style="position:absolute;left:18%;right:18%;top:26%;height:5px;background:linear-gradient(90deg,#555,#ccc,#555);transform:rotate(-40deg)"></div>', t:[['CMD','#fff','12cqw','56%'],['XLIGHT','#FF0000','17cqw','67%'],['SUPER MODE','#ffb21f','4.6cqw','86%']]},
  unlock:{bg:'linear-gradient(160deg,#241012,#4a0c12 70%,#190507)', top:'<div style="position:absolute;left:5%;top:12%;width:40%;height:70%;background:linear-gradient(180deg,#8d8d94,#2b2b30);border-radius:40% 40% 0 0"></div><div style="position:absolute;right:6%;top:10%;font-style:italic;color:#ffc425;font-size:8cqw;font-weight:900;transform:rotate(-8deg);line-height:.95;text-align:right">STAR<br><span style="font-size:5cqw">COMMUNITY</span></div>', t:[['ປົດລັອກສະກິນ','#FF0000','14cqw','73%']]},
  collection:{bg:'linear-gradient(160deg,#3a0a10,#14090c)', top:'<div style="position:absolute;left:10%;top:16%;width:34%;height:52%;background:linear-gradient(180deg,#9a7a70,#2a1a1a);border-radius:40% 40% 8% 8%"></div>', t:[['COLLECTION','#fff','11.5cqw','72%']]},
  upcri:{bg:'linear-gradient(160deg,#4a0a10,#0d0709 65%)', top:'<div style="position:absolute;left:18%;right:18%;top:36%;height:30%;background:linear-gradient(135deg,#2b2b30,#0a0a0c);border:1px solid #555;border-radius:6px;transform:rotate(-4deg)"></div>', t:[['UPCRI','#fff','20cqw','8%'],['ຄຣີປັບໄດ້ ຄຣີໜ້າ ຄຣີຂ້າງ ຄຣີຫຼັງ','#fff','4.5cqw','86%']]},
  phantom:{bg:'linear-gradient(160deg,#222,#050505)', top:'', t:[['PHANTOM','#ddd','9cqw','38%']]},
  zent:{bg:'linear-gradient(160deg,#5b2bd8,#14062e)', top:'', t:[['ZENTNITYX','#e9dcff','7cqw','42%']]},
  level:{bg:'linear-gradient(160deg,#6f3bd0,#1c0a3f)', top:'', t:[['LEVEL?','#fff','11cqw','40%']]},
  br:{bg:'linear-gradient(120deg,#0d0d0f,#3a1208 70%,#15090a)', top:'', t:[]}
};
function artSq(key){
  const a = arts[key];
  const tx = a.t.map(([t,c,s,y]) => `<div class="tp" style="color:${c};font-size:${s};top:${y};text-shadow:0 2px 6px rgba(0,0,0,.6)">${t}</div>`).join('');
  return `<div style="position:absolute;inset:0;container-type:inline-size;background:${a.bg}">${a.top}${tx}</div>`;
}
const PRODUCTS = {unban:"EXSHOP",devil:"EXSHOP",card:"EXSHOP",setting:"EXSHOP",xlight:"EXSHOP",unlock:"EXSHOP",collection:"EXSHOP",upcri:"EXSHOP"};

/* ===== หน้ายืนยันสั่งซื้อ (โหมดทดลอง) =====
   ข้อมูลในนี้เป็นข้อมูลจำลองทั้งหมด (DEMO) ยังไม่ตัดเงินจริง
   เมื่อเชื่อมระบบจริง ให้แก้ DEMO.balance, DEMO.items และฟังก์ชัน doPurchase() */
(function(){
  // ตัวเลือกจำลอง: ราคาขาย = ราคาเต็ม / 2 (เหมือนในรูปตัวอย่าง)
  const LABELS = ['12 ຊົ່ວໂມງ','1 ມື້','3 ມື້','7 ມື້','30 ມື້'];
  const FULL   = [35,50,150,300,500];
  const STOCK  = {unban:[0,2,1,6,7], devil:[3,5,0,2,4], card:[1,4,6,0,3], setting:[0,1,2,3,0],
                  xlight:[2,0,1,1,2], unlock:[5,3,2,4,1], collection:[0,6,2,0,3], upcri:[8,5,4,3,2]};
  const DEMO = {
    balance: 150,
    promos: { EX10:{type:'pct',v:10,t:'ຫຼຸດ 10%'}, SAVE5:{type:'amt',v:5,t:'ຫຼຸດ ₭5'} },
    items: {}
  };
  Object.keys(STOCK).forEach(k => { DEMO.items[k] = LABELS.map((l,i)=>({l, o:FULL[i], p:FULL[i]/2, s:STOCK[k][i]})); });

  const $ = (s,r=document)=>r.querySelector(s);
  let toastT; function toast(m){ const s=$('#snack'); s.textContent=m; s.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>s.classList.remove('show'),2200); }
  const fmt = n => '₭' + (Math.round(n*100)/100).toLocaleString('en-US');
  const m2 = n => n.toFixed(2) + ' ₭';
  const X = '<svg class="i" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  const CART = '<svg class="i" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>';
  const OKI = '<svg class="i" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
  const LIST = '<svg class="i" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r=".6"/><circle cx="3.5" cy="12" r=".6"/><circle cx="3.5" cy="18" r=".6"/></svg>';
  const TICKET = '<svg class="i" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>';
  const CHEV = '<svg class="i" viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>';

  const root = document.getElementById('cfApp');
  root.innerHTML = `<div class="cf-form">
      <span class="cf-demo">ໂໝດທົດລອງ · ຍັງບໍ່ຕັດເງິນຈິງ</span>
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
      <div class="cf-warn" id="cfWarn"><span>ຍອດເງິນບໍ່ພໍ ກະລຸນາເຕີມເງິນ</span><button id="cfTop">ເຕີມເງິນ</button></div>
      <div class="cf-act"><button class="cf-ok" id="cfOk">${OKI}ຢືນຢັນຊື້</button></div>
      <div class="cf-det">
        <h4>ລາຍລະອຽດສິນຄ້າ</h4>
        <p id="cfDesc"></p>
        <ul>
          <li>ສົ່ງສິນຄ້າອັດຕະໂນມັດທັນທີຫຼັງຊຳລະເງິນ</li>
          <li>ຮອງຮັບ iOS ແລະ Android</li>
          <li>ມີການຮັບປະກັນ ຖ້າໃຊ້ງານບໍ່ໄດ້ ຕິດຕໍ່ແອດມິນໄດ້ທຸກເວລາ</li>
          <li>ບໍ່ສາມາດຄືນເງິນໄດ້ຫຼັງຈາກໄດ້ຮັບໂຄ້ດແລ້ວ</li>
        </ul>
        <h5>ວິທີໃຊ້ງານ</h5>
        <ol>
          <li>ຮັບໂຄ້ດສິນຄ້າຫຼັງຈາກສັ່ງຊື້ສຳເລັດ</li>
          <li>ເປີດໂປຣແກຣມ ແລ້ວໃສ່ໂຄ້ດທີ່ໄດ້ຮັບ</li>
          <li>ເລີ່ມໃຊ້ງານໄດ້ທັນທີ</li>
        </ol>
        <p class="cf-det-n">* ຂໍ້ຄວາມຕົວຢ່າງ — ແກ້ໄຂໄດ້ໃນ confirm.js</p>
      </div>
    </div>
    <div class="cf-done">
      <div class="cf-tick">${OKI}</div><h3>ສັ່ງຊື້ສຳເລັດ!</h3>
      <p id="cfDoneP"></p><div class="cf-code" id="cfDoneCode"></div>
      <p>(ໂຄ້ດຕົວຢ່າງ — ໂໝດທົດລອງ)</p>
      <div class="cf-act"><button class="cf-ok" id="cfClose">ກັບໄປໜ້າຮ້ານ</button></div>
    </div>
  `;

  let cur=null, opts=[], sel=0, qty=1, applied=null, q='';
  const totalStock = () => opts.reduce((s,o)=>s+o.s,0);
  const disc = (sub, pr) => !pr ? 0 : Math.min(sub, pr.type==='pct' ? sub*pr.v/100 : pr.v);
  const promoOf = () => DEMO.promos[$('#cfCode').value.trim().toUpperCase()];

  function renderList(){
    const kw = q.trim().toLowerCase();
    const rows = opts.map((o,i)=>({o,i})).filter(({o})=>!kw || o.l.toLowerCase().includes(kw));
    $('#cfOpts').innerHTML = rows.length ? rows.map(({o,i})=>`
      <button class="cf-or${i===sel?' on':''}${o.s?'':' off'}" data-i="${i}" ${o.s?'':'disabled'}>
        <span class="cf-oi">${window.artSq ? artSq(cur.art) : ''}</span>
        <span class="cf-ot"><b>${o.l}</b><span class="cf-op"><s>${m2(o.o)}</s><em>${m2(o.p)}</em></span></span>
        <span class="cf-ob ${o.s?'ok':'no'}">${o.s ? o.s+' ຊິ້ນ' : 'ສິນຄ້າໝົດ'}</span>
      </button>`).join('') : '<div class="cf-none">ບໍ່ພົບຕົວເລືອກ</div>';
  }

  function render(){
    const o = opts[sel], unit = o.p, stock = o.s;
    qty = Math.max(1, Math.min(qty, stock || 1));
    $('#cfStock').textContent = 'ເຫຼືອລວມ ' + totalStock() + ' ຊິ້ນ · ຕົວເລືອກນີ້ ' + stock + ' ຊິ້ນ';
    renderList();
    const ps=opts.map(x=>x.p), mx=Math.max(...opts.map(x=>(1-x.p/x.o)*100));
    $('#cfRange').textContent = Math.min(...ps).toFixed(2)+' – '+Math.max(...ps).toFixed(2)+' ₭';
    $('#cfPct').textContent = mx.toFixed(2)+' %';
    $('#cfQty').textContent = qty;
    $('#cfMinus').disabled = qty<=1; $('#cfPlus').disabled = qty>=stock;
    const sub = unit*qty, typed = promoOf(), d = disc(sub, applied), tot = sub-d, rem = DEMO.balance-tot;
    $('#cfTot').textContent = fmt(tot); $('#cfBal').textContent = fmt(DEMO.balance);
    const r = $('#cfRem'); r.textContent = fmt(rem); r.classList.toggle('neg', rem<0);
    $('#cfWarn').classList.toggle('show', rem<0);
    $('#cfOk').disabled = rem<0 || !stock;
    const h = $('#cfHint'); h.className='cf-hint';
    if(applied){ h.classList.add('ok'); h.textContent = '✓ ໃຊ້ໂຄ້ດແລ້ວ · ' + applied.t + ' (-' + fmt(d) + ')'; }
    else if(typed){ h.classList.add('ok'); h.textContent = 'ຈະໄດ້ຮັບສ່ວນຫຼຸດ -' + fmt(disc(sub,typed)) + ' · ກົດ "ໃຊ້" ເພື່ອຢືນຢັນ'; }
    else if($('#cfCode').value.trim()){ h.classList.add('bad'); h.textContent = 'ໂຄ້ດບໍ່ຖືກຕ້ອງ'; }
    $('#cfApply').disabled = !typed || !!applied;
    const st=$('#cfCpSt'); st.textContent = applied ? '✓ ' + $('#cfCode').value.trim().toUpperCase() : ''; st.classList.toggle('on', !!applied);
  }

  function open(p){
    cur = p;
    opts = DEMO.items[p.art] || LABELS.map((l,i)=>({l,o:FULL[i],p:FULL[i]/2,s:3}));
    sel = Math.max(0, opts.findIndex(o=>o.s>0));
    qty = 1; applied = null; q = ''; $('#cfCode').value = ''; $('#cfSearch').value = '';
    $('#cfBox').classList.remove('closed'); $('#cfPw').classList.remove('open'); $('#cfCp').classList.remove('open');
    root.classList.remove('done');
    $('#cfName').textContent = p.n;
    $('#cfDesc').textContent = p.n + ' — ໂປຣແກຣມ/ບໍລິການຄຸນນະພາບ ຈຳໜ່າຍໂດຍ ExShop ພ້ອມຮັບປະກັນຫຼັງການຂາຍ';
    $('#cfImg').innerHTML = window.artSq ? artSq(p.art) : '';
    $('#cfTh').innerHTML = window.artSq ? artSq(p.art) : '';
    render();
  }
  function home(){ location.href = 'index.html'; }

  /* คนยังไม่ลงชื่อ: ดูสินค้า/ราคา/ตัวเลือกได้ แต่กดยืนยันซื้อหรือเติมเงินไม่ได้ → พาไปเข้าสู่ระบบแล้วกลับมาหน้านี้ */
  function needLogin(){
    if(window.exLoggedIn && exLoggedIn()) return false;
    toast('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນຊື້ສິນຄ້າ'); setTimeout(()=>exNeedLogin(), 900); return true;
  }
  function doPurchase(){
    if(needLogin()) return;
    const o = opts[sel], sub = o.p*qty, tot = sub - disc(sub, applied);
    DEMO.balance -= tot; o.s -= qty;           // จำลองการตัดเงินและสต็อก
    const codes = Array.from({length:qty},()=>'EX-'+Math.random().toString(36).slice(2,6).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase());
    $('#cfDoneP').textContent = cur.n + ' · ' + o.l + ' × ' + qty + ' · ' + fmt(tot);
    $('#cfDoneCode').innerHTML = codes.join('<br>');
    root.classList.add('done');
  }

  $('#cfOpts').addEventListener('click', e=>{ const b=e.target.closest('[data-i]'); if(!b||b.disabled) return; sel=+b.dataset.i; qty=1; render(); });
  $('#cfCp').onclick = ()=>{ const o=$('#cfPw').classList.toggle('open'); $('#cfCp').classList.toggle('open',o); if(o) setTimeout(()=>$('#cfCode').focus(),350); };
  $('#cfBh').onclick = ()=> $('#cfBox').classList.toggle('closed');
  $('#cfSearch').addEventListener('input', e=>{ q=e.target.value; renderList(); });
  $('#cfMinus').onclick = ()=>{ qty--; render(); };
  $('#cfPlus').onclick = ()=>{ qty++; render(); };
  $('#cfCode').addEventListener('input', ()=>{ applied=null; render(); });
  $('#cfApply').onclick = ()=>{ applied = promoOf() || null; render(); };
  $('#cfTop').onclick = ()=>{ if(needLogin()) return; DEMO.balance += 100; render(); toast('ເຕີມເງິນທົດລອງ +₭100'); };
  $('#cfOk').onclick = doPurchase;
  $('#cfClose').onclick = home;

  // อ่านสินค้าจาก URL: confirm.html?p=<art>  (ส่งมาจากปุ่ม "ຊື້ເລີຍ" ใน script.js)
  const key = new URLSearchParams(location.search).get('p');
  const art = PRODUCTS[key] ? key : Object.keys(PRODUCTS)[0];
  open({ art: art, n: PRODUCTS[art] });
})();
