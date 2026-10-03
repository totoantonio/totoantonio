/* Shared behaviour: theme toggle, scroll reveal, hero badge veil.
   Loaded in <head> so the saved theme is applied before first paint. */

(() => {
  'use strict';

  const root = document.documentElement;
  const STORAGE_KEY = 'maceq-theme';
  const CONSENT_STORAGE_KEY = 'site-privacy-consent-v1';
  const GOOGLE_TAG_ID = 'G-MVT06V95WT';
  const META_PIXEL_ID = '4743844149273433';

  // --- Apply the theme immediately, before anything renders. ---
  // Light is the default; the system preference is not followed unless the
  // visitor picks dark themselves.
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    root.dataset.theme = saved === 'dark' ? 'dark' : 'light';
  } catch {
    // Private browsing or blocked storage: still default to light.
    root.dataset.theme = 'light';
  }

  const currentTheme = () => root.dataset.theme || 'light';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    let consent = { analytics: false, marketing: false };
    let hasSavedConsent = false;
    let googleInitialized = false;
    let metaInitialized = false;

    try {
      const savedConsent = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || 'null');
      if (
        savedConsent &&
        savedConsent.version === 1 &&
        typeof savedConsent.analytics === 'boolean' &&
        typeof savedConsent.marketing === 'boolean'
      ) {
        consent = { analytics: savedConsent.analytics, marketing: savedConsent.marketing };
        hasSavedConsent = true;
      }
    } catch {
      // Treat unreadable consent state as no consent.
    }

    const removeCookies = (matches) => {
      const names = document.cookie
        .split(';')
        .map((cookie) => cookie.split('=')[0].trim())
        .filter((name) => matches(name));

      names.forEach((name) => {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname}; SameSite=Lax`;
      });
    };

    const updateGoogleConsent = (granted) => {
      if (!granted) {
        if (window.gtag && googleInitialized) {
          window.gtag('consent', 'update', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
        }
        removeCookies((name) => name === '_ga' || name === '_gid' || name === '_gat' || name.startsWith('_ga_'));
        return;
      }

      if (!window.gtag) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer.push(arguments);
        };
      }

      if (!googleInitialized) {
        window.gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      }

      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });

      if (!googleInitialized) {
        window.gtag('js', new Date());
        window.gtag('config', GOOGLE_TAG_ID);
        googleInitialized = true;

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`;
        document.head.appendChild(script);
      } else {
        window.gtag('event', 'page_view', { page_location: location.href });
      }
    };

    const updateMetaConsent = (granted) => {
      if (!granted) {
        if (window.fbq && metaInitialized) window.fbq('consent', 'revoke');
        removeCookies((name) => name === '_fbp' || name === '_fbc');
        return;
      }

      if (!window.fbq) {
        const fbq = function () {
          if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
          else fbq.queue.push(arguments);
        };
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = '2.0';
        fbq.queue = [];
        window.fbq = fbq;
        window._fbq = fbq;

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);
      }

      window.fbq('consent', 'grant');
      if (!metaInitialized) {
        window.fbq('init', META_PIXEL_ID);
        metaInitialized = true;
      }
      window.fbq('track', 'PageView');
    };

    const settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'privacy-settings';
    settingsButton.textContent = 'Privacy settings';
    settingsButton.hidden = !hasSavedConsent;
    settingsButton.setAttribute('aria-label', 'Change analytics and advertising consent');

    const consentPanel = document.createElement('section');
    consentPanel.className = 'privacy-consent';
    consentPanel.setAttribute('aria-label', 'Privacy Choices');
    consentPanel.hidden = hasSavedConsent;
    consentPanel.innerHTML = `
      <h2>Privacy Choices</h2>
      <p>Google Fonts supplies this site's typeface and receives basic connection details. Analytics and advertising are optional; choose each separately. <a href="website-privacy.html">Privacy policy</a></p>
      <div class="privacy-consent-options">
        <label><input type="checkbox" data-analytics-choice> Analytics (Google)</label>
        <label><input type="checkbox" data-marketing-choice> Advertising (Meta)</label>
      </div>
      <div class="privacy-consent-actions">
        <button type="button" data-reject-optional>Reject Optional</button>
        <button type="button" data-save-choices>Save Choices</button>
        <button type="button" data-accept-all>Allow All</button>
      </div>
    `;

    const analyticsChoice = consentPanel.querySelector('[data-analytics-choice]');
    const marketingChoice = consentPanel.querySelector('[data-marketing-choice]');

    const saveConsent = (nextConsent) => {
      consent = nextConsent;
      hasSavedConsent = true;
      try {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ version: 1, ...consent, updatedAt: new Date().toISOString() }));
      } catch {
        // Keep the choice for this page view when storage is unavailable.
      }

      updateGoogleConsent(consent.analytics);
      updateMetaConsent(consent.marketing);
      consentPanel.hidden = true;
      settingsButton.hidden = false;
    };

    settingsButton.addEventListener('click', () => {
      analyticsChoice.checked = consent.analytics;
      marketingChoice.checked = consent.marketing;
      consentPanel.hidden = false;
      settingsButton.hidden = true;
      analyticsChoice.focus();
    });

    consentPanel.querySelector('[data-reject-optional]').addEventListener('click', () => {
      saveConsent({ analytics: false, marketing: false });
    });
    consentPanel.querySelector('[data-save-choices]').addEventListener('click', () => {
      saveConsent({ analytics: analyticsChoice.checked, marketing: marketingChoice.checked });
    });
    consentPanel.querySelector('[data-accept-all]').addEventListener('click', () => {
      saveConsent({ analytics: true, marketing: true });
    });

    document.body.append(settingsButton, consentPanel);

    if (hasSavedConsent) {
      updateGoogleConsent(consent.analytics);
      updateMetaConsent(consent.marketing);
    } else {
      updateGoogleConsent(false);
      updateMetaConsent(false);
    }

    document.addEventListener('click', (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[data-analytics-event]') : null;
      if (!link || (!consent.analytics && !consent.marketing)) return;

      const eventName = link.dataset.analyticsEvent;
      const itemId = link.dataset.itemId;
      const itemName = link.dataset.itemName;
      if (!['select_item', 'begin_checkout'].includes(eventName) || !itemId || !itemName) return;

      event.preventDefault();
      let navigated = false;
      let fallbackId = 0;
      let navigationId = 0;
      const navigate = () => {
        if (navigated) return;
        navigated = true;
        window.clearTimeout(fallbackId);
        window.clearTimeout(navigationId);
        window.location.assign(link.href);
      };
      const scheduleNavigation = () => {
        if (!navigationId) navigationId = window.setTimeout(navigate, 180);
      };
      fallbackId = window.setTimeout(navigate, 800);
      const item = { item_id: itemId, item_name: itemName, item_category: 'Mac apps' };

      if (consent.analytics && window.gtag) {
        const params = { items: [item], transport_type: 'beacon', event_callback: scheduleNavigation, event_timeout: 650 };
        if (eventName === 'select_item') params.item_list_name = 'Selected work';
        window.gtag('event', eventName, params);
      } else {
        scheduleNavigation();
      }

      if (consent.marketing && window.fbq) {
        const metaEvent = eventName === 'select_item' ? 'ViewContent' : 'InitiateCheckout';
        window.fbq('track', metaEvent, { content_ids: [itemId], content_name: itemName, content_type: 'product' });
      }

    });

    // --- Theme toggle ---
    const toggle = document.querySelector('.theme-toggle');

    if (toggle) {
      const label = () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        toggle.setAttribute('aria-label', `Switch to ${next} appearance`);
      };

      toggle.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Not fatal — the theme still applies for this page view.
        }
        label();
      });

      label();
    }

    // --- Testimonial rotator ---
    const rotators = document.querySelectorAll('[data-testimonial-rotator]');

    rotators.forEach((rotator) => {
      const items = Array.from(rotator.querySelectorAll('.testimonial-item'));
      const dots = Array.from(rotator.querySelectorAll('.testimonial-dot'));

      if (items.length < 2) return;

      let currentIndex = 0;
      let timerId = null;

      const showSlide = (nextIndex) => {
        currentIndex = nextIndex;
        items.forEach((item, index) => {
          const isActive = index === nextIndex;
          item.classList.toggle('active', isActive);
          item.setAttribute('aria-hidden', String(!isActive));
        });
        dots.forEach((dot, index) => {
          const isActive = index === nextIndex;
          dot.classList.toggle('active', isActive);
          dot.setAttribute('aria-selected', String(isActive));
          dot.setAttribute('tabindex', String(isActive ? 0 : -1));
        });
      };

      const restartTimer = () => {
        if (reduceMotion) return;
        if (timerId) window.clearInterval(timerId);
        timerId = window.setInterval(() => {
          showSlide((currentIndex + 1) % items.length);
        }, 4200);
      };

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          showSlide(index);
          restartTimer();
        });
      });

      rotator.addEventListener('mouseenter', () => {
        if (timerId) window.clearInterval(timerId);
      });

      rotator.addEventListener('mouseleave', () => {
        restartTimer();
      });

      showSlide(0);
      restartTimer();
    });

    // --- Scroll reveal ---
    const targets = document.querySelectorAll('.reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
      );

      targets.forEach((el) => observer.observe(el));
    }
  });
})();
