/* getner.ai — first-touch UTM + referrer + landing-page capture.
   Persists in localStorage so the original source survives multi-page sessions.
   On every form load, populates hidden inputs named:
     utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page
*/
(function () {
  var STORAGE_KEY = 'getner_first_touch_v1';
  var FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'referrer', 'landing_page'];

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* private mode / blocked */ }
  }

  function readCurrent() {
    var params;
    try { params = new URLSearchParams(window.location.search); }
    catch (e) { params = { get: function () { return ''; } }; }
    return {
      utm_source:   params.get('utm_source')   || '',
      utm_medium:   params.get('utm_medium')   || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term:     params.get('utm_term')     || '',
      utm_content:  params.get('utm_content')  || '',
      referrer:     document.referrer          || '',
      landing_page: window.location.pathname   || '/'
    };
  }

  function getOrSetFirstTouch() {
    var stored = safeGet(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { /* corrupt — overwrite */ }
    }
    var data = readCurrent();
    safeSet(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  function populateForms(data) {
    var forms = document.querySelectorAll('form');
    for (var i = 0; i < forms.length; i++) {
      for (var j = 0; j < FIELDS.length; j++) {
        var name = FIELDS[j];
        var input = forms[i].querySelector('input[name="' + name + '"]');
        if (input) input.value = data[name] || '';
      }
    }
  }

  // Expose for forms that submit via fetch (e.g., ai-terminal-leads).
  window.getnerFirstTouch = function () { return getOrSetFirstTouch(); };

  var data = getOrSetFirstTouch();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { populateForms(data); });
  } else {
    populateForms(data);
  }
})();
