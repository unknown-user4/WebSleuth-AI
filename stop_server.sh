#!/bin/bash
# WebSleuth AI -- Stop Server
pkill -f 'main.py' && echo "WebSleuth AI stopped." || echo "WebSleuth AI was not running."
