/* ===== CONFIG: เปลี่ยนชื่อร้าน ลิงก์ และข้อมูลตรงนี้ ===== */
const CONFIG = {
  announce: 'ຊື້ສິນຄ້າສຳເລັດແລ້ວເຂົ້າ Discord ຂອງທາງຮ້ານນຳເດີ້!',
  routes: { // ใส่ URL จริง ถ้าเว้นว่างจะขึ้นข้อความแจ้งเตือนแทน
    login:'', register:'', topup:'', orders:'', hwid:'', chat:''
  },
  onBuy(p){ snack('ສັ່ງຊື້ ' + p.n + ' — ເຊື່ອມລະບົບຊຳລະເງິນທີ່ CONFIG.onBuy'); }
};

const $ = (s, r=document) => r.querySelector(s);
const ic = (id, cls='') => `<svg class="i ${cls}"><use href="#${id}"/></svg>`;
let snackT;
function snack(msg){ const s=$('#snack'); s.textContent=msg; s.classList.add('show'); clearTimeout(snackT); snackT=setTimeout(()=>s.classList.remove('show'),2400); }
function go(route){
  const u = CONFIG.routes[route];
  if(u){ location.href = u; } else { snack('ຍັງບໍ່ໄດ້ຕັ້ງລິ້ງປາຍທາງ (CONFIG.routes.' + route + ')'); }
}
document.addEventListener('click', e => {
  const r = e.target.closest('[data-route]');
  if(r){ e.preventDefault(); closeMenu(); go(r.dataset.route); }
});


/* marquee */
(function(){
  const one = `<span class="mq-item">${ic('bell')}${CONFIG.announce}</span>`;
  $('#mq').innerHTML = (one.repeat(6)) + (one.repeat(6));
})();

/* theme */
(function(){
  const root = document.documentElement, btn = $('#btnTheme');
  const apply = t => { root.dataset.theme = t; btn.innerHTML = ic(t==='dark' ? 'moon' : 'sun'); };
  let t = 'light';
  try { t = localStorage.getItem('theme') || 'light'; } catch(e){}
  apply(t);
  btn.addEventListener('click', () => {
    t = root.dataset.theme === 'dark' ? 'light' : 'dark'; apply(t);
    try { localStorage.setItem('theme', t); } catch(e){}
  });
})();
$('#btnChat').addEventListener('click', () => go('chat'));

/* drawer */
const ov = $('#ov');
function openMenu(){ ov.classList.add('open'); ov.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeMenu(){ ov.classList.remove('open'); ov.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
$('#btnMenu').addEventListener('click', openMenu);
$('#btnClose').addEventListener('click', closeMenu);
ov.addEventListener('click', e => { if(e.target === ov) closeMenu(); });
ov.querySelectorAll('a[href^="#"]:not([data-route])').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if(e.key==='Escape') closeMenu(); });

/* stats */
$('#stats').innerHTML = [
  ['user','ຜູ້ໃຊ້ງານ','0','ຄົນ'],
  ['box','ສິນຄ້າ','0','ລາຍການ'],
  ['trend','ຄຳສັ່ງຊື້','0','ລາຍການ'],
  ['box','ຂາຍແລ້ວ','0','ຊິ້ນ']
].map(([i,l,n,u]) => `<div class="stat"><svg class="i wm" style="stroke-width:1.2"><use href="#${i}"/></svg><div class="ic">${ic(i)}</div><div class="tx"><span class="lb">${l}</span><span class="nm">${n}<small>${u}</small></span></div></div>`).join('');

