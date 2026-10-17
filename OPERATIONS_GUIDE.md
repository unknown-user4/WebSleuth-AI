# 🛡️ WebSleuth AI — Operations & Demo Guide
### Code Apex v5 | Final Submission | IBM LinuxONE Hackathon

---

## 📁 Folder Structure

```
code apex v5/
├── extension/              ← Chrome Extension (load THIS in Chrome)
│   ├── manifest.json
│   ├── background.js       ← Service worker (API calls + offline fallback)
│   ├── content.js          ← Warning overlay injected on phishing sites
│   ├── popup.html/js       ← Click extension icon → this appears
│   ├── dashboard.html      ← Full dashboard (28 verified sites, URL checker)
│   ├── dashboard.js        ← Dashboard logic (extracted for MV3 CSP compliance)
│   ├── warning-banner.css  ← Overlay styles
│   └── icons/              ← Extension icons (16, 48, 128px)
│
├── backend/                ← FastAPI server (runs on IBM LinuxONE)
│   ├── main.py             ← Main API server
│   ├── requirements.txt    ← Python dependencies
│   ├── start_server.sh     ← Start server script
│   └── stop_server.sh      ← Stop server script
│
├── start-tunnel.ps1        ← ⚡ Windows PowerShell — starts SSH tunnel
├── deploy.sh               ← Linux deploy script (SCP + server start)
├── README.md               ← Full project README
└── OPERATIONS_GUIDE.md     ← This file
```

---

## 🖥️ SYSTEM ARCHITECTURE

```
[User's Browser]
      |
      ↓ URL visit
[Chrome Extension]  ←── manifest.json (MV3)
      |
      ↓ POST /check-url  (via SSH tunnel)
[localhost:8001]   ←── SSH tunnel (your Windows PC)
      |
      ↓ forwarded to
[IBM LinuxONE Server]  148.100.98.166:8000
      |  linux1@148.100.98.166
      ↓
[FastAPI + AI Model v5]
      |
      ↓ JSON response: { risk_score, is_phishing, reason, model_version }
[Extension shows badge / overlay / popup]
```

---

## ⚡ STEP 1 — START THE SSH TUNNEL (Do this FIRST every time)

> The IBM LinuxONE server is not publicly accessible. You connect via SSH tunnel.

### Option A — Double-click (easiest)
1. Open `code apex v5/`
2. Right-click **`start-tunnel.ps1`** → **Run with PowerShell**
3. A hidden background process starts — tunnel is active

### Option B — PowerShell manually
```powershell
ssh -i "C:\Users\theja\.ssh\codeapex.pem" `
    -N -L 8001:127.0.0.1:8000 `
    -o StrictHostKeyChecking=no `
    -o ServerAliveInterval=30 `
    linux1@148.100.98.166
```

### ✅ Verify tunnel is working
Open browser → go to: `http://localhost:8001/health`

You should see:
```json
{"status": "healthy", "model_version": "v5", "checks": 70, "threats": 14}
```

---

## 🌐 STEP 2 — LOAD EXTENSION IN CHROME

1. Open Chrome → address bar → type `chrome://extensions/`
2. Enable **Developer mode** (toggle, top-right)
3. Click **"Load unpacked"**
4. Navigate to: `C:\Users\theja\Desktop\code apex v5\extension\`
5. Click **"Select Folder"**

### ✅ Verify it loaded correctly
- WebSleuth AI should appear in the extensions list
- Version: **2.0**
- Click **"Errors"** → should say **No errors**
- Click the 🛡️ shield icon in toolbar → popup appears

---

## 🖥️ SERVER MANAGEMENT (IBM LinuxONE)

### SSH into the server
```bash
ssh -i C:\Users\theja\.ssh\codeapex.pem linux1@148.100.98.166
```

### Check if server is running
```bash
ps aux | grep main.py
```
Expected output:
```
linux1   12345  0.5  2.1  python main.py
```

### Start the server (if not running)
```bash
cd ~/trustshield
source venv/bin/activate
nohup python main.py > server.log 2>&1 &
echo "Server started. PID: $!"
```

### Stop the server
```bash
pkill -f "python main.py"
# or use the PID from ps aux:
kill <PID>
```

### Restart the server
```bash
pkill -f "python main.py"
sleep 2
cd ~/trustshield
source venv/bin/activate
nohup python main.py > server.log 2>&1 &
echo "Server restarted."
```

---

## 📋 SERVER LOGS

### View live logs (streaming)
```bash
tail -f ~/trustshield/server.log
```
Press `Ctrl+C` to stop watching.

### View last 50 lines of logs
```bash
tail -50 ~/trustshield/server.log
```

### View full log file
```bash
cat ~/trustshield/server.log
```

### Search logs for errors
```bash
grep -i "error\|exception\|traceback" ~/trustshield/server.log
```

### Search logs for specific IP or request
```bash
grep "148.100" ~/trustshield/server.log
grep "check-url" ~/trustshield/server.log
```

### Check how many URLs were scanned
```bash
grep "check-url" ~/trustshield/server.log | wc -l
```

### Clear logs (start fresh)
```bash
> ~/trustshield/server.log
echo "Log cleared."
```

### Sample healthy log output
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     127.0.0.1 - "POST /check-url HTTP/1.1" 200 OK
INFO:     127.0.0.1 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1 - "GET /verified-sites HTTP/1.1" 200 OK
```

---

