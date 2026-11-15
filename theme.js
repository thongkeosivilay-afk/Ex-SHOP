/* ===== ธีมสีเว็บไซต์ (แอดมินปรับได้ที่ ตั้งค่าเว็บ → ສີ & ທີມ) =====
   - ค่าที่เก็บ: color (สีหลัก) · bg (สีพื้นหลัง) · mode (solid | gradient | glow)
   - เก็บในฐานข้อมูล Supabase (ตาราง site_theme · ฟังก์ชัน shop_theme / admin_theme_update — ดู theme-setup.sql)
     และจำไว้ในเครื่องผู้เข้าชม (localStorage: exTheme) เพื่อไม่ให้หน้าเว็บกะพริบสีเก่า
   - สีหลักใช้กับทุกโหมด · สีพื้นหลังใช้กับโหมดที่ตรงกับความสว่างของสีนั้น
     (สีเข้ม → โหมดมืด, สีสว่าง → โหมดสว่าง) ปุ่มสลับสว่าง/มืดของลูกค้ายังใช้ได้ตามปกติ
   - ใส่ <script src="theme.js"></script> ในหน้าที่ต้องการให้เปลี่ยนสี (ต่อจากไฟล์ CSS) */
(function(){
  var KEY = 'exTheme';
  var DB = { url:'https://mjalctpfeizjukuprqti.supabase.co', key:'sb_publishable_3EZ-Ulah6h9Xzze_DE0xow_E6iGHNiJ' };
  var DEF = { color:'#ff0000', bg:'#fbfbfb', mode:'solid' };
  var MODES = ['solid','gradient','glow'];
  var HEX = /^#[0-9a-f]{6}$/i;

  /* ---------- ตัวช่วยคำนวณสี ---------- */
  function rgb(h){ h = String(h).replace('#',''); return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
  function hex(a){ return '#' + a.map(function(v){ v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t){ var x = rgb(a), y = rgb(b); return hex([x[0] + (y[0]-x[0])*t, x[1] + (y[1]-x[1])*t, x[2] + (y[2]-x[2])*t]); }
  function lum(h){ var c = rgb(h).map(function(v){ v /= 255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); }); return .2126*c[0] + .7152*c[1] + .0722*c[2]; }
  function clean(o){
    o = o || {};
    return {
      color: HEX.test(o.color) ? String(o.color).toLowerCase() : DEF.color,
      bg:    HEX.test(o.bg)    ? String(o.bg).toLowerCase()    : DEF.bg,
      mode:  MODES.indexOf(o.mode) >= 0 ? o.mode : DEF.mode
    };
  }

  /* ---------- สร้างชุดตัวแปร CSS จากค่าธีม (แอดมินใช้ทำตัวอย่างสดด้วย) ---------- */
  function build(o, red2Same){
    o = clean(o);
    var dark = lum(o.bg) < .4, c = o.color, rg = rgb(c).join(',');
    var all = ':root{--red:' + c + ';--red-d:' + c + ';--red-l:' + mix(c, '#ffffff', .3) + ';--red-rgb:' + rg + ';' + (red2Same ? '--red2:' + c + ';' : '') + '}';
    var sel = dark ? ':root[data-theme="dark"]' : ':root:not([data-theme="dark"])';
    var v, vars;
    if(dark){
      vars = { card: mix(o.bg, '#ffffff', .07), border: mix(o.bg, '#ffffff', .15), pink: 'rgba(' + rg + ',.2)', pink2: 'rgba(' + rg + ',.28)', text: '#f3f3f4', muted: '#9a9aa3' };
    } else {
      vars = { card: mix(o.bg, '#ffffff', .65), border: mix(o.bg, '#000000', .06), pink: mix(o.bg, c, .1), pink2: mix(o.bg, c, .16), text: '#1b1b1d', muted: '#8a8a90' };
    }
    v = '--bg:' + o.bg + ';--card:' + vars.card + ';--border:' + vars.border + ';--pink:' + vars.pink + ';--pink2:' + vars.pink2;
    all += sel + '{' + v + '}';
    /* โหมดพื้นหลัง: solid = สีเรียบ · gradient = ไล่จากสีพื้นไปหาสีหลักจางๆ · glow = แสงสีหลักเรืองจากด้านบน */
    var img = 'none';
    if(o.mode === 'gradient') img = 'linear-gradient(165deg,' + o.bg + ' 0%,' + o.bg + ' 30%,' + mix(o.bg, c, dark ? .26 : .14) + ' 100%)';
    else if(o.mode === 'glow') img = 'radial-gradient(110% 55% at 50% -8%,rgba(' + rg + ',' + (dark ? '.34' : '.18') + '),transparent 70%)';
    if(img !== 'none') all += sel + ' body{background-color:' + o.bg + ';background-image:' + img + ';background-attachment:fixed;background-repeat:no-repeat}';
    vars.bgImage = img;
    return { css: all, dark: dark, o: o, vars: vars };
  }

  var st, hide;
  function apply(o){
    var r = build(o, apply.red2Same);
    if(!st){ st = document.createElement('style'); st.id = 'exThemeStyle'; (document.head || document.documentElement).appendChild(st); }
    st.textContent = r.css;
    /* แถบสถานะของมือถือ: ใช้สีพื้นหลังเมื่อโหมดปัจจุบันตรงกับสีที่ตั้ง */
    try{
      var isDark = document.documentElement.dataset.theme === 'dark';
      if(isDark === r.dark){
        var m = document.querySelector('meta[name="theme-color"]');
        if(!m){ m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
        m.setAttribute('content', r.o.bg);
      }
    }catch(e){}
    window.EX_THEME_NOW = r.o;
    return r.o;
  }
  /* หน้าที่ --red2 เท่ากับ --red อยู่แล้ว (หน้าร้านหลัก) ให้ตามสีใหม่ · หน้าที่มีไล่เฉดของตัวเอง (เช่น เติมเงิน) คงไว้ */
  try{
    var cs = getComputedStyle(document.documentElement);
    apply.red2Same = cs.getPropertyValue('--red').trim().toLowerCase() === cs.getPropertyValue('--red2').trim().toLowerCase();
  }catch(e){ apply.red2Same = false; }

  function cached(){ try{ var j = JSON.parse(localStorage.getItem(KEY) || 'null'); return j && HEX.test(j.color) ? j : null; }catch(e){ return null; } }
  function remember(o){ try{ localStorage.setItem(KEY, JSON.stringify(clean(o))); }catch(e){} }

  window.EX_THEME_DEFAULT = DEF;
  window.exThemeClean = clean;
  window.exThemeBuild = build;          // แอดมิน: ทำตัวอย่างสด
  window.exThemeApply = apply;          // ดูตัวอย่างทันที (ยังไม่จำ)
  window.exThemeRemember = remember;

  /* หน้าแอดมินตั้งค่าเว็บ: ใช้เฉพาะตัวอย่างในการ์ด ไม่เปลี่ยนสีทั้งหน้า (window.EX_THEME_PREVIEW_ONLY) */
  var preview = !!window.EX_THEME_PREVIEW_ONLY;
  var c0 = cached();
  if(!preview){
    if(c0) apply(c0);
    else {
      /* เข้าครั้งแรกยังไม่มีค่าในเครื่อง: ซ่อนหน้าไว้สั้นๆ จนรู้สีจากฐานข้อมูล กันภาพกะพริบ (สูงสุด 1.2 วินาที) */
      hide = document.createElement('style'); hide.textContent = 'html{visibility:hidden}';
      (document.head || document.documentElement).appendChild(hide);
      setTimeout(function(){ if(hide){ hide.remove(); hide = null; } }, 1200);
    }
  }

  window.exThemeReady = fetch(DB.url + '/rest/v1/rpc/shop_theme', {
    method:'POST', headers:{ 'Content-Type':'application/json', apikey:DB.key, Authorization:'Bearer ' + DB.key }, body:'{}'
  }).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
    if(j && HEX.test(j.color) && HEX.test(j.bg)){ remember(j); if(!preview) apply(j); return clean(j); }
    return null;
  }).catch(function(){ return null; }).then(function(v){
    if(hide){ hide.remove(); hide = null; }
    return v;
  });
})();
