/* No jumps on load: keep the page hidden for the split second until the layout below is built
   (a timer shows it anyway if anything goes wrong) */
document.documentElement.classList.add('apple-pending');
var applePendingTimer = setTimeout(function () { document.documentElement.classList.remove('apple-pending'); }, 1500);
/* Android: Google Sans instead of the Apple system font (same as the User Guide) */
if (/Android/i.test(navigator.userAgent)) {
  document.documentElement.classList.add('android');
  if (!document.querySelector('link[href*="Google+Sans"]')) { /* the page may already load it */
  var gs = document.createElement('link');
  gs.rel = 'stylesheet';
  gs.href = 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(gs);
  }
}
/* Apple look helpers (apple.css). Design only. */
document.addEventListener('DOMContentLoaded', function () {
  try {
  var page = location.pathname.split('/').pop() || 'index.html';
  document.body.classList.add('page-' + page.replace('.html', '')); /* for page-specific touches in apple.css */

  /* Help and policy pages get Apple Support's quieter type (apple.css body.is-doc) */
  if (/support|privacy|404/.test(page)) document.body.classList.add('is-doc');

  /* Product bar under the site menu, like apple.com: product name, its sections, blue Download pill */
  var navLinks = document.querySelector('.site-nav-links');
  var label = navLinks && navLinks.querySelector('.site-nav-menu-label');
  if (label && label.textContent.trim() !== 'This website') {
    var bar = document.createElement('div');
    bar.className = 'local-nav';
    var name = document.createElement('a');
    name.className = 'local-nav-name';
    name.textContent = label.textContent.trim();
    var links = document.createElement('div');
    links.className = 'local-nav-links';
    for (var el = label.nextElementSibling; el && !el.classList.contains('site-nav-menu-label'); el = el.nextElementSibling) {
      if (el.tagName !== 'A') continue;
      if (!name.getAttribute('href')) name.href = el.getAttribute('href').split('#')[0];
      links.appendChild(el.cloneNode(true));
      el.classList.add('is-section'); /* shown in the product bar instead (computers) */
    }
    bar.appendChild(name);
    bar.appendChild(links);
    var get = document.querySelector('.download-options a:not([aria-disabled="true"])');
    if (get) {
      var pill = document.createElement('a');
      pill.className = 'local-nav-buy';
      pill.href = get.href;
      if (get.target) { pill.target = get.target; pill.rel = 'noopener'; }
      pill.textContent = 'Download';
      links.appendChild(pill);
    }
    document.querySelector('nav.site-nav').insertAdjacentElement('afterend', bar);
    document.body.classList.add('has-local-nav');
  }

  /* ---------- Product pages, built like the home page cards ---------- */
  var STORE_ICONS = { lemon: '<svg class="lemon-mark" viewBox="0 0 32 32" aria-hidden="true"><path fill="#FFC233" d="M15.2 15.6C14 12.2 10.4 8.2 10.5 6.1c.1-2.1 1.8-3.4 4-3.1 2.8.3 4.4 2.7 3.6 5.3l-2.9 7.3Z"/><path fill="#FFC233" d="M16.5 16.5c1.8-3.3 3.8-8.2 5.8-9.1 2-.9 4.1.2 4.7 2.3.8 2.7-.8 5-3.4 5.8l-7.1 1Z"/><path fill="#FFC233" d="M16.7 17.6c3.5-.9 8.7-2.2 10.5-.9 1.8 1.2 1.8 3.7.4 5.4-1.8 2.1-4.5 2.1-6.3.4l-4.6-4.9Z"/><path fill="#FFC233" d="M15.7 18.7c1.8 3.2 4.5 7.7 3.7 9.7-.8 2-3 2.8-5 1.9-2.6-1.1-3.5-3.7-2.2-6.1l3.5-5.5Z"/></svg>', appstore: '<svg class="appstore-mark" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="5.4" fill="#1A8CFF"/><g fill="none" stroke="#FFFFFF" stroke-width="1.7" stroke-linecap="round"><path d="M8 17.4 13.1 8.5"/><path d="M16 17.4 10.9 8.5"/><path d="M6.4 14.6h11.2"/></g></svg>' };
  var FACTS = {
    maceq: [['eq-curve', 'Every app', 'One EQ for every app on your Mac'], ['shield', 'No driver', 'Uses Apple’s built-in audio tap'], ['spatial', 'Spatial audio', 'Spatial effects and built-in presets']],
    keyboards: [['quick-actions', '⌘ + K anywhere', 'Press ⌘ + K from any app'], ['apps', '200+ shortcuts', '200+ shortcuts in 14 categories'], ['shield', 'Private', 'Never reads what you type']],
    upscape: [['fidelity', 'Up to 4x', 'Upscale images up to 4x'], ['preset', '6 AI models', 'Six specialized AI models'], ['shield', 'No uploads', 'Nothing is ever uploaded']],
    distributionapp: [['apps', 'All in one place', 'Orders, deliveries and payments in one place'], ['save', 'On your computer', 'Your data stays on your own computer'], ['balance', 'No per-user fees', 'One flat price, no per-user fees']]
  };
  var appKey = page.replace('.html', '');
  /* product pages redesigned in the macEQ style (hero, gallery, full grids) */
  var IS_PRODUCT = ['maceq', 'keyboards', 'distributionapp', 'upscape'].indexOf(appKey) > -1;
  if (IS_PRODUCT) document.body.classList.add('is-product');
  /* same store icons, in the same order, as the home page cards */
  var STORES = { maceq: ['lemon', 'appstore'], keyboards: ['appstore', 'lemon'], upscape: ['appstore', 'lemon'] };
  if (FACTS[appKey] && !document.querySelector('.lineup')) {
    /* hero and closing buy areas: where to get it, then a blue Download pill (the store badges become icons) */
    document.querySelectorAll('.download-options').forEach(function (opts) {
      var lemon = opts.querySelector('.lemon-badge'), gh = opts.querySelector('.gh-badge'), store = opts.querySelector('.badge');
      var buy = document.createElement('div');
      buy.className = 'hero-buy';
      var line = document.createElement('p');
      line.className = 'hero-stores';
      if (gh) line.textContent = 'Free trial · Mac and Windows';
      else line.innerHTML = '<span>Available from</span>' + (STORES[appKey] || []).map(function (k) { return STORE_ICONS[k]; }).join('');
      var act = document.createElement('p');
      act.className = 'hero-actions';
      var main = gh || lemon;
      if (main) {
        var get = document.createElement('a');
        get.className = 'hero-get';
        get.href = main.href;
        get.target = '_blank';
        get.rel = 'noopener';
        get.textContent = gh ? 'Free Trial' : 'Download';
        act.appendChild(get);
      }
      if (IS_PRODUCT && !opts.classList.contains('guide-download') && document.getElementById('features')) {
        var more = document.createElement('a');
        more.className = 'hero-more';
        more.href = '#features';
        more.textContent = 'See features ›';
        act.appendChild(more);
      }
      buy.appendChild(line);
      buy.appendChild(act);
      opts.replaceWith(buy);
    });
    /* the same three key facts as the home page, as an icon table under the hero */
    var req = document.querySelector('body > .requirements');
    if (req) {
      var facts = document.createElement('ul');
      facts.className = 'hero-facts';
      FACTS[appKey].forEach(function (f) {
        var li = document.createElement('li');
        li.title = f[2];
        li.innerHTML = '<img class="fact-icon" src="Assets/Symbols/' + f[0] + '.png" width="28" height="28" alt=""><span class="fact-label">' + f[1] + '</span><span class="fact-text visually-hidden">' + f[2] + '</span>';
        facts.appendChild(li);
      });
      req.insertAdjacentElement('afterend', facts);
    }
  }

  /* Site menu lists every product, like Apple's global nav (the current product lives in the product bar) */
  if (navLinks) {
    var have = {};
    navLinks.querySelectorAll('a').forEach(function (l) { have[(l.getAttribute('href') || '').split('#')[0]] = true; });
    [['macEQ', 'maceq.html'], ['KeyboardS', 'keyboards.html'], ['Upscape', 'upscape.html'], ['Distribution App', 'distributionapp.html']].forEach(function (p) {
      if (have[p[1]]) return;
      var a = document.createElement('a');
      a.href = p[1];
      a.textContent = p[0];
      navLinks.appendChild(a);
    });
  }

  /* Apple never badges an app icon: the platform chip becomes the small line above the headline */
  var chip = document.querySelector('.logo-lockup .platform-badge');
  var h1 = document.querySelector('h1');
  if (chip) {
    if (!document.querySelector('.eyebrow') && h1) {
      var eyebrow = document.createElement('p');
      eyebrow.className = 'eyebrow is-quiet';
      eyebrow.textContent = chip.getAttribute('aria-label') || chip.textContent.trim();
      h1.parentNode.insertBefore(eyebrow, h1);
    }
    chip.remove();
  }

  /* Footer: a row of site links above the fine print */
  var foot = document.querySelector('body > footer, article > .author-signoff');
  if (foot) {
    var row = document.createElement('nav');
    row.className = 'footer-links';
    row.setAttribute('aria-label', 'Site');
    [['Home', 'index.html'], ['macEQ', 'maceq.html'], ['KeyboardS', 'keyboards.html'], ['Upscape', 'upscape.html'],
     ['Distribution App', 'distributionapp.html'], ['macEQ Support', 'support.html'], ['Upscape Support', 'upscape-support.html'],
     ['Website Privacy', 'website-privacy.html']].forEach(function (l) {
      var a = document.createElement('a');
      a.href = l[1];
      a.textContent = l[0];
      row.appendChild(a);
    });
    var bottom = foot.querySelector('.footer-bottom, .signoff-links');
    foot.insertBefore(row, bottom);
  }

  /* "Name — description" lists become tiles: the name is the tile title, so drop the joining dash */
  document.querySelectorAll('body > ul:not(.category-grid):not(.social)').forEach(function (ul) {
    var items = Array.prototype.slice.call(ul.children);
    var titled = items.every(function (li) { return li.firstElementChild && li.firstElementChild.tagName === 'STRONG' && li.firstChild === li.firstElementChild; });
    if (!titled) return;
    ul.classList.add('tiles');
    items.forEach(function (li) {
      var t = li.firstElementChild.nextSibling;
      if (t && t.nodeType === 3) t.textContent = t.textContent.replace(/^\s*[—–-]\s*/, '').replace(/^\s*\S/, function (c) { return c.trim().toUpperCase(); });
    });
    if (items.length >= 3 && !document.body.classList.contains('is-doc')) {
      items[0].classList.add('is-featured');
      var h2 = ul.previousElementSibling;
      while (h2 && h2.tagName !== 'H2') h2 = h2.previousElementSibling;
      var icon = h2 && h2.querySelector('.sf-symbol');
      if (icon) items[0].insertBefore(icon, items[0].firstChild);
    }
  });

  /* Home page product tiles: each shows its app's screenshot rising from the bottom, like apple.com */
  var SHOTS = { maceq: 'maceq-main', keyboards: 'keyboards-main', upscape: 'upscape-compare', distributionapp: 'distributionapp-approvals' };
  document.querySelectorAll('.work-card[data-item-id]').forEach(function (card) {
    var name = SHOTS[card.getAttribute('data-item-id')];
    if (!name) return;
    var img = document.createElement('img');
    img.className = 'work-shot';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = 'Assets/optimized/' + name + '-640.webp';
    img.srcset = 'Assets/optimized/' + name + '-640.webp 640w, Assets/optimized/' + name + '-1280.webp 1280w, Assets/optimized/' + name + '-hd.webp 1600w';
    img.sizes = '(max-width: 734px) 86vw, 600px';
    card.appendChild(img);
  });

  /* Screenshots: offer the high-resolution copy (Assets/optimized/*-hd.webp) so they stay sharp on Retina screens */
  var HD = { 'maceq-main': 1600, 'maceq-advanced': 1600, 'maceq-presets': 1600, 'maceq-spatial': 1946, 'maceq-surround': 1946,
    'keyboards-main': 1960, 'keyboards-screenshots': 1960, 'upscape-upscaling': 1924, 'upscape-compare': 1924,
    'distributionapp-approvals': 1600, 'distributionapp-invoice': 1600, 'distributionapp-payment': 1960 };
  /* First screenshot is the hero band; the rest sit inside rounded tiles, so the page doesn't repeat itself */
  /* screenshots with a white background or white border (measured) sit on white cards */
  var WHITE = /(distributionapp-(approvals|invoice|payment)|keyboards-(main|screenshots)|upscape-open|maceq-(spatial|surround))-/;
  document.querySelectorAll('body > figure').forEach(function (f) {
    f.classList.add('is-card');
    var img = f.querySelector('img');
    if (img && WHITE.test(img.getAttribute('src') || '')) f.classList.add('is-white');
  });

  document.querySelectorAll('body > figure img').forEach(function (img) {
    var m = (img.getAttribute('src') || '').match(/optimized\/(.+)-640\.webp/);
    if (m && HD[m[1]]) {
      img.srcset = img.getAttribute('srcset') + ', Assets/optimized/' + m[1] + '-hd.webp ' + HD[m[1]] + 'w';
      img.sizes = '(max-width: 1000px) calc(100vw - 44px), 880px';
    } else {
      img.classList.add('is-lowres');
    }
  });

  /* macEQ: every screenshot goes into one sideways gallery where the first one stood, with
     Apple's dot pill and ‹ › buttons underneath. Moves only when you swipe, scroll or tap. */
  var shots = document.querySelectorAll('body > figure.is-card');
  if (IS_PRODUCT && shots.length > 1) {
    var p1 = shots[0].nextElementSibling, p2 = p1 && p1.nextElementSibling;
    if (p1 && p1.tagName === 'P') { p1.classList.add('is-intro'); if (p2 && p2.tagName === 'P') p2.classList.add('is-intro'); }
    var gal = document.createElement('section');
    gal.className = 'gallery';
    gal.setAttribute('aria-label', 'Screenshots');
    gal.innerHTML = '<ul class="gallery-row"></ul><div class="gallery-nav"><div class="gallery-dots" role="tablist"></div>' +
      '<button class="gallery-arrow" type="button" aria-label="Previous screenshot" data-dir="-1"><svg viewBox="0 0 36 36" aria-hidden="true"><path d="M21 11l-7 7 7 7"/></svg></button>' +
      '<button class="gallery-arrow" type="button" aria-label="Next screenshot" data-dir="1"><svg viewBox="0 0 36 36" aria-hidden="true"><path d="M15 11l7 7-7 7"/></svg></button></div>';
    shots[0].parentNode.insertBefore(gal, shots[0]);
    var grow = gal.querySelector('.gallery-row'), dots = gal.querySelector('.gallery-dots');
    Array.prototype.forEach.call(shots, function (f, i) {
      var li = document.createElement('li');
      li.appendChild(f);
      grow.appendChild(li);
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'gallery-dot';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Screenshot ' + (i + 1) + ' of ' + shots.length);
      d.addEventListener('click', function () { go(i); });
      dots.appendChild(d);
    });
    var at = 0;
    var go = function (i) {
      i = Math.max(0, Math.min(shots.length - 1, i));
      grow.scrollTo({ left: grow.children[i].offsetLeft - grow.children[0].offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };
    var sync = function () {
      var step = grow.children[1].offsetLeft - grow.children[0].offsetLeft;
      gal.classList.toggle('is-static', grow.scrollWidth <= grow.clientWidth + 4); /* everything fits: no dots or arrows */
      at = grow.scrollLeft <= 4 ? 0 : grow.scrollLeft + grow.clientWidth >= grow.scrollWidth - 4 ? shots.length - 1 : Math.round(grow.scrollLeft / step);
      Array.prototype.forEach.call(dots.children, function (d, i) { d.setAttribute('aria-selected', i === at ? 'true' : 'false'); });
      gal.querySelector('[data-dir="-1"]').disabled = at === 0;
      gal.querySelector('[data-dir="1"]').disabled = at === shots.length - 1;
    };
    gal.querySelectorAll('.gallery-arrow').forEach(function (b) {
      /* arrows move one card from where the row is now (the last card can't scroll to the left edge, so "at" isn't a safe start) */
      b.addEventListener('click', function () {
        var step = grow.children[1].offsetLeft - grow.children[0].offsetLeft;
        grow.scrollBy({ left: step * Number(b.dataset.dir), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
    });
    grow.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* Cookie banner: once you start scrolling it slides away and the cookie button comes back
     (looked up at scroll time, because theme.js builds the banner after this runs) */
  var openedAt = null;
  window.addEventListener('scroll', function () {
    var consent = document.querySelector('.privacy-consent'), cookie = document.querySelector('.privacy-settings');
    if (!consent || !cookie || consent.hidden) { openedAt = null; return; }
    if (openedAt === null) { openedAt = window.scrollY; return; }
    if (Math.abs(window.scrollY - openedAt) < 30) return;
    consent.hidden = true;
    cookie.hidden = false;
    openedAt = null;
  }, { passive: true });

  /* ---------- Motion, Apple's way (same as the home page): rise into place as you reach it, once ---------- */
  if (!document.querySelector('.lineup') && !document.body.classList.contains('is-doc') &&
      'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js-anim');
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.remove('reveal'); }); /* the older fade gives way */
    var mark = function (list, extra, step, base) {
      Array.prototype.forEach.call(list, function (el, i) {
        if (el.closest('#made-for-grid')) return;
        el.classList.add('anim');
        if (extra) el.classList.add(extra);
        el.style.transitionDelay = ((base || 0) + i * (step || 0)) + 'ms';
      });
    };
    var hero = document.querySelectorAll('body > .logo-lockup, body > .eyebrow, body > h1, body > .tagline, body > .hero-sub, body > .hero-buy, body > .requirements');
    mark(hero, null, 100);
    document.querySelectorAll('.hero-facts > li').forEach(function (li, i) { li.classList.add('anim', 'pop'); li.style.transitionDelay = (600 + i * 90) + 'ms'; });
    mark(document.querySelectorAll('body > h2, body > h2 + p, body > figure, body > .gallery-nav-wrap, body > .preset-card, body > .more-card, body > .price-notes, body > .faq-list, body > .guide-link, body > .pricing-lead, body > .closing-icon, body > .closing-sub, body > ol, body > .price-wrap, body > .testimonial-rotator, body > p:not(.requirements):not(.tagline):not(.eyebrow)'));
    document.querySelectorAll('body > ul.tiles, body > .category-grid').forEach(function (ul) { mark(ul.children, null, 100); Array.prototype.forEach.call(ul.children, function (li, i) { li.style.setProperty('--td', (i * 100) + 'ms'); }); });
    /* the gallery title spells itself in from the right, like the home page's "Explore the line-up." */
    var look = document.getElementById('look');
    if (look) {
      look.classList.remove('anim');
      look.setAttribute('aria-label', look.textContent);
      look.innerHTML = look.textContent.split('').map(function (ch, i) {
        return ch === ' ' ? ' ' : '<span class="anim letter" aria-hidden="true" style="transition-delay:' + (i * 40) + 'ms">' + ch + '</span>';
      }).join('');
    }
    /* gallery cards slide in from the right one after another, their screenshot rising just after */
    document.querySelectorAll('.gallery-row > li').forEach(function (li, i) { li.style.setProperty('--d', (i * 100) + 'ms'); });
    mark(document.querySelectorAll('.gallery-row > li'), 'from-right', 100);
    mark(document.querySelectorAll('.gallery-nav'), null, 0, 300);
    /* pills pop in one by one, steps rise in turn, the closing icon pops */
    mark(document.querySelectorAll('.preset-chips > li'), 'pop', 30, 200);
    mark(document.querySelectorAll('body > ol > li'), null, 100);
    /* sales cards rise in turn: offers, plans, add-ons, questions */
    mark(document.querySelectorAll('.offer-grid > div'), 'grow', 100);
    mark(document.querySelectorAll('.plan-grid > div'), 'grow', 100);
    mark(document.querySelectorAll('.addon-card'), 'grow', 0);
    mark(document.querySelectorAll('.addon-grid > li'), 'pop', 70, 250);
    mark(document.querySelectorAll('.faq-list > details'), null, 100);
    mark(document.querySelectorAll('.model-grid > div'), 'grow', 100);
    /* blue accent words ("Access", "Tester") spell in letter by letter from the right */
    document.querySelectorAll('.accent-word').forEach(function (w) {
      w.innerHTML = w.textContent.split('').map(function (ch, i) {
        return '<span class="anim letter" style="transition-delay:' + (300 + i * 60) + 'ms">' + ch + '</span>';
      }).join('');
    });
    var ci = document.querySelector('.closing-icon');
    if (ci) ci.classList.add('pop');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.anim').forEach(function (el) { if (!el.closest('.hero-facts')) io.observe(el); });
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(hero, function (el) { el.classList.add('is-in'); });
      document.querySelectorAll('.hero-facts > li').forEach(function (li) { li.classList.add('is-in'); });
    });
    document.querySelectorAll('ul.tiles > li').forEach(function (li) {
      li.addEventListener('transitionend', function () { li.style.transitionDelay = '0ms'; }, { once: true });
    });
  }
  } finally {
    clearTimeout(applePendingTimer);
    document.documentElement.classList.remove('apple-pending');
  }
});
