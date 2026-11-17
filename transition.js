/* เอฟเฟกต์เปลี่ยนหน้าแบบ Signal Glitch (RGB แยก + ฉีกเป็นแถบ + สแกนไลน์)
   ใส่ <script src="transition.js"></script> ใน <head> ของทุกหน้า · เรียกใช้เองได้ด้วย exGo('categories.html') */
(function () {
  if (window.__exTr) return; window.__exTr = 1;
  var de = document.documentElement, KEY = 'exGlitch', NS = 'http://www.w3.org/2000/svg';
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var flagged = false; try { var f = +sessionStorage.getItem(KEY); flagged = f && Date.now() - f < 6000; sessionStorage.removeItem(KEY); } catch (e) {}
  var setFlag = function () { try { sessionStorage.setItem(KEY, Date.now()); } catch (e) {} };

  var ov, svg, T, D, R, C, busy = false;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  function build() {
    if (svg) return;
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
    svg.innerHTML = '<filter id="exGl" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
      '<feTurbulence id="exGlT" type="fractalNoise" baseFrequency="0 0.045" numOctaves="1" seed="1" result="n"/>' +
      '<feColorMatrix in="n" type="matrix" values="1 0 0 0 0  0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 1" result="m"/>' +
      '<feDisplacementMap id="exGlD" in="SourceGraphic" in2="m" scale="0" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>' +
      '<feOffset id="exGlR" in="r" dx="0" dy="0" result="r2"/>' +
      '<feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="c"/>' +
      '<feOffset id="exGlC" in="c" dx="0" dy="0" result="c2"/>' +
      '<feBlend in="r2" in2="c2" mode="screen"/></filter>';
    de.appendChild(svg);
    T = svg.querySelector('#exGlT'); D = svg.querySelector('#exGlD'); R = svg.querySelector('#exGlR'); C = svg.querySelector('#exGlC');
  }
  function overlay(opaque) {
    if (ov) return ov;
    ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483646;pointer-events:none;overflow:hidden;background:' + (opaque ? '#050304' : 'transparent') +
      ';-webkit-transform:translateZ(0)';
    var sc = document.createElement('div');
    sc.style.cssText = 'position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.3) 0 1px,transparent 1px 3px)';
    ov.appendChild(sc); de.appendChild(ov); return ov;
  }
  function bars(n) {
    if (!ov) return;
    while (ov.children.length > 1) ov.removeChild(ov.lastChild);
    for (var i = 0; i < n; i++) {
      var b = document.createElement('div'), red = Math.random() > .5;
      b.style.cssText = 'position:absolute;left:0;right:0;mix-blend-mode:screen;top:' + rnd(0, 100) + '%;height:' + rnd(2, 12) + 'px;background:' + (red ? 'rgba(255,40,70,.9)' : 'rgba(0,225,255,.75)') + ';transform:translateX(' + rnd(-40, 40) + 'px)';
      ov.appendChild(b);
    }
  }
  function frame(amp) {
    D.setAttribute('scale', amp.toFixed(1));
    var s = amp * .14 * (Math.random() > .5 ? 1 : -1);
    R.setAttribute('dx', s.toFixed(1)); C.setAttribute('dx', (-s).toFixed(1));
    T.setAttribute('seed', Math.floor(rnd(1, 999)));
    T.setAttribute('baseFrequency', '0 ' + rnd(.015, .075).toFixed(3));
  }
  function run(dur, from, to, onStep) {
    return new Promise(function (res) {
      var t0 = performance.now(), last = -99;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        if (now - last > 48 || p === 1) {
          last = now; var amp = from + (to - from) * p;
          frame(amp); bars(amp > 4 ? 3 : 0); if (onStep) onStep(p);
        }
        p < 1 ? requestAnimationFrame(tick) : res();
      })(t0);
    });
  }
  function clean() {
    de.style.filter = ''; busy = false;
    if (ov) { ov.remove(); ov = null; }
    if (svg) { svg.remove(); svg = null; }
  }

  /* ออกจากหน้า */
  async function out(url) {
    if (busy) return; busy = true;
    build(); overlay(false); de.style.filter = 'url(#exGl)';
    await run(360, 6, 46);
    ov.style.background = '#fff'; await new Promise(function (r) { setTimeout(r, 55); });
    ov.style.background = '#050304'; bars(0);
    setFlag(); location.href = url;
  }
  window.exGo = function (url) { if (reduce) { location.href = url; return; } out(url); };

  /* เข้าหน้าใหม่ */
  if (flagged && !reduce) {
    build(); overlay(true); busy = true;
    var started = false, start = async function () {
      if (started) return; started = true;
      await new Promise(function (r) { setTimeout(r, 60); });
      de.style.filter = 'url(#exGl)';
      ov.style.background = '#fff'; await new Promise(function (r) { setTimeout(r, 45); });
      ov.style.background = 'transparent';
      await run(420, 46, 0);
      clean();
    };
    if (document.readyState !== 'loading') start(); else document.addEventListener('DOMContentLoaded', start);
    setTimeout(start, 1500); setTimeout(function () { if (ov) clean(); }, 3500);
  }
  window.addEventListener('beforeunload', setFlag);
  window.addEventListener('pageshow', function (e) { if (e.persisted) clean(); });

  /* ดักลิงก์ภายในเว็บ */
  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var raw = a.getAttribute('href') || '';
    if (!raw || raw[0] === '#' || /^(javascript|mailto|tel|sms):/i.test(raw)) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
    e.preventDefault(); out(u.href);
  });
})();
