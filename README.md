TrustShield — AI Fake Website Detector
    

Real-time phishing and fake government website detection powered by AI — running on IBM LinuxONE.

TrustShield is a Chrome Extension that automatically analyzes every URL you visit and warns you if it's a scam, phishing site, or fake government portal. The AI backend runs exclusively on IBM LinuxONE — the world's most secure server platform — providing tamper-proof, pervasively-encrypted analysis at national scale.


Features
Real-time detection — Every URL analyzed in milliseconds as you browse
AI risk scoring — 0-100 heuristic risk score with confidence level and detailed reason
28 verified government sites — Cryptographically-signed registry of official Indian portals
Full-page warning overlay — Blocks interaction with dangerous sites using a Shadow DOM modal
Offline fallback — Works without the API using local heuristics (no internet required)
Community reporting — Report fake/safe sites to improve the AI model
IBM LinuxONE backend — Pervasive encryption, tamper-proof audit logs, 99.9999% uptime
Beautiful dashboard — URL checker, verified sites registry, live feed, report form


Architecture
┌─────────────────────────────────────────────────────────┐

│                    User's Browser                       │

│                                                         │

│  ┌──────────────┐    ┌──────────────┐                   │

│  │  Popup UI    │    │  Dashboard   │                   │

│  │  (popup.html)│    │(dashboard.html)                  │

│  └──────┬───────┘    └──────┬───────┘                   │

│         │                  │                            │

│  ┌──────▼──────────────────▼───────┐                   │

│  │     background.js (Service Worker)                  │

│  │   - URL interception            │                   │

│  │   - Risk analysis               │                   │

│  │   - Badge management            │                   │

│  └──────────────┬──────────────────┘                   │

│                 │ HTTP (localhost:8001)                 │

└─────────────────┼───────────────────────────────────────┘

                  │

          SSH Tunnel (Port Forward)

          localhost:8001 → :8000

                  │

┌─────────────────▼───────────────────────────────────────┐

│              IBM LinuxONE (s390x)                       │

│              Ubuntu 24.04 — 148.100.98.166              │

│                                                         │

│  ┌────────────────────────────────────────────────┐     │

│  │           FastAPI + Uvicorn (:8000)            │     │

│  │                                                │     │

│  │  POST /check-url  →  AI Risk Model             │     │

│  │  GET  /verified-sites  →  Gov Registry         │     │

│  │  GET  /stats           →  Live Metrics         │     │

│  │  POST /report          →  Feedback Loop        │     │

│  └────────────────────────────────────────────────┘     │

│                                                         │

│  Pervasive Encryption | HSM Key Mgmt | Tamper-Proof Log │

└─────────────────────────────────────────────────────────┘


Project Structure
project-apex/

├── backend/                  # IBM LinuxONE FastAPI server

│   ├── main.py               # FastAPI app + all endpoints

│   ├── model.py              # Phishing detection AI model

│   ├── verified_sites.py     # Verified government site registry

│   ├── requirements.txt      # Python dependencies

│   ├── start_server.sh       # Startup script for IBM LinuxONE

│   └── stop_server.sh        # Stop script

│

├── extension/                # Chrome Extension (Manifest V3)

│   ├── manifest.json         # Extension manifest

│   ├── background.js         # Service worker (URL analysis + badge)

│   ├── content.js            # Warning overlay (Shadow DOM modal)

│   ├── popup.html            # Extension popup UI

│   ├── popup.js              # Popup logic (report, dashboard)

│   ├── dashboard.html        # Full dashboard with URL checker

│   └── warning-banner.css    # Warning modal styles

│

├── deploy.sh                 # One-command IBM LinuxONE deployment

├── start-tunnel.ps1          # Windows: start SSH tunnel

├── .gitignore

└── README.md


Quick Start — Local Development
1. Run the backend locally
cd backend

pip install -r requirements.txt

python main.py

# API runs at http://localhost:8000

# Docs at   http://localhost:8000/docs
2. Load the Chrome Extension
Open Chrome → chrome://extensions/
Enable Developer Mode (top-right toggle)
Click Load Unpacked → select the extension/ folder
The TrustShield icon appears in your toolbar

For local testing, edit extension/background.js and change API_URL to http://localhost:8000


IBM LinuxONE Deployment
Prerequisites
SSH key: codeapex.pem (place in project root)
Server: linux1@148.100.98.166
One-command deploy
bash deploy.sh

This will:

Upload backend/ files via SCP
Create a Python virtual environment on the server
Install dependencies
Start the FastAPI server with nohup
Manual steps (if needed)
# Upload files

scp -i codeapex.pem backend/*.py backend/requirements.txt linux1@148.100.98.166:~/trustshield/

# SSH into server

ssh -i codeapex.pem linux1@148.100.98.166

# On the server

cd ~/trustshield

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

nohup python main.py > trustshield.log 2>&1 &


SSH Tunnel
Because IBM LinuxONE external port 8000 is restricted by cloud networking rules, we use an SSH local port forward to connect the Chrome Extension to the server.

Windows (PowerShell):

./start-tunnel.ps1

Linux/macOS:

ssh -i codeapex.pem -N \

    -L 8001:127.0.0.1:8000 \

    -o ServerAliveInterval=30 \

    linux1@148.100.98.166

Keep this tunnel running while using the extension. The extension connects to localhost:8001 which forwards to the IBM LinuxONE server.


Chrome Extension Installation
Start the SSH tunnel (see above)
Go to chrome://extensions/
Enable Developer Mode
Click Load Unpacked → select the extension/ folder
Browse any website — TrustShield analyzes it automatically
Click the shield icon to see risk details
Click Open Shield Dashboard for the full UI


API Reference
Method
Endpoint
Description
GET
/health
Server health check
GET
/
Service info and version
POST
/check-url
Analyze a URL for phishing risk
GET
/stats
Live statistics (total checks, threats, feedback)
GET
/verified-sites
List of 28+ verified government sites
POST
/report
Report a URL as phishing or safe
GET
/threats
Recent threats detected
GET
/recent-events
Recent URL check events

Example: Check a URL
curl -X POST http://localhost:8001/check-url \

  -H "Content-Type: application/json" \

  -d '{"url": "http://incometax-refund-claim.xyz"}'

{

  "url": "http://incometax-refund-claim.xyz",

  "is_phishing": true,

  "risk_score": 72,

  "confidence": 0.88,

  "reason": "Impersonates government domain; multiple suspicious keywords; not HTTPS",

  "model_version": 1

}


Tech Stack
Layer
Technology
Backend
Python 3.11, FastAPI, Uvicorn
AI Model
Heuristic rule engine (URL features, keyword analysis, domain similarity)
Server
IBM LinuxONE (s390x), Ubuntu 24.04
Extension
Chrome Extension Manifest V3, Vanilla JS, Shadow DOM
Security
SSH tunnel, IBM Pervasive Encryption, tamper-proof audit logs
Dashboard
Pure HTML/CSS/JS, JetBrains Mono, Inter font



Hackathon
Built for IBM LinuxONE Hackathon 2026 — demonstrating how IBM LinuxONE's unique security capabilities (pervasive encryption, HSM key management, 99.9999% uptime) can protect citizens from the growing epidemic of fake government websites and phishing attacks in India.

TrustShield processes every URL check with IBM LinuxONE's hardware-level encryption, making the analysis itself tamper-proof and impossible to compromise.


License
MIT License — see LICENSE for details.


TrustShield — Protecting citizens from fake government websites, powered by IBM LinuxONE