/* art helpers (placeholder artwork — replace with real images via CONFIG / <img>) */
const arts = {
  unban:{bg:'radial-gradient(90% 70% at 50% 40%,#7a1218,#2a0508 70%,#120204)', top:'<div style="position:absolute;left:24%;top:17%;width:52%;aspect-ratio:1;border:9px solid #d4271f;border-radius:50%"></div><div style="position:absolute;left:49%;top:14%;width:9px;height:58%;background:#d4271f;transform:rotate(45deg);transform-origin:50% 40%"></div>', t:[['UNBAN FIVEM','#fff','8.2cqw','66%'],['ປົດແບນບໍ່ມີໂດນຍ້ອນຫຼັງ','#fff','4.4cqw','80%']]},
  devil:{bg:'linear-gradient(160deg,#0c0d1c,#2a0a14 60%,#1a0508)', top:'<div style="position:absolute;left:12%;right:10%;top:14%;height:52%;background:linear-gradient(120deg,#25306a,#3a1c3a);clip-path:polygon(0 100%,8% 30%,25% 8%,42% 22%,55% 5%,75% 12%,90% 40%,100% 100%);opacity:.9"></div>', t:[['DEVIL STAR','#d6281f','13cqw','72%']]},
  card:{bg:'linear-gradient(180deg,#0b0e1f,#101a4a 70%,#090d28)', top:'<div style="position:absolute;left:15%;right:15%;top:20%;height:34%;background:linear-gradient(135deg,#1f2a66,#0a0f2c);border:1px solid #3d4fb0;border-radius:6px"></div>', t:[['CARD','#1d3fe0','13cqw','72%']]},
  setting:{bg:'linear-gradient(170deg,#1b0609,#3d0a10 60%,#150407)', top:'<div style="position:absolute;left:25%;right:12%;top:8%;height:60%;background:linear-gradient(180deg,#444,#111);clip-path:polygon(15% 100%,20% 25%,50% 6%,80% 25%,90% 100%);opacity:.7"></div>', t:[['SETTING PERFECTX','#d6281f','8.4cqw','74%']]},
  xlight:{bg:'linear-gradient(180deg,#14090b,#2c0a0e)', top:'<div style="position:absolute;left:18%;right:18%;top:26%;height:5px;background:linear-gradient(90deg,#555,#ccc,#555);transform:rotate(-40deg)"></div>', t:[['CMD','#fff','12cqw','56%'],['XLIGHT','#e63329','17cqw','67%'],['SUPER MODE','#ffb21f','4.6cqw','86%']]},
  unlock:{bg:'linear-gradient(160deg,#241012,#4a0c12 70%,#190507)', top:'<div style="position:absolute;left:5%;top:12%;width:40%;height:70%;background:linear-gradient(180deg,#8d8d94,#2b2b30);border-radius:40% 40% 0 0"></div><div style="position:absolute;right:6%;top:10%;font-style:italic;color:#ffc425;font-size:8cqw;font-weight:900;transform:rotate(-8deg);line-height:.95;text-align:right">STAR<br><span style="font-size:5cqw">COMMUNITY</span></div>', t:[['ປົດລັອກສະກິນ','#e63329','14cqw','73%']]},
  collection:{bg:'linear-gradient(160deg,#3a0a10,#14090c)', top:'<div style="position:absolute;left:10%;top:16%;width:34%;height:52%;background:linear-gradient(180deg,#9a7a70,#2a1a1a);border-radius:40% 40% 8% 8%"></div>', t:[['COLLECTION','#fff','15cqw','70%']]},
  upcri:{bg:'linear-gradient(160deg,#4a0a10,#0d0709 65%)', top:'<div style="position:absolute;left:18%;right:18%;top:36%;height:30%;background:linear-gradient(135deg,#2b2b30,#0a0a0c);border:1px solid #555;border-radius:6px;transform:rotate(-4deg)"></div>', t:[['UPCRI','#fff','25cqw','2%'],['ຄຣີປັບໄດ້ ຄຣີໜ້າ ຄຣີຂ້າງ ຄຣີຫຼັງ','#fff','4.5cqw','86%']]},
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

/* products */
const products = [
  {n:'UNBAN FIVEM', p:'฿150', o:'฿200', left:'96', sold:'1,431', d:'-25%', hot:true, art:'unban', cat:'fivem'},
  {n:'DEVIL STAR', p:'฿188', o:'฿250', left:'24', sold:'754', d:'-25%', art:'devil', cat:'fivem'},
  {n:'CARD (ຄ່າຍຂາວ)', p:'฿188', o:'฿250', left:'29', sold:'251', d:'-25%', art:'card', cat:'fivem'},
  {n:'SETTING PERFECTX', p:'฿250', o:'฿500', left:'45', sold:'148', d:'-50%', art:'setting', cat:'fivem'},
  {n:'CMD XLIGHT', p:'฿19 - ฿113', o:'(฿25 - ฿150)', left:'55', sold:'62', d:'-25%', art:'xlight', cat:'fivem', wrap:true},
  {n:'UnlockSkin (Starcommu) ບໍ່ຕ້ອງເຕີມຊື້ສະກິນ', p:'฿79', o:'(฿99)', left:'2', sold:'25', d:'-฿20', art:'unlock', cat:'fivem'},
  {n:'CMD COLLECTION [ສັ່ງຄ່າຍຊຶ່ງ]', p:'฿188', o:'(฿250)', left:'12', sold:'22', d:'-25%', art:'collection', cat:'fivem'},
  {n:'UPCRI ປັບອົງສາຄຣີ ເຊັກບໍ່ເຈີ', p:'฿113', o:'(฿150)', left:'1', sold:'10', d:'-25%', art:'upcri', cat:'fivem'}
];
const oldFmt = o => o.startsWith('(') ? o : `(${o})`;
function renderProducts(cat){
  const list = products.filter(p => p.cat === cat);
  $('#grid').innerHTML = list.length ? list.map((p,i) => `
    <article class="pc">
      <div class="pimg">${artSq(p.art)}<span class="badge">ຫຼຸດ ${p.d}</span>${p.hot?`<span class="hot">${ic('flame')}ຍອດຮິດ</span>`:''}</div>
      <div class="pb">
        <h3 class="pn">${p.n}</h3>
        ${p.wrap
          ? `<div class="pr wrap"><span class="now">${p.p}</span><div class="row2"><span class="old" style="margin:0">${oldFmt(p.o)}</span><span class="left">ເຫຼືອ ${p.left} ຊິ້ນ</span></div></div>`
          : `<div class="pr"><span class="pl"><span class="now">${p.p}</span><span class="old">${oldFmt(p.o)}</span></span><span class="left">ເຫຼືອ ${p.left} ຊິ້ນ</span></div>`}
        <button class="buy" data-buy="${i}">${ic('cart')}ຊື້ເລີຍ</button>
        <div class="sold">${ic('flame')}ຂາຍໄປແລ້ວ ${p.sold} ຊິ້ນ</div>
      </div>
    </article>`).join('') : `<div class="empty">ຍັງບໍ່ມີສິນຄ້າໃນໝວດນີ້</div>`;
  $('#grid').querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => CONFIG.onBuy(list[+b.dataset.buy])));
}
renderProducts('fivem');

