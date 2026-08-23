import subprocess
import time
import sys
import re

print("Starting persistent high-capacity tunnel...")

def run_tunnel():
    cmd = [
        r"C:\Program Files\nodejs\node.exe",
        r"C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js",
        "--yes",
        "localtunnel",
        "--port",
        "8000",
        "--subdomain",
        "mindshield-sih-ai"
    ]
    while True:
        try:
            print("[Tunnel] Launching tunnel...")
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            for line in proc.stdout:
                sys.stdout.write(line)
                sys.stdout.flush()
            proc.wait()
            print("[Tunnel] Reconnecting in 3 seconds...")
            time.sleep(3)
        except Exception as e:
            print("[Tunnel Error]", e)
            time.sleep(5)

if __name__ == "__main__":
    run_tunnel()
