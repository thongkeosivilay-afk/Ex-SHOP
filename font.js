/* ===== ฟอนต์เว็บไซต์ (แอดมินเลือกได้ที่ ตั้งค่าเว็บ → ຟອນເວັບໄຊ) =====
   - รายการฟอนต์อยู่ใน FONTS ด้านล่าง (เพิ่ม/ลบได้) — k = รหัสที่เก็บในฐานข้อมูล, css = font-family, gf = ชื่อสำหรับ Google Fonts
   - ทุกฟอนต์ต่อท้ายด้วย Noto Sans Lao Looped เพื่อให้ตัวอักษรลาวแสดงได้เสมอ
   - ค่าที่เลือกเก็บในฐานข้อมูล (ฟังก์ชัน shop_font / admin_font_update ดูไฟล์ font-setup.sql) และจำไว้ในเครื่อง (localStorage: exFont) กันกระพริบ */
(function(){
  var LAO = "'Noto Sans Lao Looped',system-ui,sans-serif";
  var FONTS = [
    { k:'outfit',  n:'Outfit',               css:"'Outfit'," + LAO,               gf:'Outfit:wght@300;400;500;600;700;800;900' },
    { k:'laoloop', n:'Noto Sans Lao Looped', css:"'Noto Sans Lao Looped'," + LAO, gf:'Noto+Sans+Lao+Looped:wght@300;400;500;600;700' },
    { k:'laosans', n:'Noto Sans Lao',        css:"'Noto Sans Lao'," + LAO,        gf:'Noto+Sans+Lao:wght@300;400;500;600;700' },
    { k:'laoserif',n:'Noto Serif Lao',       css:"'Noto Serif Lao'," + LAO,       gf:'Noto+Serif+Lao:wght@400;500;600;700' },
    { k:'plex',    n:'IBM Plex Sans Thai',   css:"'IBM Plex Sans Thai'," + LAO,   gf:'IBM+Plex+Sans+Thai:wght@300;400;500;600;700' },
    { k:'sarabun', n:'Sarabun',              css:"'Sarabun'," + LAO,              gf:'Sarabun:wght@300;400;500;600;700;800' },
    { k:'kanit',   n:'Kanit',                css:"'Kanit'," + LAO,                gf:'Kanit:wght@300;400;500;600;700' },
    { k:'prompt',  n:'Prompt',               css:"'Prompt'," + LAO,               gf:'Prompt:wght@300;400;500;600;700' },
    { k:'mitr',    n:'Mitr',                 css:"'Mitr'," + LAO,                 gf:'Mitr:wght@300;400;500;600;700' },
    { k:'bai',     n:'Bai Jamjuree',         css:"'Bai Jamjuree'," + LAO,         gf:'Bai+Jamjuree:wght@300;400;500;600;700' }
  ];
  var KEY = 'exFont', DEF = 'outfit';
  var DB = { url:'https://mjalctpfeizjukuprqti.supabase.co', key:'sb_publishable_3EZ-Ulah6h9Xzze_DE0xow_E6iGHNiJ' };
  function find(k){ for(var i = 0; i < FONTS.length; i++) if(FONTS[i].k === k) return FONTS[i]; return null; }
  function href(list){ return 'https://fonts.googleapis.com/css2?' + list.map(function(f){ return 'family=' + f.gf; }).join('&') + '&display=swap'; }
  function load(list){
    var h = href(list); if(document.querySelector('link[data-exfont="' + h + '"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = h; l.setAttribute('data-exfont', h);
    (document.head || document.documentElement).appendChild(l);
  }
  var st;
  function apply(k){
    var f = find(k) || find(DEF);
    load([f]);
    if(!st){ st = document.createElement('style'); st.id = 'exFontStyle'; (document.head || document.documentElement).appendChild(st); }
    st.textContent = ':root{--font:' + f.css + '}body,body *:not(svg):not(svg *){font-family:' + f.css + '!important}';
    window.EX_FONT_NOW = f.k;
    return f.k;
  }
  function saved(){ try{ return localStorage.getItem(KEY) || ''; }catch(e){ return ''; } }
  function remember(k){ try{ localStorage.setItem(KEY, k); }catch(e){} }
  window.EX_FONTS = FONTS;
  window.exFontHref = function(){ return href(FONTS); };
  window.exFontApply = apply;                       // ดูตัวอย่างทันที (ยังไม่จำ)
  window.exFontRemember = remember;
  /* หน้าแอดมินตั้งค่าเว็บ: ใช้เฉพาะตัวอย่างในการ์ด ไม่เปลี่ยนฟอนต์ทั้งหน้า (window.EX_FONT_PREVIEW_ONLY) */
  if(!window.EX_FONT_PREVIEW_ONLY) apply(saved() || DEF);
  /* ถามฐานข้อมูลว่าแอดมินตั้งฟอนต์อะไรไว้ (ถ้ายังไม่ได้สร้างฟังก์ชันใน SQL จะข้ามเงียบๆ) */
  window.exFontReady = fetch(DB.url + '/rest/v1/rpc/shop_font', {
    method:'POST', headers:{ 'Content-Type':'application/json', apikey:DB.key, Authorization:'Bearer ' + DB.key }, body:'{}'
  }).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
    var k = j && (typeof j === 'string' ? j : j.font);
    if(k && find(k)){ remember(k); if(!window.EX_FONT_PREVIEW_ONLY) apply(k); return k; }
    return null;
  }).catch(function(){ return null; });
})();
