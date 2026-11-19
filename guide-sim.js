/* guide-sim.js — ภาพจำลองเล่นเองในคู่มือสอนใช้งาน (ใช้คู่กับ admin-guide.js + guide-sim.css)
   แต่ละขั้นตอนเป็น "ฉาก" = หน้าจอจำลองเล็ก ๆ + สคริปต์การกระทำ (เคอร์เซอร์ขยับ → กด → พิมพ์ → เลือก → ขึ้นแจ้งเตือน) แล้ววนซ้ำ
   แก้/เพิ่มฉาก: ไปที่ SCENES ด้านล่าง  SCENES[idหน้า][ลำดับขั้นตอน] = { els:[...องค์ประกอบ], seq:[...การกระทำ] }
   ทุกข้อความเป็นคู่ [ลาว, ไทย] ผ่านฟังก์ชัน T(ลาว, ไทย)

   องค์ประกอบ (els):  title note in(ช่องกรอก) sel(ช่องเลือก) btn ib(ปุ่มไอคอน) tabs chips tiles item(แถวรายการ) list r(แถวนอน) g(กลุ่ม ซ่อน/โชว์ได้)
                      tgl up sl sws pv mq fnt bar hdr cardpv dlg slip dc
   การกระทำ (seq):   ['w',ms] รอ · ['mv',id] เลื่อนเคอร์เซอร์ · ['pt',id] ชี้ · ['ck',id] กด · ['ty',id,ข้อความ,{f,m,sp}] พิมพ์ · ['pk',id,ลำดับตัวเลือก] เลือกในช่องเลือก
                      ['sh',id] แสดง · ['hd',id] ซ่อน · ['dn',id] ลบแถว · ['ts',ข้อความ] แจ้งผลสีเขียว · ['hl',id] เน้นการ์ดตัวเลข · ['cl',id,คลาส] สลับคลาส
                      ['st',id,ข้อความ,คลาส] ตั้งข้อความ · ['sl',id,%] เลื่อนแถบ · ['ft',idรายการ,คำ] กรองรายการ · ['hw',id,คำ] ไฮไลต์คำ */
