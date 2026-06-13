---
title: "Termux Headless Setup"
version: 3.8.2
lastUpdated: 2026-05-13
---

# Termux Headless Setup

SZRoute can run as a headless server on Android through Termux. The Electron desktop app is not supported in Termux, but the web dashboard and OpenAI-compatible API work from the local browser or from other devices on the same network.

## Prerequisites

Install Termux from F-Droid or GitHub releases, then update packages and install the build tools required by native dependencies such as `better-sqlite3`.

```bash
pkg update
pkg upgrade
pkg install nodejs-lts python build-essential git
```

> **Node.js version:** SZRoute requires Node `>=20.20.2 <21 || >=22.22.2 <23 || >=24.0.0 <27` (per `engines` in `package.json`). Termux's `nodejs-lts` typically ships Node 20 LTS, which is compatible. If `node --version` reports an older line, install `pkg install nodejs` (current) and verify the major matches a supported range.

If native package compilation fails, rerun the `pkg install` command above and then retry the SZRoute install.

## Install

Run the latest published package directly:

```bash
npx -y szroute@latest
```

You can also install it globally:

```bash
npm install -g szroute
szroute
```

## Run

Start SZRoute in headless server mode:

```bash
szroute
```

or:

```bash
npx szroute
```

The dashboard listens on:

```text
http://localhost:21128
```

Open that URL in the Android browser. If you run clients inside Termux, use the same host and port as the OpenAI-compatible base URL.

## Background Execution

For a simple background process:

```bash
nohup szroute > szroute.log 2>&1 &
```

To stop it:

```bash
pkill -f szroute
```

For automatic startup after device boot, install the Termux:Boot add-on and create a boot script:

```bash
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/szroute.sh <<'EOF'
#!/data/data/com.termux/files/usr/bin/sh
cd "$HOME"
nohup szroute > "$HOME/szroute.log" 2>&1 &
EOF
chmod +x ~/.termux/boot/szroute.sh
```

Android battery optimization can stop long-running background processes. Disable battery optimization for Termux if the server is expected to stay online.

## Access From Other Devices

Find the phone IP address on the WiFi network:

```bash
ip addr show wlan0
```

Then open the dashboard from another device:

```text
http://PHONE_IP:21128
```

For example:

```text
http://192.168.1.50:21128
```

Keep the phone and client on the same trusted network. If you expose SZRoute outside the phone, enable API keys and dashboard authentication.

## Data Directory

By default SZRoute stores data under the Termux home directory, following the same server-side data path behavior used on Linux. To place the database somewhere explicit:

```bash
export DATA_DIR="$HOME/.szroute"
szroute
```

## Limitations

- Electron does not run in Termux.
- There is no system tray or desktop integration.
- This setup is server-only: use the browser dashboard.
- Native dependencies may need local compilation.
- Low-memory Android devices may need fewer concurrent requests.
- MITM/system certificate features may require Android-level trust-store work outside Termux.

## Troubleshooting

### better-sqlite3 Build Errors

Install the Termux build toolchain:

```bash
pkg install nodejs-lts python build-essential
```

Then rerun:

```bash
npx -y szroute@latest
```

### Port Already In Use

Check what is listening on the default port:

```bash
ss -ltnp | grep 21128
```

Stop the old process:

```bash
pkill -f szroute
```

### Dashboard Not Reachable From Another Device

Verify both devices are on the same WiFi network, then test from Termux:

```bash
curl http://localhost:21128
```

If local access works but LAN access does not, check Android hotspot/WiFi isolation and any firewall or VPN profile on the phone.
