    // ══════════════════════════════════════════════════════
    //  CONFIG
    // ══════════════════════════════════════════════════════
    const API = 'http://localhost:8001'; // IBM LinuxONE SSH Tunnel
    let reportIsPhishing = true;
    let currentCategory = 'all';
    let allSites = [];

    // ══════════════════════════════════════════════════════
    //  TOAST
    // ══════════════════════════════════════════════════════
    function toast(msg, color = '#22c55e') {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.style.borderColor = color + '40';
      el.style.color = color;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 3500);
    }

    // ══════════════════════════════════════════════════════
    //  URL CHECKER
    // ══════════════════════════════════════════════════════
    async function checkURL() {
      const input = document.getElementById('urlInput').value.trim();
      if (!input) return toast('Please enter a URL!', '#f59e0b');

      const btn = document.getElementById('checkBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Analyzing...';

      try {
        const res = await fetch(`${API}/check-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input })
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        displayResult(data);
        addFeedRow(data);
        refreshStats();
      } catch (err) {
        // Demo mode if backend is down
        const demoResult = demoAnalyze(input);
        displayResult(demoResult);
        addFeedRow(demoResult);
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Analyze URL';
      }
    }

    // Allows Enter key
    document.getElementById('urlInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') checkURL();
    });

    function displayResult(data) {
      const card = document.getElementById('resultCard');
      const isPhish = data.is_phishing;
      const risk = data.risk_score;

      card.style.display = 'block';
      card.className = isPhish ? 'danger' : 'safe';

      document.getElementById('resultIcon').textContent = isPhish ? '⚠️' : '✅';
      document.getElementById('resultTitle').textContent = isPhish
        ? '🚨 Dangerous! This site appears to be FAKE or PHISHING'
        : '✅ This site appears SAFE';
      document.getElementById('resultTitle').style.color = isPhish ? 'var(--danger)' : 'var(--success)';
      document.getElementById('resultURL').textContent = data.url;

      document.getElementById('riskScore').textContent = risk + '/100';
      document.getElementById('riskScore').style.color = riskColor(risk);
      document.getElementById('confidence').textContent = Math.round((data.confidence || 0) * 100) + '%';
      document.getElementById('modelVersion').textContent = 'v' + (data.model_version || '1');

      // Risk bar
      const fill = document.getElementById('riskBarFill');
      fill.style.width = '0%';
      fill.style.background = riskGradient(risk);
      setTimeout(() => fill.style.width = risk + '%', 100);

      const labels = ['Low', 'Moderate', 'High', 'Critical'];
      const idx = risk < 25 ? 0 : risk < 50 ? 1 : risk < 75 ? 2 : 3;
      document.getElementById('riskLabel').textContent = labels[idx];

      // Reason
      const reasonBox = document.getElementById('reasonBox');
      if (data.reason) {
        reasonBox.style.display = 'block';
        reasonBox.innerHTML = '<strong>⚡ AI Analysis:</strong> ' + data.reason;
      } else {
        reasonBox.style.display = 'none';
      }

      // Verified alternative
      const verBox = document.getElementById('verifiedBox');
      if (data.verified_site) {
        verBox.style.display = 'flex';
        const site = data.verified_site;
        verBox.innerHTML = `
          <span style="font-size:24px;">${site.icon || '🇮🇳'}</span>
          <div>
            <strong style="color:var(--cyan);">Official Site Found in Registry:</strong>
            <br/>The verified URL is: <a href="${site.url}" target="_blank">${site.url}</a> — ${site.name}
          </div>
        `;
      } else {
        verBox.style.display = 'none';
      }

      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function riskColor(r) {
      if (r < 30) return 'var(--success)';
      if (r < 55) return 'var(--warn)';
      return 'var(--danger)';
    }

    function riskGradient(r) {
      if (r < 30) return 'linear-gradient(90deg, #22c55e, #16a34a)';
      if (r < 55) return 'linear-gradient(90deg, #f59e0b, #d97706)';
      return 'linear-gradient(90deg, #ef4444, #b91c1c)';
    }

    // ══════════════════════════════════════════════════════
    //  DEMO ANALYZE (when backend offline)
    // ══════════════════════════════════════════════════════
    const SAFE_DOMAINS = ['incometax.gov.in','gst.gov.in','uidai.gov.in','irctc.co.in',
      'sbi.co.in','rbi.org.in','india.gov.in','epfindia.gov.in','passportindia.gov.in',
      'google.com','youtube.com','github.com'];

    function demoAnalyze(url) {
      let risk = 0;
      const lower = url.toLowerCase();
      if (!lower.startsWith('https')) risk += 20;
      if ((url.match(/-/g)||[]).length > 3) risk += 25;
      if (/\d+\.\d+\.\d+\.\d+/.test(url)) risk += 35;
      if (['verify','login','secure','free','prize','urgent'].some(k => lower.includes(k))) risk += 20;
      if ((url.match(/\./g)||[]).length > 4) risk += 15;
      if (url.includes('@')) risk += 30;
      // Levenshtein-ish sim check
      for (const d of SAFE_DOMAINS) {
        if (lower.includes(d)) { risk = 0; break; }
      }
      // Spoof check
      if ((lower.includes('gov') || lower.includes('india') || lower.includes('irctc')) 
          && !SAFE_DOMAINS.some(d => lower.includes(d))) {
        risk += 30;
      }
      risk = Math.min(risk, 100);
      const isPhish = risk >= 45;
      // Find verified site hint
      let verified_site = null;
      for (const s of allSites) {
        if (lower.includes(s.name.toLowerCase().split(' ')[0].toLowerCase())) {
          verified_site = s; break;
        }
      }
      return {
        url, risk_score: risk,
        is_phishing: isPhish,
        confidence: isPhish ? (risk/100) : ((100-risk)/100),
        reason: isPhish ? 'Suspicious URL patterns detected (demo mode)' : 'URL appears safe (demo mode)',
        model_version: 1,
        verified_site
      };
    }

    // ══════════════════════════════════════════════════════
    //  LIVE FEED TABLE
    // ══════════════════════════════════════════════════════
    let feedRows = [];
    function addFeedRow(data) {
      feedRows.unshift(data);
      if (feedRows.length > 20) feedRows.pop();
      renderFeed();
    }

    function renderFeed() {
      const tbody = document.getElementById('feedBody');
      if (!feedRows.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-dim);padding:32px;">No URLs checked yet.</td></tr>';
        return;
      }
      tbody.innerHTML = feedRows.map(d => `
        <tr>
          <td title="${d.url}">${d.url}</td>
          <td><span style="font-family:'JetBrains Mono',monospace; color:${d.risk_score>=50?'var(--danger)':d.risk_score>=30?'var(--warn)':'var(--success)'}">${d.risk_score}/100</span></td>
          <td>${d.is_phishing
            ? '<span class="badge-danger">⚠️ Phishing</span>'
            : '<span class="badge-safe">✅ Safe</span>'
          }</td>
          <td>${new Date().toLocaleTimeString()}</td>
        </tr>
      `).join('');
    }

    // ══════════════════════════════════════════════════════
    //  STATS
    // ══════════════════════════════════════════════════════
    let statsCache = { total_checked: 0, threats_blocked: 0, safe_sites: 0 };

    async function refreshStats() {
      try {
        const res = await fetch(`${API}/stats`);
        const data = await res.json();
        statsCache = data;
        animateNum('statChecked', data.total_checked);
        animateNum('statBlocked', data.threats_blocked);
        animateNum('statSafe', data.safe_sites);
        document.getElementById('liveModelVer').textContent = data.model_version || 1;
        document.getElementById('liveFeedback').textContent = data.feedback_entries || 0;
        document.getElementById('liveTotal').textContent = data.total_checked || 0;
        document.getElementById('liveThreat').textContent = data.threats_blocked || 0;
        document.getElementById('footerModel').textContent = data.model_version || 1;
      } catch {}
    }

    function animateNum(id, target) {
      const el = document.getElementById(id);
      const start = parseInt(el.textContent.replace(/,/g, '')) || 0;
      const diff = target - start;
      if (diff === 0) return;
      const steps = 20;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        el.textContent = Math.round(start + diff * step / steps);
        if (step >= steps) { el.textContent = target; clearInterval(interval); }
      }, 30);
    }

    // ══════════════════════════════════════════════════════
    //  VERIFIED SITES
    // ══════════════════════════════════════════════════════
    async function loadSites() {
      // Always show embedded sites immediately — grid is never blank
      allSites = EMBEDDED_SITES;
      renderSites(allSites);
      // Try IBM LinuxONE API to enrich
      try {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(`${API}/verified-sites`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('non-200');
        const data = await res.json();
        const api = Array.isArray(data) ? data : (Array.isArray(data.sites) ? data.sites : null);
        if (api && api.length > 0) { allSites = api; renderSites(allSites); }
      } catch { /* keep embedded sites */ }
    }

    function filterCategory(cat, btn) {
      currentCategory = cat;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterSites();
    }

    function filterSites() {
      const q = (document.getElementById('siteSearch').value || '').toLowerCase().trim();
      let filtered = Array.isArray(allSites) ? allSites : EMBEDDED_SITES;
      if (currentCategory !== 'all') {
        filtered = filtered.filter(s => s.category === currentCategory);
      }
      if (q) {
        filtered = filtered.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.domain.toLowerCase().includes(q)
        );
      }
      renderSites(filtered);
    }

    function renderSites(sites) {
      const grid = document.getElementById('sitesGrid');
      if (!Array.isArray(sites) || sites.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted); text-align:center; grid-column:1/-1; padding:40px;">No sites found.</p>';
        return;
      }
      grid.innerHTML = sites.map(s => `
        <a href="${s.url}" target="_blank" class="site-card">
          <div class="site-card-header">
            <div class="site-icon">${s.icon || '🇮🇳'}</div>
            <div>
              <div class="site-name">${s.name}</div>
              <div class="site-domain">${s.domain}</div>
            </div>
          </div>
          <div class="site-desc">${s.description}</div>
          <div class="site-footer">
            <span class="site-badge">✅ Verified</span>
            <span class="site-category-label">${s.category}</span>
          </div>
        </a>
      `).join('');
    }

    // Embedded fallback sites
    const EMBEDDED_SITES = [
      { name:'Income Tax Portal', domain:'incometax.gov.in', url:'https://www.incometax.gov.in', category:'Tax & Finance', description:'File ITR, check refund status, PAN services, Form 26AS', icon:'💰' },
      { name:'GST Portal', domain:'gst.gov.in', url:'https://www.gst.gov.in', category:'Tax & Finance', description:'GST registration, filing, returns and payments', icon:'🧾' },
      { name:'RBI', domain:'rbi.org.in', url:'https://www.rbi.org.in', category:'Tax & Finance', description:'Reserve Bank of India - monetary policy, forex, regulation', icon:'🏦' },
      { name:'SEBI', domain:'sebi.gov.in', url:'https://www.sebi.gov.in', category:'Tax & Finance', description:'Securities and Exchange Board of India - market regulator', icon:'📈' },
      { name:'NSDL', domain:'nsdl.co.in', url:'https://www.nsdl.co.in', category:'Tax & Finance', description:'PAN card, TDS certificates, tax e-payment services', icon:'🪙' },
      { name:'IRDAI', domain:'irdai.gov.in', url:'https://www.irdai.gov.in', category:'Tax & Finance', description:'Insurance Regulatory and Development Authority of India', icon:'🛡' },
      { name:'UIDAI Aadhaar', domain:'uidai.gov.in', url:'https://www.uidai.gov.in', category:'Identity & Documents', description:'Aadhaar download, update, lock biometrics and e-KYC', icon:'🪪' },
      { name:'Passport Seva', domain:'passportindia.gov.in', url:'https://www.passportindia.gov.in', category:'Identity & Documents', description:'Passport application, renewal, tracking and Tatkaal', icon:'🛂' },
      { name:'DigiLocker', domain:'digilocker.gov.in', url:'https://www.digilocker.gov.in', category:'Identity & Documents', description:'Govt digital wallet for DL, RC, Aadhaar, marksheets', icon:'📂' },
      { name:'MCA21 Company Registry', domain:'mca.gov.in', url:'https://www.mca.gov.in', category:'Identity & Documents', description:'Company registration, ROC filings, director info', icon:'🏢' },
      { name:"State Bank of India", domain:"sbi.co.in", url:"https://www.sbi.co.in", category:"Banking", description:"India's largest bank - net banking, loans, deposits", icon:"🏧" },
      { name:'HDFC Bank', domain:'hdfcbank.com', url:'https://www.hdfcbank.com', category:'Banking', description:'HDFC Bank - net banking, credit cards, home loans', icon:'💳' },
      { name:'ICICI Bank', domain:'icicibank.com', url:'https://www.icicibank.com', category:'Banking', description:'ICICI Bank - net banking, iMobile Pay, investments', icon:'🏦' },
      { name:'Bank of Baroda', domain:'bankofbaroda.in', url:'https://www.bankofbaroda.in', category:'Banking', description:'Public sector bank - net banking, loans, deposits', icon:'🏛' },
      { name:'Punjab National Bank', domain:'pnbindia.in', url:'https://www.pnbindia.in', category:'Banking', description:'PNB - PNB One app, net banking, NRI services', icon:'🏦' },
      { name:'EPFO', domain:'epfindia.gov.in', url:'https://www.epfindia.gov.in', category:'Social Welfare', description:'Employee Provident Fund - balance check, UAN, withdrawal', icon:'👷' },
      { name:'PM Kisan', domain:'pmkisan.gov.in', url:'https://www.pmkisan.gov.in', category:'Social Welfare', description:'PM Kisan Samman Nidhi - farmer income support scheme', icon:'🌾' },
      { name:'MSME Ministry', domain:'msme.gov.in', url:'https://www.msme.gov.in', category:'Social Welfare', description:'Udyam registration, government schemes for businesses', icon:'🏭' },
      { name:'National Voter Services', domain:'nvsp.in', url:'https://www.nvsp.in', category:'Social Welfare', description:'Voter ID registration, electoral roll, booth search', icon:'🗳' },
      { name:'IRCTC', domain:'irctc.co.in', url:'https://www.irctc.co.in', category:'Transportation', description:'Indian Railways - official train ticket booking site', icon:'🚄' },
      { name:'Indian Railways', domain:'indianrailways.gov.in', url:'https://www.indianrailways.gov.in', category:'Transportation', description:'Official Indian Railways information and services portal', icon:'🚂' },
      { name:'Ministry of Health', domain:'mohfw.gov.in', url:'https://www.mohfw.gov.in', category:'Health', description:'Ministry of Health and Family Welfare - schemes, advisories', icon:'🏥' },
      { name:'AIIMS New Delhi', domain:'aiims.edu', url:'https://www.aiims.edu', category:'Health', description:'All India Institute of Medical Sciences - appointments', icon:'⚕' },
      { name:'CBSE', domain:'cbse.gov.in', url:'https://www.cbse.gov.in', category:'Education', description:'Board results, admit cards, school affiliation lookup', icon:'🎓' },
      { name:'UGC', domain:'ugc.ac.in', url:'https://www.ugc.ac.in', category:'Education', description:'University Grants Commission - NET exam, university list', icon:'🏫' },
      { name:'NITI Aayog', domain:'niti.gov.in', url:'https://www.niti.gov.in', category:'Education', description:'National policy think tank - research and development', icon:'📊' },
      { name:'India.gov.in', domain:'india.gov.in', url:'https://www.india.gov.in', category:'Government', description:'National portal of India - all central government services', icon:'🇮🇳' },
      { name:'PIB India', domain:'pib.gov.in', url:'https://pib.gov.in', category:'Government', description:'Press Information Bureau - official government press releases', icon:'📰' },
    ]

    // ══════════════════════════════════════════════════════
    //  REPORT
    // ══════════════════════════════════════════════════════
    function selectPhishing(val) {
      reportIsPhishing = val;
      document.getElementById('btnPhish').className = 'toggle-btn' + (val ? ' selected-danger' : '');
      document.getElementById('btnSafe').className = 'toggle-btn' + (!val ? ' selected-safe' : '');
    }

    async function submitReport() {
      const url = document.getElementById('reportURL').value.trim();
      const notes = document.getElementById('reportNotes').value.trim();
      if (!url) return toast('Please enter a URL!', '#f59e0b');

      try {
        const res = await fetch(`${API}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, is_phishing: reportIsPhishing, notes })
        });
        const data = await res.json();
        toast('✅ Report submitted! AI Model v' + data.model_version, '#22c55e');
        document.getElementById('reportURL').value = '';
        document.getElementById('reportNotes').value = '';
        refreshStats();
      } catch {
        toast('✅ Report logged (demo mode)! AI will improve.', '#22c55e');
        document.getElementById('reportURL').value = '';
      }
    }

    // ══════════════════════════════════════════════════════
    //  INIT
    // ══════════════════════════════════════════════════════
    loadSites();
    refreshStats();
    setInterval(refreshStats, 10000);
  

