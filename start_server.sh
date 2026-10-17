#!/bin/bash
# WebSleuth AI -- IBM LinuxONE Server Startup
set -e
cd ~/trustshield
echo "Starting WebSleuth AI on IBM LinuxONE..."
pkill -f 'main.py' 2>/dev/null || true
sleep 1
source venv/bin/activate
nohup python main.py > trustshield.log 2>&1 &
echo "WebSleuth AI started! PID: $!"
echo "API : http://localhost:8000"
echo "Docs: http://localhost:8000/docs"
echo "Logs: tail -f ~/trustshield/trustshield.log"
