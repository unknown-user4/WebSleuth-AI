// ═══════════════════════════════════════════════════════════
//  WebSleuth AI v2 — Background Service Worker
//  UI: WebSleuth AI v2  |  Backend: IBM LinuxONE AI
// ═══════════════════════════════════════════════════════════

const API_URL = 'http://localhost:8001'; // SSH Tunnel → IBM LinuxONE (148.100.98.166:8000)
const API_TIMEOUT_MS = 4000;

// ── Verified safe domains (instant pass — no API call needed) ──
const SAFE_DOMAINS = new Set([
  'incometax.gov.in','gst.gov.in','uidai.gov.in','passport.gov.in',
  'passportindia.gov.in','epfindia.gov.in','mca.gov.in','india.gov.in',
  'digilocker.gov.in','irctc.co.in','sbi.co.in','rbi.org.in',
  'sebi.gov.in','nvsp.in','msme.gov.in','pmkisan.gov.in',
  'cowin.gov.in','nic.in','niti.gov.in','cbse.gov.in',
  'nsdl.co.in','irdai.gov.in','aiims.edu','ugc.ac.in',
  'indianrailways.gov.in','pib.gov.in','mohfw.gov.in',
  'google.com','youtube.com','github.com','microsoft.com',
  'mail.google.com','drive.google.com','docs.google.com',
  'maps.google.com','accounts.google.com',
  'linkedin.com','twitter.com','x.com','facebook.com','instagram.com',
  'amazon.in','amazon.com','flipkart.com','paytm.com',
  'hdfcbank.com','icicibank.com','axisbank.com',
  'bankofbaroda.in','pnbindia.in','naukri.com'
]);

// ── URL cache ──────────────────────────────────────────────
const urlCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Badge helpers ──────────────────────────────────────────
function setBadge(tabId, text, color) {
  chrome.action.setBadgeText({ tabId, text }).catch(() => {});
  chrome.action.setBadgeBackgroundColor({ tabId, color }).catch(() => {});
}
const badgeSafe    = (t) => setBadge(t, '✓', '#10b981');
const badgeDanger  = (t) => setBadge(t, '!', '#ef4444');
const badgeLoading = (t) => setBadge(t, '…', '#6366f1');
const badgeClear   = (t) => setBadge(t, '',  '#6366f1');

// ── Domain helpers ─────────────────────────────────────────
function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); }
  catch { return ''; }
}

function shouldSkip(url) {
  if (!url) return true;
  return ['chrome://','chrome-extension://','about:','edge://','data:','moz-extension://','javascript:']
    .some(p => url.startsWith(p));
}

// ── Fetch with timeout ─────────────────────────────────────
async function fetchWithTimeout(url, options, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(t);
    return res;
  } catch(e) { clearTimeout(t); throw e; }
}

// ── Offline heuristic fallback ─────────────────────────────
function localAnalyze(url, domain) {
  let risk = 0;
  const lower = url.toLowerCase();

  if (!lower.startsWith('https')) risk += 20;
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain)) risk += 35;
  if (url.includes('@')) risk += 35;

  const hyphens = (url.match(/-/g) || []).length;
  if (hyphens > 2) risk += 15;
  if (hyphens > 4) risk += 15;
  if ((url.match(/\./g) || []).length > 5) risk += 15;
  if (/%[0-9a-fA-F]{2}/.test(url)) risk += 15;

  const suspiciousKw = [
    'verify','login','secure','free','prize','urgent','suspended','kyc',
    'otp','reward','cashback','refund','update','confirm','password',
    'credential','signin','alert','validate','claim','winner','blocked'
  ];
  let kwCount = 0;
  suspiciousKw.forEach(k => { if (lower.includes(k)) kwCount++; });
  risk += Math.min(kwCount * 8, 40);

  const govKeywords = [
    'gov','india','irctc','aadhaar','incometax','epfo','passport',
    'sbi','rbi','sebi','nsdl','uidai','digilocker','pmkisan',
    'irdai','cbse','pfms','nsdc','aiims'
  ];
  const isGovLike = govKeywords.some(k => lower.includes(k));
  if (isGovLike && !SAFE_DOMAINS.has(domain)) risk += 30;

  const subdomains = domain.split('.').length - 2;
  if (subdomains > 2) risk += 20;
  if (subdomains > 3) risk += 15;

  risk = Math.min(risk, 100);
  const isPhishing = risk >= 45;

  const reasons = [];
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain)) reasons.push('URL uses raw IP address');
  if (url.includes('@')) reasons.push("URL contains '@' — phishing trick");
  if (hyphens > 3) reasons.push(`Too many hyphens (${hyphens})`);
  if (kwCount > 1) reasons.push('Multiple suspicious keywords detected');
  if (!lower.startsWith('https')) reasons.push('Not using HTTPS — insecure');
  if (isGovLike && !SAFE_DOMAINS.has(domain)) reasons.push('Impersonates gov/bank domain');
  if (subdomains > 2) reasons.push('Excessive subdomain nesting');

  return {
    url, domain,
    is_phishing: isPhishing,
    risk_score: risk,
    confidence: isPhishing ? risk / 100 : (100 - risk) / 100,
    reason: reasons.length ? reasons.join('; ') : (isPhishing ? 'Suspicious URL pattern' : 'URL appears safe'),
    model_version: 1,
    is_local: true,
    timestamp: Date.now()
  };
}

