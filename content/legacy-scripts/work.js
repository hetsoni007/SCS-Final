
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});

/* ---------- Interactive device simulator (tap/click through real screens) ---------- */
document.querySelectorAll('.sim').forEach(function (sim) {
  var frame = sim.querySelector('.sim-frame');
  var screens = Array.prototype.slice.call(sim.querySelectorAll('.sim-screen'));
  var dotsWrap = sim.querySelector('.sim-dots');
  var cap = sim.querySelector('.sim-cap');
  var idx = 0;
  if (!screens.length) return;

  screens.forEach(function (s, i) {
    var d = document.createElement('button');
    d.className = 'sim-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Show screen ' + (i + 1));
    d.addEventListener('click', function (e) { e.stopPropagation(); go(i); });
    dotsWrap.appendChild(d);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function go(i) {
    idx = (i + screens.length) % screens.length;
    screens.forEach(function (s, j) { s.classList.toggle('active', j === idx); });
    dots.forEach(function (d, j) { d.classList.toggle('active', j === idx); });
    cap.style.opacity = 0;
    setTimeout(function () { cap.textContent = screens[idx].getAttribute('data-cap') || ''; cap.style.opacity = 1; }, 120);
    if (window.scsTrack) window.scsTrack('portfolio_sim_view', { screen: screens[idx].getAttribute('data-cap') || '' });
  }
  go(0);
  sim.__go = go;
  sim.__count = screens.length;

  sim.querySelectorAll('.sim-tap span').forEach(function (half) {
    half.addEventListener('click', function () { go(idx + parseInt(half.getAttribute('data-dir'), 10)); });
  });

  // swipe support
  var startX = null;
  frame.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  frame.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });
});

/* ---------- Pinned scroll-through demo (Pillo-style): sim pins in place while its
   case-study section scrolls past, screens auto-advance with scroll progress.
   Desktop-only (>980px); manual tap/dot/swipe on the sim still works between scrolls. ---------- */
if (typeof gsap !== 'undefined' && window.ScrollTrigger && innerWidth > 980 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.case').forEach(function (article) {
    var sim = article.querySelector('.sim');
    var visual = article.querySelector('.case-visual');
    if (!sim || !visual || !sim.__count || sim.__count < 2) return;
    ScrollTrigger.create({
      trigger: article,
      start: 'top top+=110',
      end: 'bottom bottom-=110',
      pin: visual,
      pinSpacing: false,
      scrub: 0.6,
      onUpdate: function (self) {
        var i = Math.min(sim.__count - 1, Math.floor(self.progress * sim.__count));
        sim.__go(i);
      }
    });
  });
  ScrollTrigger.refresh();
}

/* ---------- Healthcare Staffing Platform flow-diagram tabs ---------- */
document.querySelectorAll('.flow-tabs').forEach(function (tabs) {
  var track = tabs.nextElementSibling;
  tabs.querySelectorAll('.flow-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.querySelectorAll('.flow-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var which = tab.getAttribute('data-tab');
      track.classList.remove('show-mobile', 'show-web');
      track.classList.add('show-' + which);
    });
  });
});
