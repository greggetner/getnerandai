/* Shared platform toggle (ActiveCampaign | Klaviyo).
   Swaps copy/placeholders/hrefs marked with data-plat / data-plat-ph /
   data-plat-href, remembers the choice, and stays in sync across pages
   via localStorage. Safe to include on any page; no-ops if nothing matches. */
(function () {
  function init() {
    var sw = document.querySelector('.platform-switch');
    var swappable = document.querySelectorAll('[data-plat]');
    var phs = document.querySelectorAll('[data-plat-ph]');
    var hrefs = document.querySelectorAll('[data-plat-href]');
    var cards = document.querySelectorAll('[data-plat-card]');
    if (!sw && !swappable.length && !phs.length && !hrefs.length && !cards.length) return;

    function apply(key) {
      if (key !== 'klaviyo') key = 'ac';
      if (sw) {
        sw.querySelectorAll('button').forEach(function (b) {
          var on = b.getAttribute('data-platform') === key;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }
      swappable.forEach(function (el) {
        var v = el.getAttribute('data-' + key);
        if (v !== null) el.textContent = v;
      });
      phs.forEach(function (el) {
        var v = el.getAttribute('data-' + key);
        if (v !== null) el.setAttribute('placeholder', v);
      });
      hrefs.forEach(function (el) {
        var v = el.getAttribute('data-' + key);
        if (v !== null) el.setAttribute('href', v);
      });
      cards.forEach(function (el) {
        var v = el.getAttribute('data-plat-card');
        el.style.display = (v === 'both' || v === key) ? '' : 'none';
      });
      try { localStorage.setItem('getner-platform', key); } catch (e) {}
    }

    if (sw) {
      sw.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-platform]');
        if (!btn) return;
        apply(btn.getAttribute('data-platform'));
      });
    }

    var saved;
    try { saved = localStorage.getItem('getner-platform'); } catch (e) {}
    apply(saved === 'klaviyo' ? 'klaviyo' : 'ac');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
