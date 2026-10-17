"""
Patch dashboard.html:
1. Restore from v2 original
2. Fix API URL to port 8001
3. Add filter buttons for Social Welfare and Government
4. Replace EMBEDDED_SITES with 28 clean entries
"""
import shutil, re

SRC  = r'C:\Users\theja\Desktop\Project Apex\New v2\dashboard.html'
DEST = r'C:\Users\theja\Desktop\Project Apex\extension\dashboard.html'

shutil.copy2(SRC, DEST)
print("Restored from v2 original")

with open(DEST, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix API URL
content = content.replace(
    "const API = 'http://localhost:8000';",
    "const API = 'http://localhost:8001'; // IBM LinuxONE SSH Tunnel"
)
content = content.replace(
    'href="http://localhost:8000/docs"',
    'href="http://localhost:8001/docs"'
)
print("Fixed API URL -> port 8001")

# 2. Add filter buttons
old_btns = "      <button class=\"filter-btn\" onclick=\"filterCategory('Education', this)\">🎓 Education</button>\n    </div>"
new_btns = ("      <button class=\"filter-btn\" onclick=\"filterCategory('Education', this)\">🎓 Education</button>\n"
            "      <button class=\"filter-btn\" onclick=\"filterCategory('Social Welfare', this)\">👷 Welfare</button>\n"
            "      <button class=\"filter-btn\" onclick=\"filterCategory('Government', this)\">🇮🇳 Govt</button>\n"
            "    </div>")
if old_btns in content:
    content = content.replace(old_btns, new_btns)
    print("Added Social Welfare and Government filter buttons")
else:
    print("WARNING: Could not find filter button block")

# 3. Replace EMBEDDED_SITES
SITES = [
    ('Income Tax Portal','incometax.gov.in','https://www.incometax.gov.in','Tax & Finance','File ITR, check refund status, PAN services, Form 26AS','\U0001F4B0'),
    ('GST Portal','gst.gov.in','https://www.gst.gov.in','Tax & Finance','GST registration, filing, returns and payments','\U0001F9FE'),
    ('RBI','rbi.org.in','https://www.rbi.org.in','Tax & Finance','Reserve Bank of India - monetary policy, forex, regulation','\U0001F3E6'),
    ('SEBI','sebi.gov.in','https://www.sebi.gov.in','Tax & Finance','Securities and Exchange Board of India - market regulator','\U0001F4C8'),
    ('NSDL','nsdl.co.in','https://www.nsdl.co.in','Tax & Finance','PAN card, TDS certificates, tax e-payment services','\U0001FA99'),
    ('IRDAI','irdai.gov.in','https://www.irdai.gov.in','Tax & Finance','Insurance Regulatory and Development Authority of India','\U0001F6E1'),
    ('UIDAI Aadhaar','uidai.gov.in','https://www.uidai.gov.in','Identity & Documents','Aadhaar download, update, lock biometrics and e-KYC','\U0001FAAA'),
    ('Passport Seva','passportindia.gov.in','https://www.passportindia.gov.in','Identity & Documents','Passport application, renewal, tracking and Tatkaal','\U0001F6C2'),
    ('DigiLocker','digilocker.gov.in','https://www.digilocker.gov.in','Identity & Documents','Govt digital wallet for DL, RC, Aadhaar, marksheets','\U0001F4C2'),
    ('MCA21 Company Registry','mca.gov.in','https://www.mca.gov.in','Identity & Documents','Company registration, ROC filings, director info','\U0001F3E2'),
    ('State Bank of India','sbi.co.in','https://www.sbi.co.in','Banking',"India's largest bank - net banking, loans, deposits",'\U0001F3E7'),
    ('HDFC Bank','hdfcbank.com','https://www.hdfcbank.com','Banking','HDFC Bank - net banking, credit cards, home loans','\U0001F4B3'),
    ('ICICI Bank','icicibank.com','https://www.icicibank.com','Banking','ICICI Bank - net banking, iMobile Pay, investments','\U0001F3E6'),
    ('Bank of Baroda','bankofbaroda.in','https://www.bankofbaroda.in','Banking','Public sector bank - net banking, loans, deposits','\U0001F3DB'),
    ('Punjab National Bank','pnbindia.in','https://www.pnbindia.in','Banking','PNB - PNB One app, net banking, NRI services','\U0001F3E6'),
    ('EPFO','epfindia.gov.in','https://www.epfindia.gov.in','Social Welfare','Employee Provident Fund - balance check, UAN, withdrawal','\U0001F477'),
    ('PM Kisan','pmkisan.gov.in','https://www.pmkisan.gov.in','Social Welfare','PM Kisan Samman Nidhi - farmer income support scheme','\U0001F33E'),
    ('MSME Ministry','msme.gov.in','https://www.msme.gov.in','Social Welfare','Udyam registration, government schemes for businesses','\U0001F3ED'),
    ('National Voter Services','nvsp.in','https://www.nvsp.in','Social Welfare','Voter ID registration, electoral roll, booth search','\U0001F5F3'),
    ('IRCTC','irctc.co.in','https://www.irctc.co.in','Transportation','Indian Railways - official train ticket booking site','\U0001F684'),
    ('Indian Railways','indianrailways.gov.in','https://www.indianrailways.gov.in','Transportation','Official Indian Railways information and services portal','\U0001F682'),
    ('Ministry of Health','mohfw.gov.in','https://www.mohfw.gov.in','Health','Ministry of Health and Family Welfare - schemes, advisories','\U0001F3E5'),
    ('AIIMS New Delhi','aiims.edu','https://www.aiims.edu','Health','All India Institute of Medical Sciences - appointments','\u2695'),
    ('CBSE','cbse.gov.in','https://www.cbse.gov.in','Education','Board results, admit cards, school affiliation lookup','\U0001F393'),
    ('UGC','ugc.ac.in','https://www.ugc.ac.in','Education','University Grants Commission - NET exam, university list','\U0001F3EB'),
    ('NITI Aayog','niti.gov.in','https://www.niti.gov.in','Education','National policy think tank - research and development','\U0001F4CA'),
    ('India.gov.in','india.gov.in','https://www.india.gov.in','Government','National portal of India - all central government services','\U0001F1EE\U0001F1F3'),
    ('PIB India','pib.gov.in','https://pib.gov.in','Government','Press Information Bureau - official government press releases','\U0001F4F0'),
]

rows = []
for name, domain, url, cat, desc, icon in SITES:
    if "'" in name or "'" in desc:
        row = f'      {{ name:"{name}", domain:"{domain}", url:"{url}", category:"{cat}", description:"{desc}", icon:"{icon}" }}'
    else:
        row = f"      {{ name:'{name}', domain:'{domain}', url:'{url}', category:'{cat}', description:'{desc}', icon:'{icon}' }}"
    rows.append(row)

new_block = 'const EMBEDDED_SITES = [\n' + ',\n'.join(rows) + ',\n    ]'

start = content.find('const EMBEDDED_SITES = [')
end   = content.find('];', start) + 2
if start == -1:
    print("ERROR: EMBEDDED_SITES not found in file!")
else:
    content = content[:start] + new_block + content[end:]
    print(f"Replaced EMBEDDED_SITES with {len(SITES)} sites")

# 4. Fix loadSites() to render immediately and be robust
old_load = """    async function loadSites() {
      try {
        const res = await fetch(`${API}/verified-sites`);
        const data = await res.json();
        allSites = data.sites;
      } catch {
        // Use embedded fallback
        allSites = EMBEDDED_SITES;
      }
      renderSites(allSites);
    }"""

new_load = """    async function loadSites() {
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
    }"""

if old_load in content:
    content = content.replace(old_load, new_load)
    print("Fixed loadSites() to render immediately")
else:
    print("WARNING: loadSites() not found for patching")

# 5. Fix filterSites and renderSites for robustness
old_filter = "      const q = document.getElementById('siteSearch').value.toLowerCase();\n      let filtered = allSites;"
new_filter = "      const q = (document.getElementById('siteSearch').value || '').toLowerCase().trim();\n      let filtered = Array.isArray(allSites) ? allSites : EMBEDDED_SITES;"
content = content.replace(old_filter, new_filter)

old_render = "      if (!sites.length) {"
new_render = "      if (!Array.isArray(sites) || sites.length === 0) {"
content = content.replace(old_render, new_render)

print("Fixed filterSites and renderSites for robustness")

with open(DEST, 'w', encoding='utf-8') as f:
    f.write(content)

total = content.count("name:'") + content.count('name:"')
print(f"\nFINAL RESULT: {total} site entries in dashboard.html")
print("Dashboard is ready!")
