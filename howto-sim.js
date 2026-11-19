/* howto-sim.js — ภาพจำลองเล่นเองสำหรับหน้า "ວິທີການສັ່ງຊື້" (ใช้เอนจิน guide-sim.js)
   SCENES: GXSIM.scenes[idคู่มือ][ลำดับขั้นตอนเริ่มที่ 0]  (ขั้นที่ไม่มีฉาก = ไม่แสดงภาพ) · ข้อความเป็นภาษาลาว */
(function () {
  'use strict';
  if (!window.GXSIM) return;
  var S = GXSIM.scenes, K = '₭ ';
  function B(id, lab, o) { var r = { t: 'btn', id: id, lab: lab }; for (var k in o) r[k] = o[k]; return r; }
  function IN(id, lab, ph, o) { var r = { t: 'in', id: id, lab: lab, ph: ph }; for (var k in o) r[k] = o[k]; return r; }
  function TT(ic, lab) { return { t: 'title', ic: ic, lab: lab }; }
  var BANKS = ['BCEL', 'LDB', 'JDB', 'APB', 'STB'];

  /* ───── ວິທີສັ່ງຊື້ ───── */
  S.buy = [];
  S.buy[1] = { els: [{ t: 'r', els: [TT('bag', 'ExShop'), { t: 'ib', id: 'av', ic: 'user' }] },
      { t: 'g', id: 'm', h: 1, card: 1, els: [{ t: 'note', lab: 'ຍອດຄົງເຫຼືອ' }, { t: 'title', ic: 'wallet', lab: K + '120,000' }, B('tp', '+ ເຕີມເງິນ', { v: 'gh' })] }],
    seq: [['w', 500], ['ck', 'av'], ['sh', 'm'], ['w', 400], ['pt', 'm'], ['w', 1100]] };
  S.buy[2] = { els: [{ t: 'chips', id: 'c', on: 0, items: ['Game', 'Streaming', 'ID Game'] },
      { t: 'list', els: [{ t: 'item', id: 'p1', tg: 'on', th: 'bag', title: 'Unban FiveM', sub: K + '15,000' }, { t: 'item', id: 'p2', tg: 'on', th: 'bag', title: 'Netflix Premium', sub: K + '45,000' }] }],
    seq: [['w', 500], ['ck', 'c1'], ['w', 400], ['ck', 'c0'], ['w', 300], ['ck', 'p1'], ['w', 1000]] };
  S.buy[3] = { els: [{ t: 'item', th: 'bag', title: 'Unban FiveM', sub: K + '15,000', bd: ['ມີສະຕັອກ'] }, B('by', 'ຊື້', { blk: 1 }),
      { t: 'g', id: 'cf', h: 1, card: 1, els: [TT('check', 'ຢືນຢັນການສັ່ງຊື້')] }],
    seq: [['w', 500], ['ck', 'by'], ['sh', 'cf'], ['ts', 'ໄປໜ້າຢືນຢັນການສັ່ງຊື້'], ['w', 900]] };
  S.buy[4] = { els: [{ t: 'sel', id: 'o', lab: 'ຕົວເລືອກ', ph: 'ເລືອກຕົວເລືອກ', opts: ['1 ວັນ · ' + K + '5,000', '7 ວັນ · ' + K + '25,000', '30 ວັນ · ' + K + '80,000'] }, { t: 'note', id: 'sk', lab: 'ເຫຼືອ 12 ຊິ້ນ' }],
    seq: [['w', 500], ['pk', 'o', 1], ['w', 900]] };
  S.buy[5] = { els: [{ t: 'note', lab: 'ຈຳນວນ' }, { t: 'r', els: [{ t: 'ib', id: 'mn', txt: '−' }, { t: 'note', id: 'q', lab: '1' }, { t: 'ib', id: 'pl', txt: '+' }] },
      { t: 'item', th: 'wallet', title: 'ຍອດລວມ', rt: K + '25,000', id: 't' }],
    seq: [['w', 500], ['ck', 'pl'], ['st', 'q', '2'], ['st', 't.r', K + '50,000'], ['w', 300], ['ck', 'pl'], ['st', 'q', '3'], ['st', 't.r', K + '75,000'], ['w', 300], ['ck', 'mn'], ['st', 'q', '2'], ['st', 't.r', K + '50,000'], ['w', 900]] };
  S.buy[6] = { els: [{ t: 'r', els: [IN('cd', 'ໂຄ້ດສ່ວນຫຼຸດ', 'ພິມໂຄ້ດ'), B('ap', 'ໃຊ້')] },
      { t: 'g', id: 'ds', h: 1, els: [{ t: 'note', lab: 'ຫຼຸດ -' + K + '5,000' }] }, { t: 'item', th: 'wallet', title: 'ຍອດຊຳລະ', rt: K + '50,000', id: 't' }],
    seq: [['w', 400], ['ty', 'cd', 'WELCOME10'], ['ck', 'ap'], ['sh', 'ds'], ['st', 't.r', K + '45,000'], ['ts', 'ໃຊ້ໂຄ້ດສຳເລັດ ✓'], ['w', 900]] };
  S.buy[7] = { els: [{ t: 'item', th: 'bag', title: 'Unban FiveM × 2', sub: '7 ວັນ', rt: K + '45,000' }, { t: 'note', lab: 'ກວດສອບໃຫ້ຖືກຕ້ອງກ່ອນກົດ' }, B('cf', 'ຢືນຢັນຊື້', { blk: 1 })],
    seq: [['w', 600], ['pt', 'cf'], ['ck', 'cf'], ['ts', 'ຊື້ສຳເລັດ ຫັກເງິນແລ້ວ ✓'], ['w', 900]] };
  S.buy[8] = { els: [{ t: 'note', lab: 'ຄຳສັ່ງຊື້ #10482' }, { t: 'item', th: 'key', title: 'XXXX-4F2A-9B7C', sub: 'ຄີທີ 1', act: [{ t: 'ib', id: 'cp', ic: 'copy' }, { t: 'ib', id: 'sv', ic: 'dl' }] }],
    seq: [['w', 500], ['ck', 'cp'], ['ts', 'ຄັດລອກແລ້ວ ✓'], ['w', 400], ['ck', 'sv'], ['ts', 'ບັນທຶກເປັນ .txt ✓'], ['w', 900]] };
  S.buy[9] = { els: [TT('bag', 'ປະຫວັດ'), { t: 'list', els: [{ t: 'item', id: 'h1', tg: 'on', th: 'bag', title: 'Unban FiveM', sub: '#10482', bd: ['ສຳເລັດ'] }, { t: 'item', id: 'h2', tg: 'on', th: 'bag', title: 'Netflix', sub: '#10311', bd: ['ສຳເລັດ'] }] }],
    seq: [['w', 500], ['ck', 'h1'], ['w', 500], ['ck', 'h2'], ['w', 900]] };

  /* ───── ວິທີເຕີມເງິນ ───── */
  S.topup = [];
  S.topup[1] = { els: [TT('wallet', 'ເລືອກທະນາຄານ'), { t: 'list', els: BANKS.slice(0, 4).map(function (b, i) { return { t: 'item', id: 'b' + i, tg: 'on', th: 'wallet', title: b }; }) }],
    seq: [['w', 500], ['ck', 'b2'], ['w', 400], ['ck', 'b0'], ['w', 900]] };
  S.topup[2] = { els: [{ t: 'chips', id: 'a', on: -1, items: ['10,000', '50,000', '100,000', '200,000'] }, IN('am', 'ຫຼື ພິມຈຳນວນເອງ', K + '10,000 – 50,000,000', { num: 1 }), B('go', 'ດຳເນີນການ', { blk: 1 })],
    seq: [['w', 500], ['ck', 'a1'], ['w', 400], ['ty', 'am', '75000'], ['w', 400], ['ck', 'go'], ['w', 900]] };
  S.topup[3] = { els: [B('go', 'ດຳເນີນການ', { blk: 1 }), { t: 'g', id: 'qr', h: 1, card: 1, els: [{ t: 'up', id: 'q', qr: 1, lab: 'ສະແກນ QR', done: 'ສະແກນ QR' }, { t: 'note', id: 'tm', lab: 'ໝົດອາຍຸໃນ 00:30' }] }],
    seq: [['w', 500], ['ck', 'go'], ['sh', 'qr'], ['w', 700], ['st', 'tm', 'ໝົດອາຍຸໃນ 00:18'], ['w', 700], ['st', 'tm', 'ໝົດອາຍຸໃນ 00:06'], ['w', 800]] };
  S.topup[4] = { els: [{ t: 'list', els: [{ t: 'item', id: 's1', tg: 'sel', ck: 1, title: 'ເປີດແອັບທະນາຄານ' }, { t: 'item', id: 's2', tg: 'sel', ck: 1, title: 'ສະແກນ QR' }, { t: 'item', id: 's3', tg: 'sel', ck: 1, title: 'ກວດຍອດ ແລ້ວຢືນຢັນ', sub: K + '75,000' }] }],
    seq: [['w', 500], ['ck', 's1'], ['ck', 's2'], ['ck', 's3'], ['ts', 'ໂອນສຳເລັດ ✓'], ['w', 900]] };
  S.topup[5] = { els: [{ t: 'up', id: 'sl', lab: 'ແນບສະລິບການໂອນ', done: 'slip.jpg' }, { t: 'g', id: 'sp', h: 1, els: [{ t: 'slip', id: 'sa', amt: K + '75,000', time: '19/11/2026 13:05' }] }],
    seq: [['w', 500], ['ck', 'sl'], ['sh', 'sp'], ['w', 1200]] };
  S.topup[6] = { els: [{ t: 'slip', id: 'sa', amt: K + '75,000', time: '19/11/2026 13:05' }, B('sd', 'ສົ່ງສະລິບ', { blk: 1 }), { t: 'g', id: 'ck', h: 1, card: 1, els: [{ t: 'note', lab: 'ກຳລັງກວດສອບສະລິບຂອງທ່ານ' }, { t: 'bar', id: 'br' }] }],
    seq: [['w', 500], ['ck', 'sd'], ['sh', 'ck'], ['w', 1200]] };
  S.topup[7] = { els: [{ t: 'item', id: 'st', th: 'wallet', title: 'ເຕີມເງິນ ' + K + '75,000', sub: 'ລໍຖ້າແອດມິນກວດ', bd: ['ລໍຖ້າກວດສອບ', 'wn'] }, { t: 'item', id: 'bl', th: 'wallet', title: 'ຍອດຄົງເຫຼືອ', rt: K + '120,000' }],
    seq: [['w', 800], ['st', 'st.b', 'ສຳເລັດ', 'sm-bd'], ['st', 'bl.r', K + '195,000'], ['ts', 'ເງິນເຂົ້າບັນຊີແລ້ວ ✓'], ['w', 1000]] };
  S.topup[8] = { els: [{ t: 'list', els: [{ t: 'item', id: 'x0', title: K + '50,000', sub: '18/11', bd: ['ສຳເລັດ'] }, { t: 'item', id: 'x1', title: K + '75,000', sub: '19/11', bd: ['ລໍຖ້າກວດສອບ', 'wn'] }, { t: 'item', id: 'x2', title: K + '20,000', sub: '17/11', bd: ['ບໍ່ຜ່ານ', 'rd'] }] }],
    seq: [['w', 400], ['pt', 'x0'], ['pt', 'x1'], ['pt', 'x2'], ['w', 1000]] };

  /* ───── ວິທີເຂົ້າສູ່ລະບົບ ───── */
  S.login = [];
  S.login[0] = { els: [{ t: 'r', els: [TT('bag', 'ExShop'), B('lg', 'ເຂົ້າສູ່ລະບົບ')] }, { t: 'g', id: 'f', h: 1, card: 1, els: [TT('user', 'ເຂົ້າສູ່ລະບົບ'), IN('u', 'ຊື່ຜູ້ໃຊ້', '')] }],
    seq: [['w', 500], ['ck', 'lg'], ['sh', 'f'], ['w', 1100]] };
  S.login[1] = { els: [IN('u', 'ຊື່ຜູ້ໃຊ້', 'ຊື່ຜູ້ໃຊ້ຂອງທ່ານ'), IN('p', 'ລະຫັດຜ່ານ', '••••••', { pw: 1 })], seq: [['w', 500], ['ty', 'u', 'somchai99'], ['w', 900]] };
  S.login[2] = { els: [IN('u', 'ຊື່ຜູ້ໃຊ້', '', { v: 'somchai99' }), { t: 'r', els: [IN('p', 'ລະຫັດຜ່ານ', 'ລະຫັດຜ່ານ', { pw: 1 }), { t: 'ib', id: 'ey', ic: 'eye' }] }],
    seq: [['w', 500], ['ty', 'p', 'mypass123'], ['w', 300], ['ck', 'ey'], ['st', 'p', 'mypass123'], ['w', 1000]] };
  S.login[3] = { els: [{ t: 'tgl', id: 'rm', lab: 'ຈື່ບັນຊີນີ້' }, { t: 'note', lab: 'ໃຊ້ເຄື່ອງຕົນເອງເທົ່ານັ້ນ' }], seq: [['w', 600], ['ck', 'rm'], ['w', 1100]] };
  S.login[4] = { els: [{ t: 'r', els: [TT('bag', 'ExShop'), { t: 'g', id: 'a', h: 1, els: [{ t: 'ib', ic: 'user' }] }, B('lg', 'ເຂົ້າສູ່ລະບົບ')] }, B('go', 'ເຂົ້າສູ່ລະບົບ', { blk: 1 })],
    seq: [['w', 500], ['ck', 'go'], ['ts', 'ເຂົ້າສູ່ລະບົບສຳເລັດ ✓'], ['hd', 'lg'], ['sh', 'a'], ['w', 1100]] };
  S.login[5] = { els: [{ t: 'ib', id: 'av', ic: 'user' }, { t: 'g', id: 'm', h: 1, card: 1, els: [{ t: 'item', title: 'somchai99', sub: 'ຍອດຄົງເຫຼືອ ' + K + '120,000' }, { t: 'item', th: 'wallet', title: 'ເຕີມເງິນ' }, { t: 'item', th: 'bag', title: 'ປະຫວັດ' }, { t: 'item', th: 'user', title: 'ໂປຣໄຟລ໌' }] }],
    seq: [['w', 500], ['ck', 'av'], ['sh', 'm'], ['w', 1300]] };

  /* ───── ວິທີສະໝັກສະມາຊິກ ───── */
  S.register = [];
  S.register[0] = { els: [{ t: 'tabs', id: 't', items: ['ເຂົ້າສູ່ລະບົບ', 'ສະໝັກສະມາຊິກ'], on: 0 }, { t: 'note', lab: 'ກົດແຖບ “ສະໝັກສະມາຊິກ”' }], seq: [['w', 600], ['ck', 't1'], ['w', 1200]] };
  S.register[1] = { els: [IN('u', 'ຊື່ຜູ້ໃຊ້', 'ພິມຊື່ຜູ້ໃຊ້'), { t: 'note', id: 'ok', lab: 'ໃຊ້ຕົວອັກສອນອັງກິດ ແລະຕົວເລກ' }], seq: [['w', 500], ['ty', 'u', 'somchai99'], ['st', 'ok', 'ຊື່ນີ້ໃຊ້ໄດ້ ✓'], ['w', 1000]] };
  S.register[2] = { els: [IN('e', 'ອີເມວ (ບໍ່ບັງຄັບ)', 'name@example.com')], seq: [['w', 500], ['ty', 'e', 'somchai@gmail.com'], ['w', 1000]] };
  S.register[3] = { els: [{ t: 'r', els: [IN('p', 'ລະຫັດຜ່ານ (ຢ່າງໜ້ອຍ 6 ຕົວ)', 'ລະຫັດຜ່ານ', { pw: 1 }), { t: 'ib', id: 'ey', ic: 'eye' }] }],
    seq: [['w', 500], ['ty', 'p', 'mypass123'], ['ck', 'ey'], ['st', 'p', 'mypass123'], ['w', 1000]] };
  S.register[4] = { els: [IN('c', 'ຢືນຢັນລະຫັດຜ່ານ', 'ພິມລະຫັດເດີມອີກຄັ້ງ', { pw: 1 }), { t: 'note', id: 'ok', lab: '' }],
    seq: [['w', 500], ['ty', 'c', 'mypass12'], ['st', 'ok', 'ລະຫັດຜ່ານບໍ່ກົງກັນ'], ['w', 700], ['ty', 'c', 'mypass123'], ['st', 'ok', 'ກົງກັນ ✓'], ['w', 900]] };
  S.register[5] = { els: [B('go', 'ສະໝັກ', { blk: 1 }), { t: 'g', id: 'a', h: 1, card: 1, els: [{ t: 'item', th: 'user', title: 'somchai99', sub: 'ເຂົ້າສູ່ລະບົບແລ້ວ · ' + K + '0' }] }],
    seq: [['w', 500], ['ck', 'go'], ['ts', 'ສະໝັກສຳເລັດ ✓'], ['sh', 'a'], ['w', 1200]] };
  S.register[6] = { els: [{ t: 'tiles', id: 's', cols: 3, items: [['ຍອດເງິນ', K + '0'], ['ເຕີມເງິນ', '→'], ['ຊື້ສິນຄ້າ', '→']] }], seq: [['w', 400], ['hl', 's0'], ['w', 700], ['hl', 's1'], ['w', 700], ['hl', 's2'], ['w', 900]] };
})();
