/* Cookie consent: analytics (GA4) loads only after the visitor accepts. */
(function () {
  var KEY = 'veld-consent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function clearGA() {
    var host = location.hostname.split('.');
    var domains = ['', location.hostname, '.' + location.hostname];
    if (host.length > 2) domains.push('.' + host.slice(-2).join('.'));
    else domains.push('.' + location.hostname);
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n === '_ga' || n.indexOf('_ga_') === 0 || n === '_gid' || n.indexOf('_gat') === 0) {
        domains.forEach(function (d) {
          document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }
  var banner;
  function status() {
    var v = get(), txt = v === 'granted' ? 'Accepted' : v === 'denied' ? 'Declined' : 'Not set';
    document.querySelectorAll('[data-consent-status]').forEach(function (el) { el.textContent = txt; });
  }
  function close() { if (banner) { banner.classList.remove('is-open'); var b = banner; banner = null; setTimeout(function () { b.remove(); }, 400); } }
  function accept() { set('granted'); if (window.veldLoadGA) window.veldLoadGA(); status(); close(); }
  function decline() {
    var was = get() === 'granted';
    set('denied'); clearGA();
    if (window.gtag) gtag('consent', 'update', { analytics_storage: 'denied' });
    if (was && window.__gaLoaded) window.__gaLoaded = false;
    status(); close();
  }
  function open() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p class="cookie-text">We use analytics cookies to see how this site is used and to improve it. Nothing is set unless you accept. <a href="/privacy/">Privacy &amp; Cookies</a></p>' +
      '<div class="cookie-actions"><button type="button" class="cookie-btn cookie-btn-ghost" data-act="decline">Decline</button>' +
      '<button type="button" class="cookie-btn cookie-btn-primary" data-act="accept">Accept</button></div>';
    banner.querySelector('[data-act="accept"]').addEventListener('click', accept);
    banner.querySelector('[data-act="decline"]').addEventListener('click', decline);
    document.body.appendChild(banner);
    requestAnimationFrame(function () { requestAnimationFrame(function () { banner && banner.classList.add('is-open'); }); });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); open(); return; }
    var s = e.target.closest && e.target.closest('[data-consent-set]');
    if (s) { e.preventDefault(); s.getAttribute('data-consent-set') === 'granted' ? accept() : decline(); }
  });
  status();
  if (!get()) setTimeout(open, 600);
})();