/* featured carousel */
const feat = [
  {n:'UNBAN FIVEM', p:'฿150', art:'unban'}, {n:'DEVIL STAR', p:'฿188', art:'devil'},
  {n:'BR MODS', p:'฿20 - ฿500', art:'br', hot:true}, {n:'PHANTOM (AD+IOS)', p:'฿350', art:'phantom'},
  {n:'ZENTNITYX (AD+IOS)', p:'฿299', art:'zent'}, {n:'CMD XLIGHT', p:'฿19 - ฿113', art:'xlight'}
];
(function(){
  const tr = $('#featTrack'), dots = $('#featDots');
  tr.innerHTML = feat.map(f => `<a class="fcard" href="#products"><div class="fi">${f.hot?`<span class="tag">${ic('flame')}ຍອດນິຍົມ</span>`:''}${artSq(f.art)}</div><div class="fn">${f.n}</div><div class="fp">${f.p}</div></a>`).join('');
  dots.innerHTML = feat.map((_,i) => `<button aria-label="ສະໄລດ໌ ${i+1}"></button>`).join('');
  let i = 0, timer;
  const set = n => { i = (n + feat.length) % feat.length; tr.style.transform = `translateX(-${i*100}%)`; [...dots.children].forEach((d,k) => d.classList.toggle('on', k===i)); };
  const start = () => { clearInterval(timer); timer = setInterval(() => set(i+1), 3500); };
  [...dots.children].forEach((d,k) => d.addEventListener('click', () => { set(k); start(); }));
  set(0); start();
})();

