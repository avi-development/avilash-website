/* ═══════════════════════════════════════════════════════════
   A+ Marketing — admin-loader.js
   Hook for future Firestore-backed lead form.
   Today it does nothing visible — but once a contact form
   is dropped into /contact/ (with the data-attribute markup
   below), this loader will POST submissions into the same
   `leads` collection Traxncargo and Boutera write to, via
   the cargologic super-admin pipeline.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Future endpoint — wired into the cargologic Cloud Function
  // that already accepts leads from traxncargo.com and boutera.com.
  // Brand tag separates this stream in the super-admin inbox.
  var LEADS_ENDPOINT = '/api/leads'; // TODO: swap to absolute URL when API is hosted
  var BRAND_TAG = 'aplus-marketing';

  function findForm() {
    // Form must have data-aplus-leadform="1" to opt in.
    return document.querySelector('form[data-aplus-leadform]');
  }

  function wireForm(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var data = Object.fromEntries(new FormData(form).entries());
      data.brand = BRAND_TAG;
      data.source = location.pathname;
      data.submittedAt = new Date().toISOString();

      if (btn) { btn.disabled = true; btn.dataset.origLabel = btn.textContent; btn.textContent = 'Sending…'; }

      fetch(LEADS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          form.innerHTML = '<div class="lead-success">Got it — Avilash will reply within a working day. Thanks!</div>';
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.origLabel || 'Try again'; }
          var err = form.querySelector('[data-lead-error]');
          if (err) { err.textContent = 'Something went wrong. WhatsApp +91 7718 569 194 instead.'; err.style.display = 'block'; }
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = findForm();
    if (form) wireForm(form);
  });
})();
