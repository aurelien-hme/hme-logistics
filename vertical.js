/* JS minimal des pages verticales : nav, menu mobile, apparition au scroll. */
(function () {
  var nav = document.getElementById('nav');
  var burger = document.getElementById('navBurger');
  var mobile = document.getElementById('navMobile');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
  if (burger && mobile) {
    burger.addEventListener('click', function () { mobile.classList.toggle('open'); });
    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mobile.classList.remove('open'); });
    });
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    if (el.closest('.hero')) el.classList.add('revealed'); else obs.observe(el);
  });
})();