/* recent purchases */
const recent = [
  {n:'PHANTOM (AD+IOS)', u:'pou***', t:'28 ນາທີກ່ອນ', art:'phantom'},
  {n:'ZENTNITYX (AD+IOS)', u:'Ton***', t:'29 ນາທີກ່ອນ', art:'zent'},
  {n:'[ ໂຄ້ດ ] ສຸ່ມເລເວວ ໄອດີຊຸດຊາສຶເກະ', u:'tar***', t:'22 ນາທີກ່ອນ', art:'level'},
  {n:'PHANTOM (AD+IOS)', u:'ຫີສ***', t:'25 ນາທີກ່ອນ', art:'phantom'},
  {n:'ZENTNITYX (AD+IOS)', u:'ຊຸດ***', t:'30 ນາທີກ່ອນ', art:'zent'}
];
(function(){
  const card = r => `<div class="rc-card"><div class="th" style="position:relative">${artSq(r.art)}</div><div style="min-width:0"><div class="nm">${r.n.length>16?r.n.slice(0,15)+'…':r.n}</div><div class="mt">${ic('user')}${r.u}</div><div class="mt">${ic('clock')}${r.t}</div></div></div>`;
  const h = recent.map(card).join('');
  $('#rcTrack').innerHTML = h + h;
})();

/* toast */
(function(){
  const el = $('#toast'), bar = $('#tBar');
  let i = 0;
  function show(){
    const r = recent[i % recent.length]; i++;
    $('#tImg').innerHTML = `<div style="position:relative;width:100%;height:100%">${artSq(r.art)}</div>`;
    $('#tName').textContent = r.n; $('#tUser').textContent = r.u; $('#tTime').textContent = r.t;
    el.classList.remove('out');
    bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    setTimeout(() => el.classList.add('out'), 4600);
  }
  show(); setInterval(show, 5200);
})();

/* categories */
const cats = [
  {k:'fivem', t1:'FIVEM GAME', n:'FIVEM', d:'ໂປຣແກຣມຊ່ວຍຫຼິ້ນ Fivem', c:15},
  {k:'cheat', t1:'CHEAT', n:'CHEAT', d:'ໂປຣແກຣມຊ່ວຍຫຼິ້ນ', c:3},
  {k:'random', t1:'RANDOM ID', n:'RANDOM ID', d:'ສຸ່ມໄອດີເກມ', c:25},
  {k:'freefire', t1:'FREE FIRE', n:'FREE FIRE', d:'ໂປຣແກຣມຊ່ວຍຫຼິ້ນ Free Fire', c:12}
];
$('#catList').innerHTML = cats.map(c => `
  <button class="cat" data-cat="${c.k}">
    <div class="cb"><span class="art"></span><span class="t1">${c.t1}</span><span class="t2">PRODUCT</span>
      <span class="tg"><i>GAME ONLINE</i><i>CHEAT GAME</i><i>SOCIAL HUB</i><i>UNBAN SERVICE</i></span>
      <span class="cl">CLICK HERE!</span><span class="ln"></span></div>
    <div class="cat-b"><div><h3>${c.n}</h3><p>${c.d}</p></div><span class="cnt">${c.c} ສິນຄ້າ</span></div>
  </button>`).join('');
$('#catList').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if(!b) return;
  const c = cats.find(x => x.k === b.dataset.cat);
  $('#catName').textContent = c.n; renderProducts(c.k);
  $('#products').scrollIntoView({behavior:'smooth'});
});
$('#allBtn').addEventListener('click', () => { $('#catName').textContent = 'FIVEM'; renderProducts('fivem'); });