## 📡 API ENDPOINTS REFERENCE

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check, model version, stats |
| `/check-url` | POST | Analyze a URL for phishing risk |
| `/verified-sites` | GET | Get list of 28 verified govt sites |
| `/report` | POST | Submit user report of fake/safe site |
| `/stats` | GET | Total checks, threats detected, model version |

### Test the API manually
```bash
# Health check
curl http://localhost:8001/health

# Check a URL
curl -X POST http://localhost:8001/check-url \
  -H "Content-Type: application/json" \
  -d '{"url": "http://sbi-login-verify-kyc.xyz"}'

# Expected response for phishing site:
# {"risk_score": 87, "is_phishing": true, "reason": "suspicious domain pattern", "model_version": "v5"}
```

---

## 🧪 HOW TO DEMO — STEP BY STEP

### Demo Flow (5 minutes)

**1. Show the popup (30 sec)**
- Visit any safe site: `https://incometax.gov.in`
- Click WebSleuth AI icon → shows green badge + "Trusted Site"

**2. Trigger the warning overlay (1 min)**
- Visit: `http://sbi-login-verify-kyc.xyz`
- Full-screen red warning overlay fires automatically
- Show the "Leave Site" button works
- Show "Proceed Anyway" (logs user confirmation)

**3. Show the dashboard (2 min)**
- Click extension icon → **"Open WebSleuth AI Dashboard"**
- Shows 28 verified government websites
- Demo search: type "income tax" → filters live
- Demo filter buttons: Tax, Banking, Welfare, Govt
- Demo URL checker: paste `http://incometax-refund-claim.xyz` → shows risk score

**4. Show IBM LinuxONE connection (1 min)**
- Open `http://localhost:8001/health` in browser
- Show live stats: checks performed, threats detected, model version v5
- Explain: *"This response came from IBM LinuxONE in real-time"*

**5. Show report feature (30 sec)**
- In dashboard → scroll to "Report a Website"
- Paste a phishing URL → mark as Fake → Submit
- Toast notification confirms submission to AI model

---

## 🚨 TROUBLESHOOTING

### Extension shows no popup / badge
- Make sure SSH tunnel is running (Step 1)
- Check `http://localhost:8001/health` works in browser
- Reload extension: `chrome://extensions/` → WebSleuth AI → 🔄

### Dashboard shows 0 sites / blank
- Open Chrome DevTools on dashboard: `F12` → Console tab
- Check for errors
- Most likely: tunnel not running → start tunnel, reload dashboard

### SSH tunnel drops / disconnects
- Re-run `start-tunnel.ps1`
- If PEM key error: make sure `codeapex.pem` is in `C:\Users\theja\.ssh\`

### Server not responding on LinuxONE
```bash
ssh -i C:\Users\theja\.ssh\codeapex.pem linux1@148.100.98.166
ps aux | grep main.py        # check if running
tail -20 ~/trustshield/server.log   # check for errors
# If crashed, restart:
cd ~/trustshield && source venv/bin/activate
nohup python main.py > server.log 2>&1 &
```

### Chrome Extension Errors
- Go to `chrome://extensions/` → WebSleuth AI → **Errors**
- If CSP error: make sure you loaded `code apex v5/extension/` (not the old backup)
- If "Service worker error": reload extension

### Warning overlay not firing
- Make sure you're visiting HTTP (not HTTPS) phishing test URLs
- Threshold is risk_score ≥ 45
- Try: `http://sbi-login-verify-kyc.xyz` or `http://incometax-refund-claim.xyz`

---

## 🔐 SSH KEY LOCATION

```
C:\Users\theja\.ssh\codeapex.pem   ← Primary location (for SSH commands)
C:\Users\theja\Desktop\code apex v5\codeapex.pem   ← Backup copy
```

> ⚠️ NEVER commit `codeapex.pem` to GitHub. It is listed in `.gitignore`.

---

## 📦 GITHUB UPLOAD CHECKLIST

Before pushing to GitHub:
- [ ] Delete or exclude: `codeapex.pem` (already in `.gitignore`)
- [ ] Delete or exclude: `extension_backup_v1/`
- [ ] Delete or exclude: `New v2/`
- [ ] Delete or exclude: `fix_sites.py` (internal tooling)
- [ ] Keep: `extension/`, `backend/`, `README.md`, `.gitignore`, `deploy.sh`, `start-tunnel.ps1`

**Recommended git commands:**
```bash
git init
git add .
git commit -m "WebSleuth AI v2 - IBM LinuxONE AI phishing detector - Code Apex v5"
git remote add origin https://github.com/YOUR_USERNAME/websleuth-ai.git
git push -u origin main
```

---

## 🏆 KEY TALKING POINTS (For Judges)

1. **Real AI on Real Hardware** — Not a mock. The AI model (v5) is live on IBM LinuxONE at `148.100.98.166`
2. **Hardware Encryption** — IBM LinuxONE's CPACF chip encrypts every URL check at the hardware level
3. **Offline Fallback** — Extension works even without internet via local heuristic model
4. **MV3 Compliant** — Built to Chrome's latest Manifest V3 security standard (no inline scripts)
5. **28 Verified Sites** — Curated database of legitimate Indian government portals
6. **Zero False Positives on Gov Sites** — Whitelist system ensures legitimate portals are never flagged
7. **India-specific** — Trained on Indian phishing patterns: fake IRCTC, SBI, ITR, Aadhaar portals

---

*WebSleuth AI v2 | Code Apex | IBM LinuxONE Hackathon 2026*