// ── Show scam overlay (v2 content.js interface) ────────────
function triggerWarning(tabId, result) {
  chrome.tabs.sendMessage(tabId, { action: 'show_scam_warning', data: result })
    .catch(() => {
      // Content script not yet injected — inject it first
      chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] })
        .then(() => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: 'show_scam_warning', data: result }).catch(() => {});
          }, 300);
        }).catch(() => {});
    });
}

// ── Main analysis ──────────────────────────────────────────
async function analyzeURL(url, tabId) {
  if (shouldSkip(url)) { badgeClear(tabId); return; }
  const domain = extractDomain(url);
  if (!domain) return;

  // Instant safe for known domains
  if (SAFE_DOMAINS.has(domain)) {
    const result = {
      url, domain, is_phishing: false, risk_score: 0,
      confidence: 0.99, reason: 'Verified safe domain',
      is_verified: true, model_version: 1, timestamp: Date.now()
    };
    badgeSafe(tabId);
    await chrome.storage.local.set({ [`result_${tabId}`]: result });
    return;
  }

  // Check cache
  const cached = urlCache.get(url);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    const r = cached.result;
    await chrome.storage.local.set({ [`result_${tabId}`]: r });
    if (r.is_phishing) { badgeDanger(tabId); triggerWarning(tabId, r); }
    else badgeSafe(tabId);
    return;
  }

  badgeLoading(tabId);

  let result;
  try {
    // Try IBM LinuxONE via SSH tunnel
    const res = await fetchWithTimeout(
      `${API_URL}/check-url`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      },
      API_TIMEOUT_MS
    );
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    result = { ...data, url, domain, is_local: false, timestamp: Date.now() };
  } catch {
    // Fallback: fully offline local heuristics
    result = localAnalyze(url, domain);
  }

  urlCache.set(url, { result, timestamp: Date.now() });
  await chrome.storage.local.set({ [`result_${tabId}`]: result });

  if (result.is_phishing) {
    badgeDanger(tabId);
    triggerWarning(tabId, result);
  } else {
    badgeSafe(tabId);
  }
}

// ── Navigation listeners ───────────────────────────────────
chrome.webNavigation.onCompleted.addListener(({ tabId, url, frameId }) => {
  if (frameId !== 0) return;
  analyzeURL(url, tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && changeInfo.url) badgeLoading(tabId);
  if (changeInfo.status === 'complete' && tab.url) analyzeURL(tab.url, tabId);
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || shouldSkip(tab.url)) return;
    const stored = await chrome.storage.local.get(`result_${tabId}`);
    const cached = stored[`result_${tabId}`];
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
      if (cached.is_phishing) badgeDanger(tabId); else badgeSafe(tabId);
    } else {
      analyzeURL(tab.url, tabId);
    }
  } catch {}
});

// ── Message handler ────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // v2 popup: close current tab
  if (msg.action === 'close_tab' && sender.tab) {
    chrome.tabs.remove(sender.tab.id);
    sendResponse({ ok: true });
    return false;
  }

  // v2 popup: open dashboard
  if (msg.action === 'open_dashboard') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return false;
  }

  // v2 popup: report fake
  if (msg.action === 'report_site_fake') {
    (async () => {
      try {
        await fetchWithTimeout(`${API_URL}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: `https://${msg.domain}`, is_phishing: true, reporter: 'extension-user' })
        }, API_TIMEOUT_MS);
      } catch {
        // Save to local blacklist if offline
        const data = await chrome.storage.local.get('local_blacklist');
        const bl = data.local_blacklist || [];
        if (!bl.includes(msg.domain)) bl.push(msg.domain);
        await chrome.storage.local.set({ local_blacklist: bl });
      }
      sendResponse({ ok: true });
    })();
    return true;
  }

  // v2 popup: report safe (whitelist locally)
  if (msg.action === 'report_site_safe') {
    (async () => {
      try {
        await fetchWithTimeout(`${API_URL}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: `https://${msg.domain}`, is_phishing: false, reporter: 'extension-user' })
        }, API_TIMEOUT_MS);
      } catch {
        SAFE_DOMAINS.add(msg.domain);
      }
      sendResponse({ ok: true });
    })();
    return true;
  }

  // Legacy GET_RESULT for popup reanalysis
  if (msg.type === 'GET_RESULT') {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
      if (!tab) { sendResponse(null); return; }
      const stored = await chrome.storage.local.get(`result_${tab.id}`);
      let result = stored[`result_${tab.id}`] || null;
      if (!result && tab.url && !shouldSkip(tab.url)) {
        const domain = extractDomain(tab.url);
        result = SAFE_DOMAINS.has(domain)
          ? { url: tab.url, domain, is_phishing: false, risk_score: 0, is_verified: true, model_version: 1, timestamp: Date.now() }
          : localAnalyze(tab.url, domain);
        await chrome.storage.local.set({ [`result_${tab.id}`]: result });
      }
      sendResponse(result);
    });
    return true;
  }
});

console.log('🛡️ WebSleuth AI v2 — IBM LinuxONE Background Worker Active');
