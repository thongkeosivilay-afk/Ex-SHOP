/* ตัวสำรองของเอฟเฟกต์ Soft blur สำหรับเบราว์เซอร์ที่ยังไม่รองรับ View Transitions
   (เบราว์เซอร์ที่รองรับ ใช้ transition.css ทำให้เองทุกครั้งที่เปลี่ยนหน้า) · exGo('หน้า.html') ใช้เปลี่ยนหน้าได้เหมือนกัน */
(function () {
  if (window.__exTr) return; window.__exTr = 1;
  var de = document.documentElement;
  var native = 'PageRevealEvent' in window;           // รองรับ cross-document view transitions
  window.exGo = function (url) { location.href = url; };
  if (native) return;

  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduce || !de.animate) return;
  var EASE = 'cubic-bezier(.4,0,.2,1)', busy = false;

  /* เข้าหน้าใหม่: เริ่มโปร่ง+เบลอ แล้วชัดขึ้น */
  function intro() {
    var a = de.animate([{ opacity: 0, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: 600, easing: EASE, fill: 'both' });
    a.pause(); a.currentTime = 0;
    var go = function () { if (go.d) return; go.d = 1; a.play(); a.onfinish = a.oncancel = function () { try { a.cancel(); } catch (e) {} }; };
    if (document.readyState !== 'loading') go(); else document.addEventListener('DOMContentLoaded', go);
    setTimeout(go, 1200);
  }
  intro();
  window.addEventListener('pageshow', function (e) { if (e.persisted) { busy = false; intro(); } });

  /* ออกจากหน้า: เบลอ+จางลง แล้วค่อยไปหน้าถัดไป */
  function out(url) {
    if (busy) return; busy = true;
    var a = de.animate([{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(14px)' }], { duration: 380, easing: EASE, fill: 'forwards' });
    var go = function () { location.href = url; };
    a.onfinish = go; setTimeout(go, 600);
  }
  window.exGo = out;

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var raw = a.getAttribute('href') || '';
    if (!raw || raw[0] === '#' || /^(javascript|mailto|tel|sms):/i.test(raw)) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
    e.preventDefault(); out(u.href);
  });
})();
