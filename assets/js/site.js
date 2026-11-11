/* ZIUSS Energy & Power — interactions */
(function () {
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ----- header: solid on scroll, mobile menu ----- */
  var hdr = doc.querySelector('.hdr');
  var onScroll = function () { hdr.classList.toggle('is-stuck', window.scrollY > 24); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var burger = doc.querySelector('.burger');
  var setMenu = function (open) {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  $('.mnav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1000) setMenu(false); });

  /* ----- headline word split ----- */
  $('[data-split]').forEach(function (el) {
    var i = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          // keep hyphenated words breakable: "Mission-" / "Critical"
          n.textContent.split(/(\s+)/).forEach(function (chunk) {
            if (!chunk) return;
            if (/^\s+$/.test(chunk)) { frag.appendChild(doc.createTextNode(' ')); return; }
            chunk.split(/(?<=-)/).forEach(function (part) {
              var w = doc.createElement('span'); w.className = 'w';
              var wi = doc.createElement('span'); wi.className = 'wi';
              wi.style.setProperty('--i', i++);
              wi.textContent = part;
              w.appendChild(wi); frag.appendChild(w);
            });
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') { walk(n); }
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
  });

  /* ----- stagger helpers ----- */
  $('[data-stagger]').forEach(function (group) {
    $('[data-reveal]', group).forEach(function (el, i) { el.style.setProperty('--d', i); });
  });

  /* ----- count up ----- */
  var fmt = new Intl.NumberFormat('en-US');
  var countUp = function (el) {
    var to = parseFloat(el.dataset.count), t0 = null, dur = 1600;
    if (reduce) { el.textContent = fmt.format(to); return; }
    var tick = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt.format(Math.round(to * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ----- reveal on scroll ----- */
  var show = function (el) {
    el.classList.add('in');
    $('[data-count]', el).concat(el.matches('[data-count]') ? [el] : []).forEach(countUp);
    if (el.hasAttribute('data-reveal')) {
      var d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      setTimeout(function () { el.classList.add('done'); }, 1200 + d * 90);
    }
  };
  var targets = $('[data-reveal],[data-split],[data-watch]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(show);
  }

  /* ----- poster tilt ----- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $('[data-tilt]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry-t', (x * 9).toFixed(2) + 'deg');
        el.style.setProperty('--rx-t', (-y * 9).toFixed(2) + 'deg');
      });
      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--ry-t', '0deg'); el.style.setProperty('--rx-t', '0deg');
      });
    });

    /* ----- photo band parallax ----- */
    var bands = $('.band img');
    if (bands.length) {
      var par = function () {
        bands.forEach(function (img) {
          var r = img.parentNode.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
          var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
          img.style.setProperty('--py', (p * -7).toFixed(2) + '%');
        });
      };
      par();
      window.addEventListener('scroll', par, { passive: true });
    }
  }

  /* ----- fuel savings calculator ----- */
  $('[data-calc]').forEach(function (box) {
    var range = box.querySelector('input[type=range]');
    var out = function (k) { return box.querySelector('[data-o="' + k + '"]'); };
    var compact = new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 });
    var naira = function (n) { return '₦' + compact.format(n); };
    var render = function () {
      var v = +range.value, min = +range.min, max = +range.max;
      range.style.setProperty('--p', ((v - min) / (max - min) * 100) + '%');
      out('spend').textContent = '₦' + fmt.format(v);
      out('lo-m').textContent = naira(v * 0.3);
      out('lo-y').textContent = naira(v * 0.3 * 12) + ' a year';
      out('hi-m').textContent = naira(v * 0.6);
      out('hi-y').textContent = naira(v * 0.6 * 12) + ' a year';
    };
    range.addEventListener('input', render);
    render();
  });

  /* ----- audit form -----
     Set data-endpoint on the <form> to POST submissions as JSON.
     With no endpoint, the request is handed to the visitor's email app. */
  $('form[data-audit]').forEach(function (form) {
    var msg = form.querySelector('.form__msg');
    var check = function (field) {
      var wrap = field.closest('.f'); if (!wrap) return true;
      var ok = field.checkValidity();
      wrap.classList.toggle('is-bad', !ok);
      return ok;
    };
    $('input,select', form).forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.f').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = $('input,select', form);
      var bad = fields.filter(function (f) { return !check(f); });
      if (bad.length) { bad[0].focus(); return; }
      var data = {};
      fields.forEach(function (f) { data[f.name] = f.value.trim(); });
      var say = function (text) { msg.textContent = text; msg.classList.add('is-on'); };
      var endpoint = form.dataset.endpoint;
      if (endpoint) {
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); say('Thank you. Your audit request has been received and an engineer will be in touch.'); })
          .catch(function () { say('We could not send your request. Please call our 24/7 desk or email contact@ziusspowerng.com.'); });
      } else {
        var body = [
          'Full name: ' + data.name, 'Work email: ' + data.email, 'Phone number: ' + data.phone,
          'Facility type: ' + data.facility, 'Estimated power requirement: ' + data.power
        ].join('\n');
        window.location.href = 'mailto:contact@ziusspowerng.com?subject=' +
          encodeURIComponent('On-site energy audit request') + '&body=' + encodeURIComponent(body);
        say('Your email app has opened with your request filled in. Press send there to complete it.');
      }
    });
  });
})();
