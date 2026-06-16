import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Google Analytics 4 (GA4) — page-hit tracking for this HashRouter SPA.
//
// To turn it on: create a GA4 property at https://analytics.google.com, copy
// its Measurement ID (looks like "G-XXXXXXXXXX"), and paste it below.
// Until then GA stays OFF (no script loaded, no cookies set).
//
// We load gtag.js ourselves and configure it with send_page_view:false, then
// fire a page_view on every route change — GA4's automatic pageview misses
// client-side hash-route changes.
// ---------------------------------------------------------------------------
const GA_ID = 'G-JMMHKMBD4Y';
const ENABLED = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== 'G-XXXXXXXXXX';

let initialized = false;

function initGA() {
  if (initialized || !ENABLED) return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // We send page_views manually (per route), so disable the automatic one.
  window.gtag('config', GA_ID, { send_page_view: false });
}

// Fires a GA4 page_view whenever the route changes (and lazily inits GA).
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    if (!ENABLED || typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);
}

// Drop-in component to mount inside the Router.
export function RouteTracker() {
  usePageTracking();
  return null;
}