(function () {
  'use strict';
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches);
  var LANG = 0, STOP = {}, insts = [], io = null, errs = [];
  function T(a, b) { return [a, b]; }
  function TS(a, b, s) { return [a + s, b + s]; }
  function tx(v) { return Array.isArray(v) ? v[LANG] : (v == null ? '' : String(v)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------- ไอคอน ---------- */
  var IC = {
    plus: '<path d="M12 5v14M5 12h14"/>', pencil: '<path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chev: '<path d="m6 9 6 6 6-6"/>', upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', up: '<path d="M12 19V5M5 12l7-7 7 7"/>', down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>', chart: '<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3"/>', power: '<path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>', eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z"/>'
  };
  function ic(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' + IC[k] + '</svg>'; }
  var CUR = '<svg viewBox="0 0 24 24" fill="#fff" stroke="#000" stroke-width="1.2" stroke-linejoin="round"><path d="M5 3l14 7-6 2-2 6z"/></svg>';

  /* ---------- ตัวสร้าง HTML ขององค์ประกอบ ---------- */
  function hx(e) { return (e.h ? ' data-h="1"' : '') + (e.x ? ' data-x="' + e.x + '"' : ''); }
  function di(e, suf) { return e.id ? ' data-id="' + e.id + (suf || '') + '"' : ''; }
  function RL(a) { return (a || []).map(R).join(''); }
  function R(e) {
    var h = '', i;
    switch (e.t) {
      case 'title': return '<div class="sm-t"' + hx(e) + '>' + (e.ic ? ic(e.ic) : '') + esc(tx(e.lab)) + '</div>';
      case 'note': return '<div class="sm-note"' + di(e) + hx(e) + '>' + esc(tx(e.lab)) + '</div>';
      case 'in': {
        var v = e.v != null ? tx(e.v) : '', cls = 'sm-in' + (e.area ? ' sm-area' : '') + (e.num ? ' num' : '');
        h = '<div class="sm-fld">' + (e.lab ? '<span class="sm-lab">' + esc(tx(e.lab)) + '</span>' : '') +
          '<div class="' + cls + '"' + di(e) + (e.pw ? ' data-pw="1"' : '') + (v ? ' data-init="1"' : '') + '><span class="v' + (v ? '' : ' ph') + '">' + esc(v || tx(e.ph)) + '</span><i class="sm-car"></i></div></div>';
        return h;
      }
      case 'sel': {
        var cur = e.v == null ? -1 : e.v;
        h = '<div class="sm-fld">' + (e.lab ? '<span class="sm-lab">' + esc(tx(e.lab)) + '</span>' : '') + '<div class="sm-sw"><div class="sm-in sm-sel"' + di(e) + '><span class="v' + (cur < 0 ? ' ph' : '') + '">' + esc(cur < 0 ? tx(e.ph) : tx(e.opts[cur])) + '</span>' + ic('chev') + '</div><div class="sm-menu">';
        for (i = 0; i < e.opts.length; i++) h += '<div class="sm-opt' + (i === cur ? ' cur' : '') + '">' + esc(tx(e.opts[i])) + '</div>';
        return h + '</div></div></div>';
      }
      case 'btn': return '<div class="sm-b' + (e.v ? ' ' + e.v : '') + (e.blk ? ' blk' : '') + '"' + di(e) + hx(e) + '>' + (e.ic ? ic(e.ic) : '') + esc(tx(e.lab)) + '</div>';
      case 'ib': return '<div class="sm-ib' + (e.v ? ' ' + e.v : '') + '"' + di(e) + (e.cl ? ' data-cl="' + e.cl + '"' : '') + hx(e) + '>' + (e.ic ? ic(e.ic) : esc(e.txt || '')) + '</div>';
      case 'tabs': h = '<div class="sm-tabs">'; for (i = 0; i < e.items.length; i++) h += '<div class="sm-tab' + (i === (e.on || 0) ? ' on' : '') + '" data-id="' + e.id + i + '">' + esc(tx(e.items[i])) + '</div>'; return h + '</div>';
      case 'chips': h = '<div class="sm-chips">'; for (i = 0; i < e.items.length; i++) h += '<div class="sm-chip' + (i === e.on ? ' on' : '') + (e.dot ? '' : '') + '" data-id="' + e.id + i + '">' + (e.dot ? '<i></i>' : '') + esc(tx(e.items[i])) + '</div>'; return h + '</div>';
      case 'tiles': h = '<div class="sm-tiles' + (e.cols === 3 ? ' c3' : '') + '">'; for (i = 0; i < e.items.length; i++) { var it = e.items[i]; h += '<div class="sm-tile ' + (it[2] || '') + '" data-id="' + e.id + i + '"><small>' + esc(tx(it[0])) + '</small><b>' + esc(it[1]) + '</b></div>'; } return h + '</div>';
      case 'item': {
        h = '<div class="sm-row"' + di(e) + hx(e) + (e.k ? ' data-k="' + esc(e.k.toLowerCase()) + '"' : '') + (e.tg ? ' data-tg="' + e.tg + '"' : '') + '>';
        if (e.ck) h += '<span class="sm-ck">' + ic('check') + '</span>';
        if (e.av) h += '<span class="sm-av">' + esc(e.av) + '</span>';
        if (e.th) h += '<span class="sm-th">' + ic(e.th) + '</span>';
        h += '<div class="x"><b>' + esc(tx(e.title)) + '</b>' + (e.sub ? '<small>' + esc(tx(e.sub)) + '</small>' : '') + '</div>';
        if (e.bd) h += '<span class="sm-bd ' + (e.bd[1] || '') + '"' + di(e, '.b') + '>' + esc(tx(e.bd[0])) + '</span>';
        if (e.rt != null) h += '<span class="rt"' + di(e, '.r') + '>' + esc(tx(e.rt)) + '</span>';
        if (e.end) h += RL(e.end);
        if (e.act) h += '<div class="sm-act">' + RL(e.act) + '</div>';
        return h + '</div>';
      }
      case 'list': return '<div class="sm-list"' + di(e) + '>' + RL(e.els) + '</div>';
      case 'r': return '<div class="sm-r' + (e.wrap ? ' wrap' : '') + '">' + RL(e.els) + '</div>';
      case 'g': return '<div class="sm-g' + (e.card ? ' sm-card' : '') + '"' + di(e) + hx(e) + '>' + RL(e.els) + '</div>';
      case 'tgl': return '<div class="sm-tgl' + (e.on ? ' on' : '') + '"' + di(e) + '><div class="k"><i></i></div><span>' + esc(tx(e.lab)) + '</span></div>';
      case 'up': return '<div class="sm-up"' + di(e) + ' data-done="' + esc(tx(e.done)) + '">' + (e.qr ? '<span class="sm-qr"><i></i></span>' : '') + ic('upload') + '<span class="v">' + esc(tx(e.lab)) + '</span></div>';
      case 'sl': return (e.lab ? '<span class="sm-lab">' + esc(tx(e.lab)) + '</span>' : '') + '<div class="sm-sl"' + di(e) + '><i style="width:' + (e.val || 30) + '%"></i><u style="left:' + (e.val || 30) + '%"></u></div>';
      case 'sws': h = '<div class="sm-sws">'; for (i = 0; i < e.colors.length; i++) h += '<div class="sm-sw2' + (i === 0 ? ' on' : '') + '" data-id="' + e.id + i + '" data-c="' + e.colors[i] + '" style="background:' + e.colors[i] + '"></div>'; return h + '</div>';
      case 'pv': return '<div class="sm-pv"' + di(e) + '>' + esc(tx(e.lab)) + '</div>';
      case 'mq': return '<div class="sm-mq"' + di(e) + hx(e) + '><span class="v">' + esc(tx(e.lab)) + '</span></div>';
      case 'fnt': h = '<div class="sm-list">'; for (i = 0; i < e.items.length; i++) h += '<div class="sm-fnt' + (i === 0 ? ' on' : '') + '" data-id="' + e.id + i + '" style="font-family:' + e.items[i][1] + '"><small>' + esc(e.items[i][0]) + '</small>' + esc(tx(e.sample)) + '</div>'; return h + '</div>';
      case 'bar': return '<div class="sm-bar"' + di(e) + '><i></i></div>';
      case 'hdr': return '<div class="sm-hdr"><span class="sm-th lg"' + di(e, '.l') + '>' + ic('bag') + '</span><b' + di(e, '.n') + '>' + esc(tx(e.lab)) + '</b></div>';
      case 'cardpv': return '<div class="sm-card2"><b' + di(e, '.t') + '></b><small' + di(e, '.m') + '></small></div>';
      case 'dc': return '<div class="sm-dc-msg"' + di(e) + hx(e) + '><span class="a">EX</span><div><b>ExShop Bot</b><small>' + esc(tx(e.lab)) + '</small></div></div>';
      case 'slip': return '<div class="sm-slip"><b' + di(e, 'a') + '>' + esc(tx(e.amt)) + '</b><span' + di(e, 't') + '>' + esc(tx(e.time)) + '</span><i></i><i></i></div>';
      case 'dlg': return '<div class="sm-dlg"' + di(e) + '><div>' + RL(e.els) + '</div></div>';
    }
    return '';
  }

  /* ---------- ฉากเนื้อหา ---------- */
  var K = '₭ ';
  var OKT = T(' ✓', ' ✓');
  function B(id, lab, o) { var r = { t: 'btn', id: id, lab: lab }; for (var k in o) r[k] = o[k]; return r; }
  function IN(id, lab, ph, o) { var r = { t: 'in', id: id, lab: lab, ph: ph }; for (var k in o) r[k] = o[k]; return r; }
  function tiles5(id, items) { return { t: 'tiles', id: id, items: items }; }
  function hlSeq(id, n) { var s = [['w', 450]]; for (var i = 0; i < n; i++) s.push(['mv', id + i], ['hl', id + i], ['w', 750]); return s; }
  function CONF(id, msg, no, yes) { return { t: 'dlg', id: id, els: [{ t: 'note', lab: msg }, { t: 'r', els: [B(id + 'n', no, { v: 'gh' }), B(id + 'y', yes)] }] }; }

  var SCENES = {};

  /* ───── 1 จัดการสินค้า & หมวดหมู่ ───── */
  SCENES.products = [
    { /* 0 สถิติ */
      els: [{ t: 'title', ic: 'chart', lab: T('ພາບລວມສະຖິຕິລາຍໄດ້', 'ภาพรวมสถิติรายได้') },
        tiles5('s', [[T('ຍອດມື້ນີ້', 'ยอดวันนี้'), K + '1,250,000', 'good'], [T('ສະມາຊິກທັງໝົດ', 'สมาชิกทั้งหมด'), '128'], [T('ສິນຄ້າທີ່ຂາຍແລ້ວ', 'สินค้าที่ขายแล้ว'), '342'], [T('ຍອດຂາຍສະສົມ', 'ยอดขายสะสม'), K + '18.4M'], [T('ລູກຄ້າເຕີມເງິນທັງໝົດ', 'ลูกค้าเติมเงินทั้งหมด'), K + '9,600,000', 'w']])],
      seq: hlSeq('s', 5)
    },
    { /* 1 แท็บ */
      els: [{ t: 'tabs', id: 'tb', items: [T('ຈັດການສິນຄ້າ', 'จัดการสินค้า'), T('ຈັດການໝວດໝູ່', 'จัดการหมวดหมู่')], on: 0 },
        { t: 'g', id: 'ga', x: 't', els: [{ t: 'list', els: [
          { t: 'item', th: 'bag', title: 'Unban FiveM', sub: K + '15,000', bd: [T('ເປີດ', 'เปิด')] },
          { t: 'item', th: 'bag', title: 'Netflix Premium', sub: K + '45,000', bd: [T('ເປີດ', 'เปิด')] }] }] },
        { t: 'g', id: 'gb', x: 't', h: 1, els: [IN('cn', T('ຊື່ໝວດໝູ່', 'ชื่อหมวดหมู่'), T('ເຊັ່ນ Digital License Premium', 'เช่น Digital License Premium')), { t: 'list', els: [
          { t: 'item', th: 'tag', title: 'Game Accounts', sub: T('4 ສິນຄ້າ', '4 สินค้า') },
          { t: 'item', th: 'tag', title: 'Streaming', sub: T('7 ສິນຄ້າ', '7 สินค้า') }] }] }],
      seq: [['w', 700], ['mv', 'ga'], ['w', 500], ['ck', 'tb1'], ['hd', 'ga'], ['sh', 'gb'], ['w', 700], ['mv', 'cn'], ['w', 900]]
    },
    { /* 2 สร้างหมวดหมู่ */
      els: [{ t: 'title', ic: 'tag', lab: T('ສ້າງໝວດໝູ່ໃໝ່', 'สร้างหมวดหมู่ใหม่') },
        IN('cn', T('ຊື່ໝວດໝູ່', 'ชื่อหมวดหมู่'), T('ເຊັ່ນ Digital License Premium', 'เช่น Digital License Premium')),
        { t: 'up', id: 'cv', lab: T('ຮູບພາບໜ້າປົກໝວດໝູ່', 'รูปภาพหน้าปกหมวดหมู่'), done: 'cover.jpg' },
        B('cs', T('ບັນທຶກ ແລະ ສ້າງໝວດໝູ່', 'บันทึก และ สร้างหมวดหมู่'), { blk: 1 }),
        { t: 'list', els: [{ t: 'item', th: 'tag', title: 'Game Accounts', sub: T('4 ສິນຄ້າ', '4 สินค้า') },
          { t: 'item', id: 'nc', h: 1, th: 'tag', title: 'Digital License Premium', sub: T('0 ສິນຄ້າ', '0 สินค้า'), bd: [T('ໃໝ່', 'ใหม่'), 'rd'] }] }],
      seq: [['w', 500], ['ty', 'cn', 'Digital License Premium'], ['ck', 'cv'], ['w', 500], ['ck', 'cs'], ['ts', T('ສ້າງໝວດໝູ່ແລ້ວ ✓', 'สร้างหมวดหมู่แล้ว ✓')], ['sh', 'nc'], ['mv', 'nc'], ['w', 900]]
    },
    { /* 3 เพิ่มสินค้า */
      els: [{ t: 'r', els: [{ t: 'title', ic: 'bag', lab: T('ຈັດການສິນຄ້າ', 'จัดการสินค้า') }, B('ad', T('+ ເພີ່ມສິນຄ້າ', '+ เพิ่มสินค้า'))] },
        { t: 'g', id: 'fm', h: 1, card: 1, els: [{ t: 'title', lab: T('ເພີ່ມສິນຄ້າ', 'เพิ่มสินค้า') },
          IN('pn', T('ຊື່ສິນຄ້າ', 'ชื่อสินค้า'), T('ໃສ່ຊື່ສິນຄ້າ', 'ใส่ชื่อสินค้า')),
          { t: 'sel', id: 'pc', lab: T('ໝວດໝູ່', 'หมวดหมู่'), ph: T('ບໍ່ລະບຸ', 'ไม่ระบุ'), opts: [T('ບໍ່ລະບຸ', 'ไม่ระบุ'), 'Game Accounts', 'Digital License Premium'] },
          { t: 'up', id: 'pi', lab: T('ອັບໂຫຼດຈາກເຄື່ອງ', 'อัปโหลดจากเครื่อง'), done: 'unban-fivem.png' }] }],
      seq: [['w', 500], ['ck', 'ad'], ['sh', 'fm'], ['w', 450], ['ty', 'pn', 'Unban FiveM'], ['pk', 'pc', 2], ['ck', 'pi'], ['w', 1100]]
    },
    { /* 4 ตัวแก้ไขรายละเอียด */
      els: [{ t: 'title', lab: T('ລາຍລະອຽດສິນຄ້າ (ຮອງຮັບ HTML)', 'รายละเอียดสินค้า (รองรับ HTML)') },
        { t: 'r', wrap: 1, els: [{ t: 'ib', id: 'un', txt: '↶' }, { t: 'ib', id: 'rd', txt: '↷' }, { t: 'ib', id: 'bh', txt: 'A', cl: 'ds hl' }, { t: 'ib', id: 'bc', txt: '≡', cl: 'ds ctr' }, { t: 'ib', id: 'bl', txt: '•', cl: 'ds li' }] },
        IN('ds', null, T('ຂຽນລາຍລະອຽດສິນຄ້າ...', 'เขียนรายละเอียดสินค้า...'), { area: 1 })],
      seq: [['w', 500], ['ty', 'ds', T('ປົດແບນ FiveM ໃຊ້ງານງ່າຍ ປອດໄພ 100%', 'ปลดแบน FiveM ใช้งานง่าย ปลอดภัย 100%')], ['hw', 'ds', T('ປອດໄພ 100%', 'ปลอดภัย 100%')], ['w', 300], ['ck', 'bh'], ['w', 500], ['ck', 'bl'], ['w', 1000]]
    },
    { /* 5 สถานะ + ยอดขายจำลอง */
      els: [{ t: 'sel', id: 'st', lab: T('ສະຖານະ', 'สถานะ'), v: 0, opts: [T('ເປີດໃຊ້ງານ', 'เปิดใช้งาน'), T('ປິດໃຊ້ງານ', 'ปิดใช้งาน'), T('ປິດອັບເດດ', 'ปิดอัปเดต')] },
        { t: 'item', th: 'bag', title: 'Unban FiveM', sub: T('ປ້າຍທີ່ສະແດງໃນໜ້າຮ້ານ', 'ป้ายที่แสดงในหน้าร้าน'), bd: [T('ເປີດໃຊ້ງານ', 'เปิดใช้งาน')], id: 'pvw' },
        IN('sm', T('ຍອດຂາຍຈຳລອງ', 'ยอดขายจำลอง'), '0', { v: '0', num: 1 })],
      seq: [['w', 500], ['pk', 'st', 2], ['st', 'pvw.b', T('ປິດອັບເດດ', 'ปิดอัปเดต'), 'sm-bd wn'], ['w', 500], ['ty', 'sm', '128'], ['w', 1000]]
    },
    { /* 6 ตัวเลือกและราคา */
      els: [{ t: 'r', els: [{ t: 'title', lab: T('ລາຄາ / ຕົວເລືອກສິນຄ້າ', 'ราคา / ตัวเลือกสินค้า') }, B('ad', T('+ ເພີ່ມຕົວເລືອກ', '+ เพิ่มตัวเลือก'), { v: 'gh' })] },
        { t: 'g', id: 'r1', h: 1, els: [{ t: 'r', els: [IN('n1', null, T('ຊື່ຕົວເລືອກ', 'ชื่อตัวเลือก')), IN('p1', null, T('ລາຄາ', 'ราคา'), { num: 1 }), { t: 'ib', id: 'x1', ic: 'x', v: 'dg' }] }] },
        { t: 'g', id: 'r2', h: 1, els: [{ t: 'r', els: [IN('n2', null, T('ຊື່ຕົວເລືອກ', 'ชื่อตัวเลือก')), IN('p2', null, T('ລາຄາ', 'ราคา'), { num: 1 }), { t: 'ib', id: 'x2', ic: 'x', v: 'dg' }] }] },
        { t: 'g', id: 'r3', h: 1, els: [{ t: 'r', els: [IN('n3', null, T('ຊື່ຕົວເລືອກ', 'ชื่อตัวเลือก')), IN('p3', null, T('ລາຄາ', 'ราคา'), { num: 1 }), { t: 'ib', id: 'x3', ic: 'x', v: 'dg' }] }] }],
      seq: [['w', 400], ['ck', 'ad'], ['sh', 'r1'], ['ty', 'n1', T('1 ມື້', '1 วัน')], ['ty', 'p1', '15000'], ['ck', 'ad'], ['sh', 'r2'], ['ty', 'n2', T('7 ມື້', '7 วัน')], ['ty', 'p2', '70000'], ['ck', 'ad'], ['sh', 'r3'], ['ty', 'n3', T('30 ມື້', '30 วัน')], ['ty', 'p3', '200000'], ['w', 300], ['ck', 'x3'], ['dn', 'r3'], ['w', 900]]
    },
    { /* 7 บันทึก / แก้ไข / ลบ */
      els: [{ t: 'r', els: [B('cn', T('ຍົກເລີກ', 'ยกเลิก'), { v: 'gh' }), B('sv', T('ບັນທຶກ', 'บันทึก'))] },
        IN('q', null, T('ຄົ້ນຫາຊື່ສິນຄ້າ...', 'ค้นหาชื่อสินค้า...')),
        { t: 'list', els: [{ t: 'item', th: 'bag', title: 'Netflix Premium', sub: K + '45,000 · ' + '342', bd: [T('ເປີດ', 'เปิด')] },
          { t: 'item', id: 'np', h: 1, th: 'bag', title: 'Unban FiveM', sub: K + '15,000 · Digital License Premium', bd: [T('ເປີດ', 'เปิด')], act: [{ t: 'ib', id: 'ed', ic: 'pencil' }, { t: 'ib', id: 'dl', ic: 'trash', v: 'dg' }] }] }],
      seq: [['w', 500], ['ck', 'sv'], ['ts', T('ບັນທຶກສິນຄ້າແລ້ວ ✓', 'บันทึกสินค้าแล้ว ✓')], ['sh', 'np'], ['w', 700], ['pt', 'ed'], ['w', 600], ['pt', 'dl'], ['w', 1000]]
    }
  ];

  /* ───── 1.1 คูปอง & โค้ดฟรี ───── */
  SCENES.coupons = [
    { els: [{ t: 'tabs', id: 'tb', on: 0, items: [T('ຄູປອງສ່ວນຫຼຸດ', 'คูปองส่วนลด'), T('ໂຄ້ດຟຣີເຕີມເງິນ', 'โค้ดฟรีเติมเงิน')] },
        { t: 'g', id: 'ga', card: 1, els: [{ t: 'title', ic: 'tag', lab: T('ລະຫັດລົດລາຄາຕອນຊື້', 'รหัสลดราคาตอนซื้อ') }, { t: 'note', lab: T('ລູກຄ້າໃສ່ລະຫັດຕອນຊຳລະ → ໄດ້ສ່ວນຫຼຸດ', 'ลูกค้าใส่รหัสตอนชำระ → ได้ส่วนลด') }] },
        { t: 'g', id: 'gb', h: 1, card: 1, els: [{ t: 'title', ic: 'wallet', lab: T('ລະຫັດຮັບເຄຣດິດຟຣີ', 'รหัสรับเครดิตฟรี') }, { t: 'note', lab: T('ລູກຄ້າໃສ່ລະຫັດ → ໄດ້ເງິນເຂົ້າຍອດ', 'ลูกค้าใส่รหัส → ได้เงินเข้ายอด') }] }],
      seq: [['w', 500], ['ck', 'tb1'], ['hd', 'ga'], ['sh', 'gb'], ['w', 1100], ['ck', 'tb0'], ['hd', 'gb'], ['sh', 'ga'], ['w', 900]] },
    { els: [IN('cc', T('ລະຫັດຄູປອງ (ຕົວອັກສອນ/ຕົວເລກ)', 'รหัสคูปอง (ตัวอักษร/ตัวเลข)'), 'SUMMER10'),
        { t: 'sel', id: 'ck', lab: T('ປະເພດສ່ວນຫຼຸດ', 'ประเภทส่วนลด'), ph: T('ເລືອກປະເພດ', 'เลือกประเภท'), opts: [T('ເປີເຊັນ (%)', 'เปอร์เซ็นต์ (%)'), T('ຈຳນວນເງິນ (₭)', 'จำนวนเงิน (₭)')] },
        IN('cv', T('ມູນຄ່າສ່ວນຫຼຸດ', 'มูลค่าส่วนลด'), '0', { num: 1 })],
      seq: [['w', 400], ['ty', 'cc', 'SALE10'], ['pk', 'ck', 0], ['ty', 'cv', '10'], ['w', 1100]] },
    { els: [IN('mx', T('ຈຳກັດຈຳນວນ (ຄັ້ງ)', 'จำกัดจำนวน (ครั้ง)'), '0', { num: 1 }), IN('pu', T('ຈຳກັດຕໍ່ຜູ້ໃຊ້ (ຄັ້ງ)', 'จำกัดต่อผู้ใช้ (ครั้ง)'), '0', { num: 1 }),
        { t: 'note', lab: T('ເວ້ນຫວ່າງ ຫຼື 0 = ບໍ່ຈຳກັດ', 'เว้นว่าง หรือ 0 = ไม่จำกัด') }],
      seq: [['w', 400], ['ty', 'mx', '100'], ['ty', 'pu', '1'], ['w', 1200]] },
    { els: [{ t: 'note', lab: T('ໃຊ້ໄດ້ກັບສິນຄ້າ · ບໍ່ເລືອກ = ທຸກສິນຄ້າ', 'ใช้ได้กับสินค้า · ไม่เลือก = ทุกสินค้า') },
        { t: 'list', els: [
          { t: 'item', id: 'p1', tg: 'sel', ck: 1, th: 'bag', title: 'Unban FiveM' },
          { t: 'item', id: 'p2', tg: 'sel', ck: 1, th: 'bag', title: 'VIP Key' },
          { t: 'item', id: 'p3', tg: 'sel', ck: 1, th: 'bag', title: 'Whitelist' }] },
        IN('mn', T('ຍອດຊື້ຂັ້ນຕ່ຳ (₭)', 'ยอดซื้อขั้นต่ำ (₭)'), '0', { num: 1 }), IN('ex', T('ວັນໝົດອາຍຸຄູປອງ', 'วันหมดอายุคูปอง'), 'dd/mm/yyyy')],
      seq: [['w', 400], ['ck', 'p1'], ['w', 300], ['ck', 'p2'], ['w', 300], ['ty', 'mn', '50000'], ['ty', 'ex', '31/12/2026'], ['w', 1000]] },
    { els: [B('sv', T('ບັນທຶກ ແລະເປີດໃຊ້ງານຄູປອງ', 'บันทึก และเปิดใช้งานคูปอง'), { blk: 1 }), { t: 'note', lab: T('ຄູປອງທັງໝົດໃນລະບົບ', 'คูปองทั้งหมดในระบบ') },
        { t: 'note', id: 'em', lab: T('— ຍັງບໍ່ມີຄູປອງໃນລະບົບ —', '— ยังไม่มีคูปองในระบบ —') },
        { t: 'list', els: [{ t: 'item', id: 'r1', h: 1, th: 'tag', title: 'SALE10', sub: T('10% · ຂັ້ນຕ່ຳ ₭ 50,000 · 0 / 100', '10% · ขั้นต่ำ ₭ 50,000 · 0 / 100'), rt: '1/คน' }] }],
      seq: [['w', 500], ['ck', 'sv'], ['ts', T('ສ້າງຄູປອງ SALE10 ແລ້ວ ✓', 'สร้างคูปอง SALE10 แล้ว ✓')], ['hd', 'em'], ['sh', 'r1'], ['w', 1300]] },
    { els: [{ t: 'tabs', id: 'tb', on: 1, items: [T('ຄູປອງສ່ວນຫຼຸດ', 'คูปองส่วนลด'), T('ໂຄ້ດຟຣີເຕີມເງິນ', 'โค้ดฟรีเติมเงิน')] },
        IN('fc', T('ລະຫັດໂຄ້ດ (ຕົວອັກສອນ/ຕົວເລກ)', 'รหัสโค้ด (ตัวอักษร/ตัวเลข)'), 'FREE5K'), IN('fa', T('ຈຳນວນເຄຣດິດທີ່ໄດ້ຮັບ (₭)', 'จำนวนเครดิตที่ได้รับ (₭)'), '0', { num: 1 }),
        { t: 'note', lab: T('ສະມາຊິກ 1 ຄົນໃຊ້ໂຄ້ດດຽວກັນໄດ້ເທື່ອດຽວ', 'สมาชิก 1 คนใช้โค้ดเดียวกันได้ครั้งเดียว') },
        B('sv', T('ບັນທຶກ ແລະເປີດໃຊ້ງານໂຄ້ດ', 'บันทึก และเปิดใช้งานโค้ด'), { blk: 1 })],
      seq: [['w', 400], ['ty', 'fc', 'FREE5K'], ['ty', 'fa', '5000'], ['w', 400], ['ck', 'sv'], ['ts', T('ສ້າງໂຄ້ດ FREE5K ແລ້ວ ✓', 'สร้างโค้ด FREE5K แล้ว ✓')], ['w', 1100]] },
    { els: [{ t: 'list', els: [{ t: 'item', id: 'r1', th: 'tag', title: 'SALE10', sub: T('10% · 0 / 100', '10% · 0 / 100'), act: [{ t: 'ib', id: 'dl', ic: 'trash', v: 'dg' }] }] },
        CONF('cf', T('ລຶບຄູປອງ SALE10 ?', 'ลบคูปอง SALE10 ?'), T('ຍົກເລີກ', 'ยกเลิก'), T('ລຶບ', 'ลบ'))],
      seq: [['w', 500], ['ck', 'dl'], ['sh', 'cf'], ['w', 700], ['ck', 'cfy'], ['hd', 'cf'], ['dn', 'r1'], ['ts', T('ລຶບແລ້ວ ✓', 'ลบแล้ว ✓')], ['w', 1000]] }
  ];

  /* ───── 1.2 Flash Sale ───── */
  SCENES.flash = [
    { els: [IN('pc', T('ລົດທັງຮ້ານ (%)', 'ลดทั้งร้าน (%)'), '0', { num: 1 }), { t: 'note', lab: T('ຄິດຈາກລາຄາປົກກະຕິ', 'คิดจากราคาปกติ') },
        { t: 'item', id: 'iv', th: 'bag', title: 'Unban FiveM', sub: T('ລາຄາປົກກະຕິ ₭ 100,000', 'ราคาปกติ ₭ 100,000'), rt: '—' }],
      seq: [['w', 400], ['ty', 'pc', '20'], ['mv', 'iv.r'], ['st', 'iv.r', '₭ 80,000'], ['hl', 'iv'], ['w', 1300]] },
    { els: [IN('en', T('ເວລາສິ້ນສຸດ (ສິນຄ້າທີ່ຮ່ວມລົດ)', 'เวลาสิ้นสุด (สินค้าที่ร่วมลด)'), 'dd/mm/yyyy --:--'), { t: 'note', lab: T('ຕ້ອງເປັນເວລາໃນອະນາຄົດ · ເວ້ນຫວ່າງ = ບໍ່ກຳນົດ', 'ต้องเป็นเวลาในอนาคต · เว้นว่าง = ไม่กำหนด') }],
      seq: [['w', 400], ['ty', 'en', '31/12/2026 23:59'], ['w', 1300]] },
    { els: [IN('q', null, T('ຄົ້ນຫາສິນຄ້າ...', 'ค้นหาสินค้า...')),
        { t: 'list', els: [
          { t: 'item', id: 'x1', tg: 'sel', ck: 1, th: 'bag', title: 'Unban FiveM', rt: '₭ 100,000' },
          { t: 'item', id: 'x2', tg: 'sel', ck: 1, th: 'bag', title: 'VIP Key', rt: '₭ 50,000' },
          { t: 'item', id: 'x3', tg: 'sel', ck: 1, th: 'bag', title: 'Whitelist', rt: '₭ 30,000' }] },
        { t: 'note', id: 'cn', lab: T('ຕິກແລ້ວ 0 ລາຍການບໍ່ລົດ', 'ติกแล้ว 0 รายการไม่ลด') }],
      seq: [['w', 400], ['ck', 'x2'], ['st', 'cn', T('ຕິກແລ້ວ 1 ລາຍການບໍ່ລົດ', 'ติกแล้ว 1 รายการไม่ลด')], ['w', 1300]] },
    { els: [{ t: 'note', id: 'lv', h: 1, lab: T('Flash Sale ກຳລັງເປີດ · -20% · ສິ້ນສຸດ 31/12/2026 23:59', 'Flash Sale กำลังเปิด · -20% · สิ้นสุด 31/12/2026 23:59') },
        B('go', T('ໃຊ້ລົດ % ທັງຮ້ານ', 'ใช้ลด % ทั้งร้าน'), { blk: 1 }),
        { t: 'item', id: 'iv', th: 'bag', title: 'Unban FiveM', sub: T('ລາຄາປົກກະຕິ ₭ 100,000', 'ราคาปกติ ₭ 100,000'), rt: '—' }],
      seq: [['w', 500], ['ck', 'go'], ['ts', T('ເປີດ Flash Sale ລົດ 20% ແລ້ວ ✓', 'เปิด Flash Sale ลด 20% แล้ว ✓')], ['sh', 'lv'], ['st', 'iv.r', '₭ 80,000'], ['hl', 'iv'], ['w', 1400]] },
    { els: [{ t: 'note', lab: T('Unban FiveM · ລາຄາປົກກະຕິ ₭ 100,000', 'Unban FiveM · ราคาปกติ ₭ 100,000') }, IN('fp', T('ລາຄາ Flash', 'ราคา Flash'), '₭', { v: '80000', num: 1 }),
        { t: 'note', lab: T('ຕ້ອງບໍ່ເກີນລາຄາປົກກະຕິ', 'ต้องไม่เกินราคาปกติ') }],
      seq: [['w', 500], ['ty', 'fp', '70000'], ['ts', T('ບັນທຶກລາຄາແລ້ວ ✓', 'บันทึกราคาแล้ว ✓')], ['w', 1200]] },
    { els: [IN('pc', T('ລົດທັງຮ້ານ (%)', 'ลดทั้งร้าน (%)'), '0', { v: '20', num: 1 }), B('go', T('ໃຊ້ລົດ % ທັງຮ້ານ', 'ใช้ลด % ทั้งร้าน'), { blk: 1 }),
        CONF('cf', T('ປິດ Flash Sale ທັງໝົດ ແລະລ້າງລາຄາ Flash ?', 'ปิด Flash Sale ทั้งหมด และล้างราคา Flash ?'), T('ຍົກເລີກ', 'ยกเลิก'), T('ຢືນຢັນ', 'ยืนยัน'))],
      seq: [['w', 400], ['ty', 'pc', '0'], ['ck', 'go'], ['sh', 'cf'], ['w', 700], ['ck', 'cfy'], ['hd', 'cf'], ['ts', T('ປິດ Flash Sale ແລ້ວ ✓', 'ปิด Flash Sale แล้ว ✓')], ['w', 1100]] }
  ];

  /* ───── 2 เติมสต็อก ───── */
  SCENES.stock = [
    { /* 0 สรุปสต็อก */
      els: [{ t: 'tiles', id: 's', cols: 3, items: [[T('ພ້ອມຂາຍທັງໝົດ', 'พร้อมขายทั้งหมด'), '1,240', 'good'], [T('ໃກ້ໝົດ', 'ใกล้หมด'), '3', 'warn'], [T('ໝົດສະຕັອກ', 'หมดสต็อก'), '1', 'bad']] },
        IN('q', null, T('ຄົ້ນຫາສິນຄ້າ', 'ค้นหาสินค้า')),
        { t: 'chips', id: 'c', on: 0, items: [T('ທັງໝົດ', 'ทั้งหมด'), T('ໃກ້ໝົດ', 'ใกล้หมด'), T('ໝົດສະຕັອກ', 'หมดสต็อก')] },
        { t: 'list', id: 'lst', els: [
          { t: 'item', th: 'bag', title: 'Unban FiveM', k: 'unban fivem near', rt: '3', bd: [T('ໃກ້ໝົດ', 'ใกล้หมด'), 'wn'] },
          { t: 'item', th: 'bag', title: 'Netflix Premium', k: 'netflix premium', rt: '120' },
          { t: 'item', th: 'bag', title: 'Spotify 1M', k: 'spotify out', rt: '0', bd: [T('ໝົດ', 'หมด'), 'rd'] }] }],
      seq: [['w', 400], ['mv', 's0'], ['hl', 's0'], ['w', 600], ['mv', 's1'], ['hl', 's1'], ['w', 600], ['mv', 's2'], ['hl', 's2'], ['w', 600], ['ck', 'c1'], ['ft', 'lst', 'near'], ['w', 1100]]
    },
    { /* 1 เลือกสินค้า+ตัวเลือก */
      els: [{ t: 'list', els: [
        { t: 'item', id: 'p1', tg: 'on', th: 'bag', title: 'Unban FiveM', sub: T('3 ຕົວເລືອກ', '3 ตัวเลือก') },
        { t: 'item', id: 'p2', tg: 'on', th: 'bag', title: 'Netflix Premium', sub: T('2 ຕົວເລືອກ', '2 ตัวเลือก') }] },
        { t: 'g', id: 'op', h: 1, card: 1, els: [{ t: 'title', lab: T('ເລືອກຕົວເລືອກທີ່ຈະເຕີມ', 'เลือกตัวเลือกที่จะเติม') }, { t: 'list', els: [
          { t: 'item', id: 'o1', tg: 'on', title: T('1 ມື້', '1 วัน'), sub: T('ຄົງເຫຼືອ', 'คงเหลือ'), rt: '40', bd: [T('ພ້ອມ', 'พร้อม')] },
          { t: 'item', id: 'o2', tg: 'on', title: T('7 ມື້', '7 วัน'), sub: T('ຄົງເຫຼືອ', 'คงเหลือ'), rt: '3', bd: [T('ໃກ້ໝົດ', 'ใกล้หมด'), 'wn'] },
          { t: 'item', id: 'o3', tg: 'on', title: T('30 ມື້', '30 วัน'), sub: T('ຄົງເຫຼືອ', 'คงเหลือ'), rt: '0', bd: [T('ໝົດ', 'หมด'), 'rd'] }] }] }],
      seq: [['w', 500], ['ck', 'p1'], ['sh', 'op'], ['w', 700], ['ck', 'o2'], ['w', 1100]]
    },
    { /* 2 เติมโค้ด */
      els: [{ t: 'tabs', id: 'tb', on: 0, items: [T('ເຕີມໂຄ້ດ', 'เติมโค้ด'), T('ຄັງໂຄ້ດ', 'คลังโค้ด'), T('ປະຫວັດ', 'ประวัติ')] },
        IN('cd', T('ໂຄ້ດທີ່ຈະເຕີມ (1 ແຖວ = 1 ໂຄ້ດ)', 'โค้ดที่จะเติม (1 บรรทัด = 1 โค้ด)'), T('ໃສ່ໂຄ້ດ (1 ແຖວ = 1 ໂຄ້ດ)', 'ใส่โค้ด (1 บรรทัด = 1 โค้ด)'), { area: 1 }),
        { t: 'r', wrap: 1, els: [B('pa', T('ວາງຈາກຄລິບບອດ', 'วางจากคลิปบอร์ด'), { v: 'gh' }), B('fi', T('ນຳເຂົ້າໄຟລ໌', 'นำเข้าไฟล์'), { v: 'gh' }), B('cl', T('ລ້າງ', 'ล้าง'), { v: 'gh' })] },
        B('go', T('ເຕີມໂຄ້ດ', 'เติมโค้ด'), { blk: 1 })],
      seq: [['w', 400], ['ty', 'cd', 'AAAA-1111\nBBBB-2222\nCCCC-3333', { sp: 34 }], ['w', 400], ['ck', 'go'], ['ts', T('ເຕີມສຳເລັດ +3 · ຂ້າມໂຄ້ດຊ້ຳ 0', 'เติมสำเร็จ +3 · ข้ามโค้ดซ้ำ 0')], ['w', 1000]]
    },
    { /* 3 คลังโค้ด */
      els: [{ t: 'tabs', id: 'tb', on: 1, items: [T('ເຕີມໂຄ້ດ', 'เติมโค้ด'), T('ຄັງໂຄ້ດ', 'คลังโค้ด'), T('ປະຫວັດ', 'ประวัติ')] },
        { t: 'list', els: [
          { t: 'item', id: 'c1', tg: 'sel', ck: 1, title: 'AAAA-1111', bd: [T('ພ້ອມຂາຍ', 'พร้อมขาย')] },
          { t: 'item', id: 'c2', tg: 'sel', ck: 1, title: 'BBBB-2222', bd: [T('ພ້ອມຂາຍ', 'พร้อมขาย')] },
          { t: 'item', id: 'c3', tg: 'sel', ck: 1, title: 'CCCC-3333', bd: [T('ຂາຍແລ້ວ', 'ขายแล้ว'), 'off'] }] },
        { t: 'r', wrap: 1, els: [B('al', T('ເລືອກທັງໝົດ', 'เลือกทั้งหมด'), { v: 'gh' }), B('cp', T('ຄັດລອກ', 'คัดลอก'), { v: 'gh' }), B('dl', T('ດາວໂຫຼດ .txt', 'ดาวน์โหลด .txt'), { v: 'gh' }), B('rm', T('ລຶບທີ່ເລືອກ', 'ลบที่เลือก'), { v: 'dg' })] }],
      seq: [['w', 400], ['ck', 'c1'], ['ck', 'c2'], ['w', 400], ['ck', 'cp'], ['ts', T('ຄັດລອກແລ້ວ ✓', 'คัดลอกแล้ว ✓')], ['w', 700], ['ck', 'dl'], ['ts', T('ກຳລັງດາວໂຫຼດ .txt ✓', 'กำลังดาวน์โหลด .txt ✓')], ['w', 1000]]
    },
    { /* 4 ประวัติ */
      els: [{ t: 'tabs', id: 'tb', on: 1, items: [T('ເຕີມໂຄ້ດ', 'เติมโค้ด'), T('ຄັງໂຄ້ດ', 'คลังโค้ด'), T('ປະຫວັດ', 'ประวัติ')] },
        { t: 'g', id: 'g1', x: 't', els: [{ t: 'list', els: [{ t: 'item', title: 'AAAA-1111', bd: [T('ພ້ອມຂາຍ', 'พร้อมขาย')] }, { t: 'item', title: 'BBBB-2222', bd: [T('ພ້ອມຂາຍ', 'พร้อมขาย')] }] }] },
        { t: 'g', id: 'g2', x: 't', h: 1, els: [{ t: 'list', els: [
          { t: 'item', th: 'dl', title: 'admin · +50', sub: '18/11 16:02 · Unban FiveM 7d', rt: '+50', bd: null },
          { t: 'item', th: 'dl', title: 'admin · +3', sub: '17/11 09:40 · Netflix Premium', rt: '+3' }] }] }],
      seq: [['w', 600], ['ck', 'tb2'], ['hd', 'g1'], ['sh', 'g2'], ['w', 1200]]
    }
  ];

  /* ───── 3 จัดการสมาชิก ───── */
  SCENES.members = [
    { els: [{ t: 'title', ic: 'user', lab: T('ສະຫຼຸບສະມາຊິກ', 'สรุปสมาชิก') }, { t: 'tiles', id: 's', items: [[T('ຜູ້ໃຊ້ທັງໝົດ', 'ผู้ใช้ทั้งหมด'), '128'], [T('ຜູ້ດູແລລະບົບ', 'ผู้ดูแลระบบ'), '2'], [T('ຜູ້ໃຊ້ທົ່ວໄປ', 'ผู้ใช้ทั่วไป'), '126'], [T('ຍອດເງິນລວມ', 'ยอดเงินรวม'), K + '24.5M', 'good']] }],
      seq: hlSeq('s', 4) },
    { els: [IN('q', null, T('ຄົ້ນຫາດ້ວຍ ຊື່ຜູ້ໃຊ້ ຫຼື ອີເມວ...', 'ค้นหาด้วย ชื่อผู้ใช้ หรือ อีเมล...')),
        { t: 'list', id: 'ul', els: [
          { t: 'item', av: 'S', title: 'somchai', k: 'somchai somchai@mail.com', sub: 'somchai@mail.com', rt: K + '150,000' },
          { t: 'item', av: 'A', title: 'admin01', k: 'admin01 admin@shop.la', sub: 'admin@shop.la', bd: [T('ຜູ້ດູແລ', 'ผู้ดูแล'), 'rd'] },
          { t: 'item', av: 'K', title: 'kham', k: 'kham kham@mail.com', sub: 'kham@mail.com', rt: K + '20,000' },
          { t: 'item', av: 'P', title: 'pete', k: 'pete pete@gmail.com', sub: 'pete@gmail.com', rt: K + '85,000' }] }],
      seq: [['w', 600], ['ty', 'q', 'pe', { f: 'ul', sp: 120 }], ['w', 1300]] },
    { els: [{ t: 'r', els: [{ t: 'title', ic: 'user', lab: T('ຜູ້ໃຊ້', 'ผู้ใช้') }, B('ad', T('+ ເພີ່ມຜູ້ໃຊ້ໃໝ່', '+ เพิ่มผู้ใช้ใหม่'))] },
        { t: 'g', id: 'fm', h: 1, card: 1, els: [IN('u', T('ຊື່ຜູ້ໃຊ້', 'ชื่อผู้ใช้'), 'username'), IN('e', T('ອີເມວ (ບໍ່ບັງຄັບ)', 'อีเมล (ไม่บังคับ)'), 'name@mail.com'), IN('p', T('ລະຫັດຜ່ານ', 'รหัสผ่าน'), '••••••', { pw: 1 }), B('go', T('ສ້າງຜູ້ໃຊ້', 'สร้างผู้ใช้'), { blk: 1 })] }],
      seq: [['w', 500], ['ck', 'ad'], ['sh', 'fm'], ['w', 400], ['ty', 'u', 'somchai'], ['ty', 'e', 'somchai@mail.com', { sp: 40 }], ['ty', 'p', 'pass1234'], ['ck', 'go'], ['ts', T('ສ້າງຜູ້ໃຊ້ແລ້ວ ✓', 'สร้างผู้ใช้แล้ว ✓')], ['w', 1000]] }
  ];

  /* ───── 4 ตัวแทนจำหน่าย ───── */
  SCENES.agents = [
    { els: [{ t: 'title', ic: 'key', lab: T('ສະຫຼຸບຕົວແທນ', 'สรุปตัวแทน') }, { t: 'tiles', id: 's', items: [[T('Key ທັງໝົດ', 'Key ทั้งหมด'), '24'], [T('ຕົວແທນທີ່ໃຊ້ງານ', 'ตัวแทนที่ใช้งาน'), '9', 'good'], [T('ສິນຄ້າທີ່ຕັ້ງລາຄາແລ້ວ', 'สินค้าที่ตั้งราคาแล้ว'), '15'], [T('ຍອດຂາຍຜ່ານຕົວແທນ', 'ยอดขายผ่านตัวแทน'), K + '6.2M', 'good']] }],
      seq: hlSeq('s', 4) },
    { els: [{ t: 'title', lab: T('ລາຄາສິນຄ້າຕົວແທນ', 'ราคาสินค้าตัวแทน') }, IN('q', null, T('ຄົ້ນຫາສິນຄ້າ', 'ค้นหาสินค้า')),
        { t: 'list', id: 'pl', els: [{ t: 'item', id: 'pr', tg: 'on', th: 'bag', k: 'unban fivem', title: 'Unban FiveM', sub: TS('ລາຄາປົກກະຕິ ', 'ราคาปกติ ', K + '60,000') },
          { t: 'item', th: 'bag', k: 'netflix premium', title: 'Netflix Premium', sub: TS('ລາຄາປົກກະຕິ ', 'ราคาปกติ ', K + '80,000') }] },
        IN('bp', T('ລາຄາເລີ່ມຕົ້ນ', 'ราคาเริ่มต้น'), '0', { num: 1 }), B('sv', T('ບັນທຶກລາຄາເລີ່ມຕົ້ນ', 'บันทึกราคาเริ่มต้น'), { blk: 1 })],
      seq: [['w', 400], ['ty', 'q', 'unban', { f: 'pl', sp: 90 }], ['ck', 'pr'], ['ty', 'bp', '45000'], ['ck', 'sv'], ['ts', T('ບັນທຶກລາຄາແລ້ວ ✓', 'บันทึกราคาแล้ว ✓')], ['w', 1000]] },
    { els: [{ t: 'r', els: [{ t: 'title', ic: 'key', lab: 'API Key' }, B('ad', T('+ ສ້າງ API Key ໃໝ່', '+ สร้าง API Key ใหม่'))] },
        { t: 'g', id: 'fm', h: 1, card: 1, els: [IN('nt', T('ຊື່/ໝາຍເຫດ (Note)', 'ชื่อ/หมายเหตุ (Note)'), T('ເຊັ່ນ ສາຍເຕີມ A', 'เช่น สายเติม A')),
          { t: 'r', els: [IN('cnt', T('ຈຳນວນ Key', 'จำนวน Key'), '1', { num: 1 }), IN('qt', T('ໂຄວຕາ/ອາທິດ', 'โควตา/สัปดาห์'), K, { num: 1 })] },
          B('go', T('+ ຢືນຢັນການສ້າງ API Key', '+ ยืนยันการสร้าง API Key'), { blk: 1 })] },
        { t: 'item', id: 'nk', h: 1, th: 'key', title: 'PXR-8F3K-Q2LM', sub: T('ສາຍເຕີມ A', 'สายเติม A'), bd: [T('ພ້ອມໃຊ້', 'พร้อมใช้')] }],
      seq: [['w', 500], ['ck', 'ad'], ['sh', 'fm'], ['w', 400], ['ty', 'nt', T('ສາຍເຕີມ A', 'สายเติม A')], ['ty', 'cnt', '1'], ['ty', 'qt', '500000'], ['ck', 'go'], ['ts', T('ສ້າງ API Key ສຳເລັດ ✓', 'สร้าง API Key สำเร็จ ✓')], ['sh', 'nk'], ['w', 1000]] },
    { els: [{ t: 'list', els: [
        { t: 'item', id: 'k1', th: 'key', title: 'PXR-8F3K-Q2LM', sub: TS('ສາຍເຕີມ A · ໂຄວຕ້າ ', 'สายเติม A · โควตา ', '500,000'), bd: [T('ໃຊ້ງານຢູ່', 'ใช้งานอยู่')], act: [{ t: 'ib', id: 'cp', ic: 'copy' }, { t: 'ib', id: 'tg', ic: 'power' }, { t: 'ib', id: 'dl', ic: 'trash', v: 'dg' }] },
        { t: 'item', id: 'k2', th: 'key', title: 'PXR-2D9A-77XP', sub: T('ສາຍເຕີມ B', 'สายเติม B'), bd: [T('ພ້ອມໃຊ້', 'พร้อมใช้')] }] },
        CONF('cf', T('ລຶບ API Key ນີ້ບໍ?', 'ลบ API Key นี้หรือไม่?'), T('ຍົກເລີກ', 'ยกเลิก'), T('ລຶບ', 'ลบ'))],
      seq: [['w', 500], ['ck', 'cp'], ['ts', T('ຄັດລອກ Key ແລ້ວ ✓', 'คัดลอก Key แล้ว ✓')], ['w', 500], ['ck', 'tg'], ['st', 'k1.b', T('ປິດແລ້ວ', 'ปิดแล้ว'), 'sm-bd off'], ['w', 600], ['ck', 'dl'], ['sh', 'cf'], ['w', 600], ['ck', 'cfy'], ['hd', 'cf'], ['dn', 'k1'], ['ts', T('ລຶບແລ້ວ ✓', 'ลบแล้ว ✓')], ['w', 900]] },
    { els: [{ t: 'item', id: 'ag', av: 'P', title: 'peter_shop', sub: T('3 ສິນຄ້າຕັ້ງລາຄາແລ້ວ', '3 สินค้าตั้งราคาแล้ว'), act: [B('mg', T('ຈັດການລາຄາ', 'จัดการราคา'), { v: 'gh' })] },
        { t: 'g', id: 'pn', h: 1, card: 1, els: [{ t: 'tgl', id: 'tg', lab: T('ໃຊ້ລາຄາກາງ (ລາຄາສິນຄ້າຕົວແທນ)', 'ใช้ราคากลาง (ราคาสินค้าตัวแทน)'), on: 0 },
          IN('p1', 'Unban FiveM', T('ໃຊ້ລາຄາເລີ່ມຕົ້ນ', 'ใช้ราคาเริ่มต้น'), { num: 1 }), B('sv', T('ບັນທຶກລາຄາ', 'บันทึกราคา'), { blk: 1 })] }],
      seq: [['w', 500], ['ck', 'mg'], ['sh', 'pn'], ['w', 500], ['ck', 'tg'], ['w', 900], ['ck', 'tg'], ['w', 500], ['ty', 'p1', '40000'], ['ck', 'sv'], ['ts', T('ບັນທຶກລາຄາແລ້ວ ✓', 'บันทึกราคาแล้ว ✓')], ['w', 1000]] }
  ];

  /* ───── 5 อนุมัติเติมเงิน ───── */
  var RQ = function (id, nm, amt, tm, act, h) { return { t: 'item', id: id, h: h, av: nm.charAt(0).toUpperCase(), title: nm, sub: tm, rt: K + amt, act: act }; };
  SCENES.topup = [
    { els: [{ t: 'tabs', id: 'tb', on: 1, items: [T('ລໍຖ້າ · 2', 'รอ · 2'), T('ອະນຸມັດແລ້ວ', 'อนุมัติแล้ว'), T('ປະຕິເສດ', 'ปฏิเสธ')] },
        { t: 'g', id: 'gd', x: 't', els: [{ t: 'list', els: [RQ('', 'pete', '85,000', '17/11 20:15'), RQ('', 'kham', '20,000', '17/11 18:02')] }] },
        { t: 'g', id: 'gp', x: 't', h: 1, els: [{ t: 'list', els: [RQ('rq1', 'somchai', '150,000', '18/11 16:02'), RQ('rq2', 'mali', '50,000', '18/11 15:48')] }] }],
      seq: [['w', 700], ['ck', 'tb0'], ['hd', 'gd'], ['sh', 'gp'], ['w', 600], ['mv', 'rq1'], ['w', 900]] },
    { els: [{ t: 'item', av: 'S', title: 'somchai', sub: '18/11 16:02', rt: K + '150,000', act: [B('vs', T('ເບິ່ງສະລິບ', 'ดูสลิป'), { v: 'gh', ic: 'eye' })] },
        { t: 'dlg', id: 'dl', els: [{ t: 'slip', id: 'sl', amt: K + '150,000', time: '18/11 16:02' }, { t: 'note', lab: T('ກວດ ຈຳນວນເງິນ ແລະ ເວລາ', 'ตรวจ จำนวนเงิน และ เวลา') }, B('xx', T('ປິດ ✕', 'ปิด ✕'), { v: 'gh', blk: 1 })] }],
      seq: [['w', 500], ['ck', 'vs'], ['sh', 'dl'], ['w', 700], ['cl', 'sla', 'hl2'], ['w', 900], ['cl', 'sla', 'hl2'], ['cl', 'slt', 'hl2'], ['w', 900], ['ck', 'xx'], ['hd', 'dl'], ['w', 700]] },
    { els: [{ t: 'list', els: [RQ('rq', 'somchai', '150,000', '18/11 16:02', [B('ap', T('ອະນຸມັດ', 'อนุมัติ'), { v: 'ok' }), B('rj', T('ປະຕິເສດ', 'ปฏิเสธ'), { v: 'dg' })])] },
        CONF('cf', T('ຢືນຢັນອະນຸມັດ ແລະ ເພີ່ມເງິນເຂົ້າບັນຊີສະມາຊິກ?', 'ยืนยันอนุมัติ และเพิ่มเงินเข้าบัญชีสมาชิก?'), T('ຍົກເລີກ', 'ยกเลิก'), T('ຢືນຢັນ', 'ยืนยัน'))],
      seq: [['w', 500], ['ck', 'ap'], ['sh', 'cf'], ['w', 700], ['ck', 'cfy'], ['hd', 'cf'], ['dn', 'rq'], ['ts', TS('ອະນຸມັດແລ້ວ · ຍອດໃໝ່ ', 'อนุมัติแล้ว · ยอดใหม่ ', K + '150,000')], ['w', 1000]] },
    { els: [{ t: 'title', ic: 'wallet', lab: T('ເຕີມເງິນໃຫ້ສະມາຊິກໂດຍກົງ', 'เติมเงินให้สมาชิกโดยตรง') }, IN('u', T('ຊື່ຜູ້ໃຊ້', 'ชื่อผู้ใช้'), 'username'), IN('a', T('ຈຳນວນເງິນ', 'จำนวนเงิน'), K, { num: 1 }), B('go', T('ເຕີມເງິນ', 'เติมเงิน'), { blk: 1 })],
      seq: [['w', 500], ['ty', 'u', 'somchai'], ['ty', 'a', '50000'], ['ck', 'go'], ['ts', TS('ເຕີມເງິນແລ້ວ · ຍອດໃໝ່ ', 'เติมเงินแล้ว · ยอดใหม่ ', K + '200,000')], ['w', 1000]] }
  ];

  /* ───── 6 QR ชำระเงิน ───── */
  SCENES.payment = [
    { els: [{ t: 'title', lab: T('ເພີ່ມ / ແກ້ໄຂ QR', 'เพิ่ม / แก้ไข QR') }, IN('bk', T('ທະນາຄານ', 'ธนาคาร'), T('ເຊັ່ນ BCEL One', 'เช่น BCEL One')),
        { t: 'up', id: 'qr', qr: 1, lab: T('ແຕະເພື່ອເລືອກຮູບ QR', 'แตะเพื่อเลือกรูป QR'), done: 'qr-bcel.png' },
        { t: 'r', els: [IN('ac', T('ເລກບັນຊີ', 'เลขบัญชี'), '010-12-00-…', { num: 1 }), IN('an', T('ຊື່ບັນຊີ', 'ชื่อบัญชี'), 'NAME')] },
        B('sv', T('ບັນທຶກ', 'บันทึก'), { blk: 1 }),
        { t: 'item', id: 'nq', h: 1, th: 'wallet', title: 'BCEL One', sub: 'SOMCHAI K. · 010-12-00-1234', bd: [T('ໃໝ່', 'ใหม่'), 'rd'] }],
      seq: [['w', 400], ['ty', 'bk', 'BCEL One'], ['ck', 'qr'], ['w', 400], ['ty', 'ac', '0101200123', { sp: 50 }], ['ty', 'an', 'SOMCHAI K.'], ['ck', 'sv'], ['ts', T('ບັນທຶກ QR ແລ້ວ ✓', 'บันทึก QR แล้ว ✓')], ['sh', 'nq'], ['w', 1000]] },
    { els: [{ t: 'item', id: 'q1', th: 'wallet', title: 'BCEL One', sub: 'SOMCHAI K.', act: [B('ed', T('ແກ້ໄຂ', 'แก้ไข'), { v: 'gh', ic: 'pencil' }), B('dl', T('ລຶບ', 'ลบ'), { v: 'dg', ic: 'trash' })] },
        { t: 'g', id: 'fm', h: 1, card: 1, els: [{ t: 'title', lab: T('ເພີ່ມ / ແກ້ໄຂ QR', 'เพิ่ม / แก้ไข QR') }, IN('bk', T('ທະນາຄານ', 'ธนาคาร'), '', { v: 'BCEL One' }), B('sv', T('ບັນທຶກ', 'บันทึก'), { blk: 1 })] },
        { t: 'note', id: 'em', h: 1, lab: T('ຍັງບໍ່ມີ QR', 'ยังไม่มี QR') },
        CONF('cf', T('ລຶບ QR ຂອງ BCEL One?', 'ลบ QR ของ BCEL One?'), T('ຍົກເລີກ', 'ยกเลิก'), T('ລຶບ', 'ลบ'))],
      seq: [['w', 500], ['ck', 'ed'], ['sh', 'fm'], ['w', 400], ['ty', 'bk', 'BCEL One 2'], ['ck', 'sv'], ['ts', T('ບັນທຶກແລ້ວ ✓', 'บันทึกแล้ว ✓')], ['hd', 'fm'], ['w', 400], ['ck', 'dl'], ['sh', 'cf'], ['w', 600], ['ck', 'cfy'], ['hd', 'cf'], ['dn', 'q1'], ['sh', 'em'], ['w', 1000]] }
  ];

  /* ───── 7 Webhook Discord ───── */
  SCENES.webhook = [
    { els: [{ t: 'title', lab: 'Discord' }, { t: 'list', els: [
        { t: 'item', id: 'm1', tg: 'on', title: T('ຕັ້ງຄ່າຊ່ອງ', 'ตั้งค่าช่อง'), rt: '›' }, { t: 'item', id: 'm2', tg: 'on', title: 'Integrations', rt: '›' }, { t: 'item', id: 'm3', tg: 'on', title: 'Webhooks', rt: '›' }] },
        { t: 'g', id: 'wh', h: 1, card: 1, els: [{ t: 'note', lab: 'Webhook URL' }, IN('u', null, '', { v: 'https://discord.com/api/webhooks/…' }), B('cp', 'Copy Webhook URL', { blk: 1, ic: 'copy' })] }],
      seq: [['w', 500], ['ck', 'm1'], ['ck', 'm2'], ['ck', 'm3'], ['sh', 'wh'], ['w', 500], ['ck', 'cp'], ['ts', T('ຄັດລອກ Webhook URL ແລ້ວ ✓', 'คัดลอก Webhook URL แล้ว ✓')], ['w', 1000]] },
    { els: [{ t: 'title', ic: 'bell', lab: T('ການຊື້ສິນຄ້າ', 'การซื้อสินค้า') }, IN('w1', T('ຊື້ສຳເລັດ (ແອດມິນ)', 'ซื้อสำเร็จ (แอดมิน)'), 'https://discord.com/api/webhooks/...'), IN('w2', T('ຊື້ສຳເລັດ (ລູກຄ້າ)', 'ซื้อสำเร็จ (ลูกค้า)'), 'https://discord.com/api/webhooks/...'), IN('w3', T('ສະຕັອກໃກ້ໝົດ', 'สต็อกใกล้หมด'), 'https://discord.com/api/webhooks/...'),
        { t: 'note', lab: T('ຊ່ອງທີ່ເວັ້ນວ່າງຈະບໍ່ສົ່ງແຈ້ງເຕືອນ', 'ช่องที่เว้นว่างจะไม่ส่งแจ้งเตือน') }],
      seq: [['w', 400], ['ty', 'w1', 'https://discord.com/api/webhooks/1234/abc', { sp: 24 }], ['ty', 'w2', 'https://discord.com/api/webhooks/5678/xyz', { sp: 24 }], ['mv', 'w3'], ['w', 1100]] },
    { els: [IN('th', T('ເກນສະຕັອກໃກ້ໝົດ (ຊິ້ນ)', 'เกณฑ์สต็อกใกล้หมด (ชิ้น)'), '10', { v: '10', num: 1 }),
        { t: 'item', th: 'bag', title: 'Unban FiveM', sub: T('ຄົງເຫຼືອ', 'คงเหลือ'), rt: '12', id: 'iv' },
        { t: 'dc', id: 'dc', h: 1, lab: T('⚠ ສະຕັອກໃກ້ໝົດ: Unban FiveM ເຫຼືອ 5 ຊິ້ນ', '⚠ สต็อกใกล้หมด: Unban FiveM เหลือ 5 ชิ้น') }],
      seq: [['w', 500], ['ty', 'th', '5'], ['w', 500], ['mv', 'iv.r'], ['st', 'iv.r', '5'], ['cl', 'iv.r', 'warnc'], ['w', 500], ['sh', 'dc'], ['w', 1300]] },
    { els: [{ t: 'list', els: [
        { t: 'item', title: T('ຊື້ສຳເລັດ (ແອດມິນ)', 'ซื้อสำเร็จ (แอดมิน)'), end: [B('t1', T('ທົດສອບ', 'ทดสอบ'), { v: 'gh' })] },
        { t: 'item', title: T('ເຕີມເງິນສຳເລັດ', 'เติมเงินสำเร็จ'), end: [B('t2', T('ທົດສອບ', 'ทดสอบ'), { v: 'gh' })] }] },
        B('all', T('ທົດສອບທຸກຊ່ອງທີ່ຕື່ມແລ້ວ', 'ทดสอบทุกช่องที่เติมแล้ว'), { blk: 1 }),
        { t: 'dc', id: 'dc', h: 1, lab: T('✅ ຂໍ້ຄວາມທົດສອບຈາກ ExShop', '✅ ข้อความทดสอบจาก ExShop') }],
      seq: [['w', 500], ['ck', 't1'], ['ts', T('ສົ່ງຂໍ້ຄວາມທົດສອບແລ້ວ ✓', 'ส่งข้อความทดสอบแล้ว ✓')], ['sh', 'dc'], ['w', 900], ['ck', 'all'], ['ts', T('ສົ່ງທຸກຊ່ອງແລ້ວ ✓', 'ส่งทุกช่องแล้ว ✓')], ['w', 1000]] },
    { els: [{ t: 'tiles', id: 's', items: [[T('ສະຫຼຸບຍອດສົ່ງເອງ', 'สรุปยอดส่งเอง'), '23:50'], [T('ຊ່ອງທີ່ຕື່ມແລ້ວ', 'ช่องที่เติมแล้ว'), '3 / 7']] },
        B('sv', T('ບັນທຶກການຕັ້ງຄ່າ', 'บันทึกการตั้งค่า'), { blk: 1 })],
      seq: [['w', 500], ['mv', 's0'], ['hl', 's0'], ['w', 800], ['ck', 'sv'], ['ts', T('ບັນທຶກການຕັ້ງຄ່າແລ້ວ ✓', 'บันทึกการตั้งค่าแล้ว ✓')], ['hl', 's1'], ['w', 1100]] }
  ];

  /* ───── 8 ตั้งค่าเว็บไซต์ ───── */
  SCENES.settings = [
    { els: [{ t: 'title', ic: 'chart', lab: T('ແພັກເກັດຮ້ານ', 'แพ็กเกจร้าน') }, { t: 'note', lab: T('ເຫຼືອເວລາອີກ 28 ວັນ 4 ຊົ່ວໂມງ', 'เหลือเวลาอีก 28 วัน 4 ชั่วโมง') }, { t: 'bar', id: 'br' }, B('rn', T('ຕໍ່ອາຍຸເວັບໄຊ', 'ต่ออายุเว็บไซต์'), { blk: 1 })],
      seq: [['w', 500], ['mv', 'br'], ['w', 900], ['ck', 'rn'], ['w', 1200]] },
    { els: [{ t: 'up', id: 'lg', lab: T('ໂລໂກ້', 'โลโก้'), done: 'logo.png' }, { t: 'sl', id: 'ls', lab: T('ຂະໜາດໂລໂກ້', 'ขนาดโลโก้'), val: 30 },
        { t: 'hdr', id: 'hd', lab: T('ຊື່ຮ້ານ', 'ชื่อร้าน') }, IN('sn', T('ຊື່ເວັບໄຊ (Site Name)', 'ชื่อเว็บไซต์ (Site Name)'), 'Site Name')],
      seq: [['w', 400], ['ck', 'lg'], ['w', 300], ['mv', 'ls'], ['sl', 'ls', 70, 'hd.l'], ['w', 800], ['ty', 'sn', 'AWANG SHOP', { m: 'hd.n' }], ['w', 1100]] },
    { els: [{ t: 'note', lab: T('ຟອນເວັບໄຊ · ປ່ຽນທຸກໜ້າຂອງຮ້ານ', 'ฟอนต์เว็บไซต์ · เปลี่ยนทุกหน้าของร้าน') },
        { t: 'fnt', id: 'f', sample: T('ສະບາຍດີ ABC 123', 'สบายดี ABC 123'), items: [['Noto Sans Lao', "'Noto Sans Lao Looped',sans-serif"], ['Outfit', "'Outfit',sans-serif"], ['Serif', 'Georgia,serif'], ['Mono', 'ui-monospace,Menlo,monospace']] },
        B('sv', T('ບັນທຶກ', 'บันทึก'), { blk: 1 })],
      seq: [['w', 500], ['ck', 'f1'], ['w', 500], ['ck', 'f2'], ['w', 500], ['ck', 'f3'], ['w', 400], ['ck', 'sv'], ['ts', T('ບັນທຶກຟອນແລ້ວ ✓', 'บันทึกฟอนต์แล้ว ✓')], ['w', 900]] },
    { els: [IN('an', T('ຂໍ້ຄວາມເລື່ອນດ້ານເທິງສຸດ', 'ข้อความเลื่อนด้านบนสุด'), T('ພິມຂໍ້ຄວາມປະກາດ...', 'พิมพ์ข้อความประกาศ...')), { t: 'sl', id: 'sp', lab: T('ຄວາມໄວການເລື່ອນ', 'ความเร็วการเลื่อน'), val: 25 },
        { t: 'note', lab: T('ຕົວຢ່າງ', 'ตัวอย่าง') }, { t: 'mq', id: 'mq', lab: '' }],
      seq: [['w', 400], ['ty', 'an', T('ຍິນດີຕ້ອນຮັບ! ສິນຄ້າໃໝ່ມາແລ້ວ', 'ยินดีต้อนรับ! สินค้าใหม่มาแล้ว'), { m: 'mq' }], ['mv', 'sp'], ['sl', 'sp', 75], ['w', 1500]] },
    { els: [{ t: 'note', lab: T('ເປັນຫຍັງຕ້ອງເລືອກເຮົາ · ການ໌ດທີ 1', 'ทำไมต้องเลือกเรา · การ์ดที่ 1') }, IN('ct', T('ຫົວຂໍ້', 'หัวข้อ'), T('ຫົວຂໍ້ການ໌ດ', 'หัวข้อการ์ด')), IN('cm', T('ຂໍ້ຄວາມ', 'ข้อความ'), T('ຂໍ້ຄວາມຍ່ອຍ', 'ข้อความย่อย')), { t: 'note', lab: T('ຕົວຢ່າງການ໌ດ', 'ตัวอย่างการ์ด') }, { t: 'cardpv', id: 'cp' }],
      seq: [['w', 400], ['ty', 'ct', T('ສົ່ງທັນທີ', 'ส่งทันที'), { m: 'cp.t' }], ['ty', 'cm', T('ໄດ້ໂຄ້ດພາຍໃນ 1 ນາທີ', 'ได้โค้ดภายใน 1 นาที'), { m: 'cp.m' }], ['w', 1200]] },
    { els: [{ t: 'note', lab: T('ເປັນຫຍັງຕ້ອງເລືອກເຮົາ · ແບບດີໄຊນ໌', 'ทำไมต้องเลือกเรา · แบบดีไซน์') },
        { t: 'chips', id: 'dz', on: 0, items: [T('ແບບ 1 · ເບລີສະຫຼັບ', 'แบบ 1 · เบลอสลับ'), T('ແບບ 2 · ການ໌ດຊ້ອນ', 'แบบ 2 · การ์ดซ้อน')] },
        { t: 'g', id: 'd1', card: 1, els: [{ t: 'title', ic: 'bag', lab: T('ປອດໄພ ວ່ອງໄວ', 'ปลอดภัย รวดเร็ว') }, { t: 'note', lab: T('ການ໌ດດຽວ ຂໍ້ຄວາມປ່ຽນວົນດ້ວຍເບລີ', 'การ์ดเดียว ข้อความเปลี่ยนวนด้วยเบลอ') }] },
        { t: 'g', id: 'd2', h: 1, els: [{ t: 'item', th: 'bag', title: T('ປອດໄພ ວ່ອງໄວ', 'ปลอดภัย รวดเร็ว') }, { t: 'item', th: 'user', title: T('ບໍລິການລູກຄ້າ', 'บริการลูกค้า') }] },
        B('sv', T('ບັນທຶກການຕັ້ງຄ່າ', 'บันทึกการตั้งค่า'), { blk: 1 })],
      seq: [['w', 500], ['ck', 'dz1'], ['hd', 'd1'], ['sh', 'd2'], ['w', 1000], ['ck', 'sv'], ['ts', T('ບັນທຶກສຳເລັດ ✓', 'บันทึกสำเร็จ ✓')], ['w', 1000]] },
    { els: [{ t: 'note', lab: T('ສິນຄ້າທີ່ຊື້ລ່າສຸດ (ແຖບເລື່ອນໜ້າຫຼັກ)', 'สินค้าที่ซื้อล่าสุด (แถบเลื่อนหน้าหลัก)') }, { t: 'sl', id: 'rs', lab: T('ຄວາມໄວການເລື່ອນ (ຊື້ລ່າສຸດ)', 'ความเร็วการเลื่อน (ซื้อล่าสุด)'), val: 30 },
        { t: 'note', lab: T('ຕົວຢ່າງການເລື່ອນ', 'ตัวอย่างการเลื่อน') }, { t: 'mq', id: 'mq', lab: T('ສົມ***  ຊື້ Unban FiveM  ·  ວັນ***  ຊື້ VIP Key', 'สม***  ซื้อ Unban FiveM  ·  วัน***  ซื้อ VIP Key') }],
      seq: [['w', 500], ['mv', 'rs'], ['sl', 'rs', 75], ['w', 1500]] },
    { els: [{ t: 'note', lab: T('ສີຫຼັກ (Theme Color)', 'สีหลัก (Theme Color)') }, { t: 'sws', id: 'sc', colors: ['#ff2d3d', '#2f80ed', '#2fbf71', '#f0a500', '#a855f7'] },
        IN('hx', null, '#ff2d3d', { v: '#ff2d3d' }), { t: 'note', lab: T('ໂໝດທີມ', 'โหมดธีม') }, { t: 'chips', id: 'cm', on: 0, items: [T('ສີດຽວ', 'สีเดียว'), T('ໄລ່ສີ', 'ไล่สี'), T('ແສງເຮືອງ', 'แสงเรือง')] }, { t: 'pv', id: 'pc', lab: T('ຕົວຢ່າງ', 'ตัวอย่าง') }],
      seq: [['w', 400], ['ck', 'sc1'], ['st', 'hx', '#2f80ed'], ['w', 500], ['ck', 'sc4'], ['st', 'hx', '#a855f7'], ['w', 500], ['ck', 'cm1'], ['w', 1100]] },
    { els: [{ t: 'g', card: 1, els: [{ t: 'title', lab: T('ປັບຮູບພໍດີອັດຕະໂນມັດ', 'ปรับรูปพอดีอัตโนมัติ') }, { t: 'tgl', id: 'fo', lab: T('ເປີດໃຊ້ງານ', 'เปิดใช้งาน') },
          { t: 'tgl', id: 'fp', lab: T('ສິນຄ້າ · ການ໌ດຍາວຕາມຮູບ', 'สินค้า · การ์ดยาวตามรูป') }, { t: 'tgl', id: 'fc', lab: T('ໝວດໝູ່ · ການ໌ດຍາວຕາມຮູບ', 'หมวดหมู่ · การ์ดยาวตามรูป') }] },
        { t: 'note', lab: T('ປິດ = ໃຊ້ສັດສ່ວນການ໌ດແບບເດີມ · ກົດບັນທຶກເພື່ອໃຊ້ຈິງ', 'ปิด = ใช้สัดส่วนการ์ดแบบเดิม · กดบันทึกเพื่อใช้จริง') }, B('sv', T('ບັນທຶກການຕັ້ງຄ່າ', 'บันทึกการตั้งค่า'), { blk: 1 })],
      seq: [['w', 500], ['ck', 'fo'], ['w', 300], ['ck', 'fp'], ['w', 300], ['ck', 'fc'], ['w', 400], ['ck', 'sv'], ['ts', T('ບັນທຶກສຳເລັດ ✓', 'บันทึกสำเร็จ ✓')], ['w', 1100]] },
    { els: [{ t: 'r', els: [{ t: 'title', lab: T('ຊ່ອງທາງຕິດຕໍ່', 'ช่องทางติดต่อ') }, B('ad', T('+ ເພີ່ມຊ່ອງທາງ', '+ เพิ่มช่องทาง'), { v: 'gh' })] },
        { t: 'g', id: 'fm', h: 1, card: 1, els: [{ t: 'sel', id: 'ty', lab: T('ປະເພດ', 'ประเภท'), ph: T('ເລືອກປະເພດ', 'เลือกประเภท'), opts: ['Facebook', 'WhatsApp', 'Telegram', 'Line'] }, IN('lk', null, T('ລິ້ງ ຫຼື ເບີ', 'ลิงก์ หรือ เบอร์')), IN('dn', null, T('ຊື່ທີ່ສະແດງ (ບໍ່ບັງຄັບ)', 'ชื่อที่แสดง (ไม่บังคับ)'))] },
        { t: 'item', id: 'nr', h: 1, th: 'user', title: T('ແອດມິນ 1', 'แอดมิน 1'), sub: 'Telegram · @awang_admin', act: [{ t: 'ib', id: 'nu', ic: 'up' }, { t: 'ib', id: 'nd', ic: 'down' }, { t: 'ib', id: 'nx', ic: 'trash', v: 'dg' }] }],
      seq: [['w', 400], ['ck', 'ad'], ['sh', 'fm'], ['w', 300], ['pk', 'ty', 2], ['ty', 'lk', '@awang_admin'], ['ty', 'dn', T('ແອດມິນ 1', 'แอดมิน 1')], ['sh', 'nr'], ['w', 500], ['pt', 'nu'], ['w', 500], ['pt', 'nd'], ['w', 900]] },
    { els: [{ t: 'r', els: [{ t: 'title', lab: T('ຮູບໂປຣໂມຊັນ', 'รูปโปรโมชัน') }, { t: 'note', id: 'pc', lab: '0 / 10' }] },
        { t: 'up', id: 'pu', lab: T('ເພີ່ມຮູບໂປຣໂມຊັນ', 'เพิ่มรูปโปรโมชัน'), done: 'promo-1.jpg' },
        { t: 'item', id: 'q1', h: 1, th: 'bag', title: '1  ·  promo-1.jpg', act: [{ t: 'ib', id: 'qu', ic: 'up' }, { t: 'ib', id: 'qd', ic: 'down' }, { t: 'ib', id: 'qx', ic: 'trash', v: 'dg' }] },
        { t: 'item', id: 'q2', h: 1, th: 'bag', title: '2  ·  promo-2.jpg', act: [{ t: 'ib', id: 'qu2', ic: 'up' }, { t: 'ib', id: 'qd2', ic: 'down' }, { t: 'ib', id: 'qx2', ic: 'trash', v: 'dg' }] }],
      seq: [['w', 400], ['ck', 'pu'], ['st', 'pc', '1 / 10'], ['sh', 'q1'], ['w', 500], ['sh', 'q2'], ['st', 'pc', '2 / 10'], ['w', 500], ['pt', 'qd'], ['w', 400], ['pt', 'qu2'], ['w', 900]] },
    { els: [{ t: 'note', lab: T('ບັນທຶກທຸກແທັບພ້ອມກັນ', 'บันทึกทุกแท็บพร้อมกัน') }, { t: 'chips', id: 'c', dot: 1, on: -1, items: [T('ຂໍ້ມູນພື້ນຖານ', 'ข้อมูลพื้นฐาน'), T('ຟອນ', 'ฟอนต์'), T('ສີ & ທີມ', 'สี & ธีม'), T('ຊ່ອງທາງ', 'ช่องทาง')] }, B('sv', T('ບັນທຶກການຕັ້ງຄ່າ', 'บันทึกการตั้งค่า'), { blk: 1 })],
      seq: [['w', 500], ['ck', 'sv'], ['w', 150], ['cl', 'c0', 'ok'], ['w', 200], ['cl', 'c1', 'ok'], ['w', 200], ['cl', 'c2', 'ok'], ['w', 200], ['cl', 'c3', 'ok'], ['ts', T('ບັນທຶກສຳເລັດ ✓', 'บันทึกสำเร็จ ✓')], ['w', 1100]] }
  ];

  /* ---------- เครื่องเล่นฉาก ---------- */
  function wait(I, ms, g) {
    return new Promise(function (res, rej) {
      if (I.fast) return I.gen !== g ? rej(STOP) : res();
      setTimeout(function () { I.gen !== g ? rej(STOP) : res(); }, ms);
    });
  }
  function q(I, id) { var e = I.p.querySelector('[data-id="' + id + '"]'); if (!e) errs.push(I.key + ': ไม่พบ ' + id); return e; }
  function sib(e, cls, on) { Array.prototype.forEach.call(e.parentNode.children, function (s) { if (s !== e) s.classList.remove(cls); }); if (on !== false) e.classList.add(cls); }

  function build(I) {
    var sc = I.sc, h = '<div class="sm-p">' + RL(sc.els) + '<div class="sm-ts"><span class="sm-toast" data-id="toast"></span></div></div>' + '<div class="sm-cur">' + CUR + '</div><span class="sm-rep">' + esc(tx(T('ພາບຈຳລອງ', 'ภาพจำลอง'))) + '</span>';
    I.el.innerHTML = h;
    I.p = I.el.querySelector('.sm-p'); I.c = I.el.querySelector('.sm-cur');
    measure(I);
    var r = I.el.getBoundingClientRect();
    I.c.style.transitionDuration = '0s';
    I.c.style.transform = 'translate(' + Math.max(30, r.width - 34) + 'px,' + Math.max(30, r.height - 22) + 'px)';
    void I.c.offsetWidth; I.c.style.transitionDuration = '';
  }
  /* วัดความสูงสูงสุดของฉาก (ทุกกลุ่มที่ซ่อนถูกเปิด · กลุ่มสลับกันนับเฉพาะอันที่สูงสุด) เพื่อไม่ให้หน้าขยับตอนเล่น */
  function measure(I) {
    var p = I.p; p.style.minHeight = '';
    if (I.sc.h) { p.style.minHeight = I.sc.h + 'px'; return; }
    var hid = p.querySelectorAll('[data-h]'), xs = p.querySelectorAll('[data-x]'), orig = [], keys = {}, base, tot, i, k;
    for (i = 0; i < xs.length; i++) { orig.push(xs[i].hasAttribute('data-h')); xs[i].setAttribute('data-h', '1'); keys[xs[i].dataset.x] = 1; }
    for (i = 0; i < hid.length; i++) if (!hid[i].dataset.x) hid[i].removeAttribute('data-h');
    base = p.offsetHeight; tot = base;
    for (k in keys) {
      var mx = 0, mem = p.querySelectorAll('[data-x="' + k + '"]');
      for (i = 0; i < mem.length; i++) { mem[i].removeAttribute('data-h'); mx = Math.max(mx, p.offsetHeight - base); mem[i].setAttribute('data-h', '1'); }
      tot += mx;
    }
    var sw = p.querySelectorAll('.sm-sw'), pr = p.getBoundingClientRect(), need = 0;
    for (i = 0; i < sw.length; i++) { sw[i].classList.add('open'); need = Math.max(need, sw[i].querySelector('.sm-menu').getBoundingClientRect().bottom - pr.top + 30); sw[i].classList.remove('open'); }
    for (i = 0; i < xs.length; i++) { if (orig[i]) xs[i].setAttribute('data-h', '1'); else xs[i].removeAttribute('data-h'); }
    for (i = 0; i < hid.length; i++) if (!hid[i].dataset.x) hid[i].setAttribute('data-h', '1');
    p.style.minHeight = Math.ceil(Math.max(tot, need)) + 'px';
  }

  function pos(I, e, fx, fy) {
    var d = I.el.getBoundingClientRect(), r = e.getBoundingClientRect();
    return [r.left - d.left + r.width * (fx == null ? .5 : fx), r.top - d.top + r.height * (fy == null ? .55 : fy)];
  }
  async function mv(I, e, g, fx, fy) {
    if (I.fast || !e || !e.offsetWidth) return;
    var pt = pos(I, e, fx, fy), m = /^matrix\(.*?,.*?,.*?,.*?,\s*([-\d.]+),\s*([-\d.]+)\)/.exec(getComputedStyle(I.c).transform) || [0, 0, 0],
      dist = Math.hypot(pt[0] - (+m[1] || 0), pt[1] - (+m[2] || 0)), ms = Math.max(420, Math.min(900, 300 + dist * 2.4));
    I.c.classList.add('vis');
    I.c.style.transitionDuration = ms + 'ms';
    I.c.style.transform = 'translate(' + pt[0].toFixed(1) + 'px,' + pt[1].toFixed(1) + 'px)';
    await wait(I, ms + 60, g);
  }
  async function tap(I, e, g) {
    if (!I.fast) {
      var pt = pos(I, e, null, null), rp = document.createElement('i');
      rp.className = 'sm-rp'; rp.style.left = pt[0] + 'px'; rp.style.top = pt[1] + 'px'; I.el.appendChild(rp); setTimeout(function () { rp.remove(); }, 600);
      I.c.classList.add('dn'); e.classList.add('press'); setTimeout(function () { e.classList.remove('press'); }, 230);
      await wait(I, 140, g); I.c.classList.remove('dn');
    }
    if (!e.classList.contains('sm-in')) Array.prototype.forEach.call(I.p.querySelectorAll('.sm-in.on'), function (f) { if (!f.classList.contains('sm-sel')) f.classList.remove('on'); });
  }
  function behave(I, e) {
    var c = e.classList;
    if (c.contains('sm-tab') || c.contains('sm-fnt')) sib(e, 'on');
    else if (c.contains('sm-chip')) { if (e.parentNode.children.length && !(e.querySelector('i'))) sib(e, 'on'); else c.toggle('on'); }
    else if (c.contains('sm-sw2')) { sib(e, 'on'); I.p.style.setProperty('--pc', e.dataset.c); }
    else if (c.contains('sm-tgl')) c.toggle('on');
    else if (c.contains('sm-up')) { c.add('ok'); var v = e.querySelector('.v'); if (v) v.textContent = e.dataset.done; }
    else if (c.contains('sm-row')) { if (e.dataset.tg === 'sel') c.toggle('sel'); else if (e.dataset.tg === 'on') sib(e, 'on'); }
    else if (e.dataset.cl) { var a = e.dataset.cl.split(' '), t = q(I, a[0]); if (t) t.classList.toggle(a[1]); c.toggle('on'); }
  }
  function show(I, e) { if (e.classList.contains('sm-dlg')) e.classList.add('sm-show'); else { e.removeAttribute('data-h'); e.classList.remove('sm-in-anim'); void e.offsetWidth; e.classList.add('sm-in-anim'); } }
  function hide(e) { if (e.classList.contains('sm-dlg')) e.classList.remove('sm-show'); else e.setAttribute('data-h', '1'); }
  function filt(I, lid, s) {
    var l = q(I, lid); if (!l) return; s = s.toLowerCase();
    Array.prototype.forEach.call(l.children, function (r) { r.classList.toggle('flt', !!s && (r.dataset.k || '').indexOf(s) < 0); });
  }

  async function act(I, a, g) {
    var op = a[0], e;
    switch (op) {
      case 'w': return wait(I, a[1], g);
      case 'mv': e = q(I, a[1]); return e && mv(I, e, g, e.classList.contains('sm-in') ? .3 : .5);
      case 'pt': e = q(I, a[1]); if (!e) return; await mv(I, e, g); e.classList.add('press'); setTimeout(function () { e.classList.remove('press'); }, 600); return wait(I, 300, g);
      case 'ck': e = q(I, a[1]); if (!e) return; await mv(I, e, g); await tap(I, e, g); behave(I, e); return wait(I, 150, g);
      case 'ty': return typeIn(I, a, g);
      case 'pk': return pick(I, a, g);
      case 'sh': a[1].split(' ').forEach(function (id) { var x = q(I, id); if (x) show(I, x); }); return wait(I, 350, g);
      case 'hd': a[1].split(' ').forEach(function (id) { var x = q(I, id); if (x) hide(x); }); return;
      case 'dn': e = q(I, a[1]); if (!e) return; if (e.classList.contains('sm-row')) e.classList.add('gone'); else e.style.opacity = '0'; await wait(I, 320, g); e.setAttribute('data-h', '1'); return;
      case 'ts': e = q(I, 'toast'); if (!e) return; e.textContent = tx(a[1]); e.classList.remove('bad'); void e.offsetWidth; e.classList.add('in'); clearTimeout(I.tt); I.tt = setTimeout(function () { e.classList.remove('in'); }, 2200); return wait(I, 500, g);
      case 'hl': e = q(I, a[1]); if (e) sib(e, 'hl'); return;
      case 'cl': e = q(I, a[1]); if (e) e.classList.toggle(a[2]); return;
      case 'st': e = q(I, a[1]); if (!e) return; { var v = e.querySelector('.v') || e; v.textContent = tx(a[2]); v.classList && v.classList.remove('ph'); } if (a[3]) e.className = a[3]; return;
      case 'sl': e = q(I, a[1]); if (!e) return; e.querySelector('i').style.width = a[2] + '%'; e.querySelector('u').style.left = a[2] + '%';
        if (a[3]) { var t = q(I, a[3]); if (t) t.style.transform = 'scale(' + (0.75 + a[2] / 100 * 0.6).toFixed(2) + ')'; } return wait(I, 700, g);
      case 'ft': return filt(I, a[1], a[2]);
      case 'hw': e = q(I, a[1]); if (!e) return; { var vv = e.querySelector('.v'), t2 = vv.textContent, w = tx(a[2]), ix = t2.indexOf(w); if (ix > -1) vv.innerHTML = esc(t2.slice(0, ix)) + '<b>' + esc(w) + '</b>' + esc(t2.slice(ix + w.length)); } return;
    }
  }
  async function typeIn(I, a, g) {
    var e = q(I, a[1]), o = a[3] || {}, text = tx(a[2]); if (!e) return;
    await mv(I, e, g, .3); await tap(I, e, g);
    Array.prototype.forEach.call(I.p.querySelectorAll('.sm-in.on'), function (f) { f.classList.remove('on'); });
    e.classList.add('on');
    var v = e.querySelector('.v'), pw = e.dataset.pw, mir = o.m && q(I, o.m), s = '', chars = Array.from(text), sp = o.sp || (chars.length > 22 ? 34 : 62);
    if (mir) mir = mir.querySelector('.v') || mir;
    v.classList.remove('ph'); v.textContent = ''; if (e.dataset.init) delete e.dataset.init;
    for (var i = 0; i < chars.length; i++) {
      s += chars[i]; v.textContent = pw ? new Array(s.length + 1).join('•') : s;
      if (mir) mir.textContent = s;
      if (o.f) filt(I, o.f, s);
      if (!I.fast) await wait(I, sp, g);
    }
    return wait(I, 250, g);
  }
  async function pick(I, a, g) {
    var e = q(I, a[1]); if (!e) return; var sw = e.parentNode, opts = sw.querySelectorAll('.sm-opt'), o = opts[a[2]];
    await mv(I, e, g, .4); await tap(I, e, g);
    sw.classList.add('open'); e.classList.add('open'); await wait(I, 480, g);
    await mv(I, o, g, .4); o.classList.add('h'); await wait(I, 280, g); await tap(I, o, g);
    var v = e.querySelector('.v'); v.textContent = o.textContent; v.classList.remove('ph');
    Array.prototype.forEach.call(opts, function (x) { x.classList.remove('cur', 'h'); }); o.classList.add('cur');
    sw.classList.remove('open'); e.classList.remove('open');
    return wait(I, 300, g);
  }

  async function runOnce(I, g) {
    build(I);
    if (!I.fast) { await wait(I, 120, g); I.c.classList.add('vis'); }
    for (var i = 0; i < I.sc.seq.length; i++) await act(I, I.sc.seq[i], g);
    if (!I.fast) { await wait(I, 1900, g); I.c.classList.remove('vis'); await wait(I, 450, g); }
  }
  function play(I) {
    var g = ++I.gen;
    (async function () {
      try {
        if (RM) { I.fast = true; await runOnce(I, g); return; }
        I.fast = false;
        while (I.gen === g) await runOnce(I, g);
      } catch (e) { if (e !== STOP) { errs.push(I.key + ': ' + (e && e.message || e)); if (window.console) console.error(e); } }
    })();
  }
  function halt(I) { I.gen++; }

  /* ---------- เชื่อมกับหน้าคู่มือ ---------- */
  var API = {
    scenes: SCENES, errs: errs,
    has: function (id, j) { return !!(SCENES[id] && SCENES[id][j]); },
    html: function (id, j) { return '<div class="gx-demo gx-sim" data-sim="' + id + ':' + j + '" aria-hidden="true"></div>'; },
    stopAll: function () { insts.forEach(halt); insts = []; if (io) { io.disconnect(); io = null; } },
    mount: function (root, lang) {
      API.stopAll(); LANG = lang || 0;
      if ('IntersectionObserver' in window) io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { var I = en.target._sim; if (!I) return; if (en.isIntersecting) { if (!I.on) { I.on = true; play(I); } } else if (I.on) { I.on = false; halt(I); } });
      }, { threshold: .4 });
      Array.prototype.forEach.call(root.querySelectorAll('.gx-sim'), function (el) {
        var k = el.dataset.sim.split(':'), sc = SCENES[k[0]] && SCENES[k[0]][+k[1]]; if (!sc) return;
        var I = { el: el, sc: sc, key: el.dataset.sim, gen: 0, on: false }; el._sim = I; insts.push(I);
        el.addEventListener('click', function () { if (I.on || !io) { I.on = true; play(I); } });
        if (io) io.observe(el); else { I.on = true; play(I); }
      });
    },
    /* ใช้ทดสอบ: เล่นแบบเร็วจนจบแล้วค้างภาพสุดท้าย */
    runFast: async function (el, id, j, lang) {
      LANG = lang || 0; var I = { el: el, sc: SCENES[id][j], key: id + ':' + j, gen: 1, fast: true };
      await runOnce(I, 1); return I;
    }
  };
  window.GXSIM = API;
})();
