#!/bin/bash
# WebSleuth AI — Deploy to IBM LinuxONE
# Usage: bash deploy.sh
# Requires: codeapex.pem in the project root

set -e

KEY="./codeapex.pem"
SERVER="linux1@148.100.98.166"
REMOTE="~/trustshield"

if [ ! -f "$KEY" ]; then
  echo "ERROR: codeapex.pem not found. Place it in the project root."
  exit 1
fi

echo ""
echo "  WebSleuth AI -- Deploying to IBM LinuxONE"
echo "  Server : $SERVER"
echo "  Remote : $REMOTE"
echo ""

# Upload backend files
echo "[1/3] Uploading backend files..."
scp -i "$KEY" \
  backend/main.py \
  backend/model.py \
  backend/verified_sites.py \
  backend/requirements.txt \
  backend/start_server.sh \
  backend/stop_server.sh \
  "$SERVER:$REMOTE/"

echo "[2/3] Setting up Python environment and installing dependencies..."
ssh -i "$KEY" "$SERVER" << 'ENDSSH'
cd ~/trustshield
chmod +x start_server.sh stop_server.sh
if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "  Virtual environment created."
fi
source venv/bin/activate
pip install -r requirements.txt -q
echo "  Dependencies installed."
ENDSSH

echo "[3/3] Starting WebSleuth AI server..."
ssh -i "$KEY" "$SERVER" "cd ~/trustshield && bash start_server.sh"

echo ""
echo "  Deployment complete!"
echo ""
echo "  To connect to server :"
echo "    ssh -i codeapex.pem linux1@148.100.98.166"
echo ""
echo "  To start SSH tunnel (run on your local PC):"
echo "    ssh -i codeapex.pem -N -L 8001:127.0.0.1:8000 linux1@148.100.98.166"
echo "    (or just run: powershell ./start-tunnel.ps1)"
echo ""
echo "  API Docs: http://localhost:8001/docs"
echo ""