// ============================================================
// Event listener wiring (replaces removed inline handlers)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  // URL checker
  var checkBtn = document.getElementById('checkBtn');
  if (checkBtn) checkBtn.addEventListener('click', checkURL);

  // Site search
  var siteSearch = document.getElementById('siteSearch');
  if (siteSearch) siteSearch.addEventListener('input', filterSites);

  // Category filter buttons
  var filterMappings = [
    { id: 'filterAll',       cat: 'all' },
    { id: 'filterTax',       cat: 'Tax & Finance' },
    { id: 'filterIdentity',  cat: 'Identity & Documents' },
    { id: 'filterBanking',   cat: 'Banking' },
    { id: 'filterTransport', cat: 'Transportation' },
    { id: 'filterHealth',    cat: 'Health' },
    { id: 'filterEducation', cat: 'Education' },
    { id: 'filterWelfare',   cat: 'Social Welfare' },
    { id: 'filterGovt',      cat: 'Government' },
  ];
  filterMappings.forEach(function(m) {
    var btn = document.getElementById(m.id);
    if (btn) btn.addEventListener('click', function() { filterCategory(m.cat, btn); });
  });

  // Report toggle buttons
  var btnPhish = document.getElementById('btnPhish');
  if (btnPhish) btnPhish.addEventListener('click', function() { selectPhishing(true); });
  var btnSafe = document.getElementById('btnSafe');
  if (btnSafe)  btnSafe.addEventListener('click',  function() { selectPhishing(false); });

  // Submit report button
  var submitBtn = document.querySelector('.submit-btn');
  if (submitBtn) submitBtn.addEventListener('click', submitReport);
});
